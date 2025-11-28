/* eslint-disable no-console */
import { create } from "zustand";

import {
  BOOSTER_COSTS,
  Level,
  MAX_HEARTS,
  Progress,
  SessionMode,
  SessionResult,
  Skill,
  SKILLS,
} from "./types";
import {
  createInitialProgress,
  hydrateProgress,
  isSameDay,
  shouldRefillHearts,
  toISODateTime,
} from "./progress";
import { generateSeedLevels } from "./seed";
import {
  SessionPerformance,
  buildRoundsForLevel,
  calculateScore,
  resolveRewards,
  resolveStars,
} from "./session";
import {
  applyQuestProgress,
  initializeDailyQuests,
  questRewardFor,
} from "./quests";
import {
  SchedulerEntry,
  integrateSchedulerResult,
  seedScheduler,
  selectPracticeSkills,
} from "./scheduler";

const STORAGE_KEY = "learn-soccer-progress-v1";

type BoosterKind = "extraHeart" | "starDoubler" | "gateKey" | "streakFreeze";

type ActiveSession = {
  levelId: string;
  mode: SessionMode;
  startedAt: string;
  rounds: ReturnType<typeof buildRoundsForLevel>;
  booster: {
    starDoubler: boolean;
  };
};

type GameState = {
  levels: Level[];
  progress: Progress;
  scheduler: SchedulerEntry[];
  selectedLevelId: string | null;
  activeSession: ActiveSession | null;
  practiceQueue: Skill[];
  isHydrated: boolean;
  isDirty: boolean;
  pendingStarDoubler: boolean;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  selectLevel: (levelId: string | null) => void;
  refreshDailyState: () => void;
  startSession: (levelId: string, mode: SessionMode) => ActiveSession | null;
  registerPerformance: (
    levelId: string,
    performance: SessionPerformance,
    mode: SessionMode,
  ) => SessionResult | null;
  endSession: (result: SessionResult, mode: SessionMode) => void;
  earnXP: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  loseHeart: (count?: number) => void;
  regainHeart: (count?: number) => void;
  addStars: (levelId: string, stars: 0 | 1 | 2 | 3) => void;
  openGate: (levelId: string, useKey?: boolean) => boolean;
  applyBooster: (booster: BoosterKind, targetLevelId?: string) => boolean;
  purchaseBooster: (booster: BoosterKind) => boolean;
  refreshPracticeQueue: () => void;
};

const readLocalProgress = (): Progress | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return hydrateProgress(JSON.parse(raw));
  } catch (error) {
    console.warn("[progress] failed to read local storage", error);
    return null;
  }
};

const writeLocalProgress = (progress: Progress) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("[progress] failed to write local storage", error);
  }
};

const fetchRemoteProgress = async (): Promise<Progress | null> => {
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return hydrateProgress(data);
  } catch (error) {
    console.warn("[progress] failed to fetch remote", error);
    return null;
  }
};

const pushRemoteProgress = async (progress: Progress) => {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    });
  } catch (error) {
    console.warn("[progress] failed to persist remote", error);
  }
};

const starsForWorld = (progress: Progress, world: number, levels: Level[]) => {
  const ids = levels
    .filter((level) => level.world === world && !level.gate)
    .map((level) => level.id);
  return ids.reduce((sum, id) => sum + (progress.stars[id] ?? 0), 0);
};

const requiredStarsForGate = (world: number) => 35 * world;

const updateLockedState = (
  levels: Level[],
  progress: Progress,
): Level[] => {
  const unlocked = new Set<string>();
  const result = levels.map((level) => ({ ...level }));
  const starsRecord = progress.stars;

  result.forEach((level) => {
    if (level.number <= 5) {
      unlocked.add(level.id);
    }
  });

  result.forEach((level) => {
    const starsEarned = starsRecord[level.id] ?? 0;
    if (starsEarned > 0) {
      unlocked.add(level.id);
      level.neighbors.forEach((neighborId) => {
        unlocked.add(neighborId);
      });
    }
  });

  progress.gatesOpened.forEach((gateId) => {
    const gate = result.find((lvl) => lvl.id === gateId);
    if (gate) {
      unlocked.add(gateId);
      gate.neighbors.forEach((neighborId) => unlocked.add(neighborId));
    }
  });

  return result.map((level) => ({
    ...level,
    locked:
      level.gate && !progress.gatesOpened.includes(level.id)
        ? true
        : !unlocked.has(level.id),
  }));
};

const baseLevels = generateSeedLevels();

export const useGameStore = create<GameState>((set, get) => {
  const initialProgress = createInitialProgress();
  return {
  levels: updateLockedState(baseLevels, initialProgress),
  progress: initialProgress,
  scheduler: seedScheduler(),
  selectedLevelId: null,
  activeSession: null,
  practiceQueue: SKILLS.slice(0, 3),
  isHydrated: false,
  isDirty: false,
  pendingStarDoubler: false,
  loadProgress: async () => {
    if (get().isHydrated) return;
    const local = readLocalProgress();
    const remote = !local ? await fetchRemoteProgress() : null;
    const resolved = hydrateProgress(local ?? remote ?? createInitialProgress());

    set((state) => ({
      progress: resolved,
      levels: updateLockedState(state.levels, resolved),
      isHydrated: true,
    }));

    get().refreshDailyState();
    get().refreshPracticeQueue();
  },
  saveProgress: async () => {
    const progress = get().progress;
    writeLocalProgress(progress);
    await pushRemoteProgress(progress);
    set({ isDirty: false });
  },
  selectLevel: (levelId) => set({ selectedLevelId: levelId }),
  refreshDailyState: () => {
    set((state) => {
      const now = new Date();
      const isoNow = toISODateTime(now);
      const progress = { ...state.progress };
      const lastPlayed = progress.lastPlayedISO;

      const dayChanged = lastPlayed ? !isSameDay(lastPlayed, isoNow) : false;

      if (shouldRefillHearts(progress.lastHeartsRefillISO)) {
        progress.hearts = MAX_HEARTS;
        progress.lastHeartsRefillISO = isoNow;
      }

      if (dayChanged || progress.dailyQuests.length === 0) {
        progress.dailyQuests = initializeDailyQuests();
      }

      if (dayChanged && !progress.streakFreezeArmed) {
        progress.streakDays = 0;
      }

      if (dayChanged && progress.streakFreezeArmed) {
        progress.streakFreezeArmed = false;
      }

      return { progress, isDirty: true };
    });
  },
  startSession: (levelId, mode) => {
    const levels = get().levels;
    const level = levels.find((lvl) => lvl.id === levelId);
    if (!level) return null;
    const pendingStarDoubler = get().pendingStarDoubler;

    const session: ActiveSession = {
      levelId,
      mode,
      startedAt: toISODateTime(),
      rounds: buildRoundsForLevel(level),
      booster: {
        starDoubler: pendingStarDoubler,
      },
    };

    set({ activeSession: session, pendingStarDoubler: false });

    return session;
  },
  registerPerformance: (levelId, performance, mode) => {
    const { levels, activeSession } = get();
    const level = levels.find((lvl) => lvl.id === levelId);
    if (!level) return null;

    const score = calculateScore(performance, level.thresholds);
    const stars = resolveStars(score, level.thresholds);
    const doublerActive =
      !!(activeSession?.booster.starDoubler && mode === "play");
    const rewards = resolveRewards(level, stars, mode, doublerActive);

    const result: SessionResult = {
      levelId,
      score,
      stars,
      xpGained: rewards.xp,
      coinsGained: rewards.coins,
      missed: performance.missed,
      ts: toISODateTime(),
    };

    get().endSession(result, mode);

    return result;
  },
  endSession: (result, mode) => {
    set((state) => {
      const levels = state.levels;
      const level = levels.find((lvl) => lvl.id === result.levelId);
      if (!level) {
        return { activeSession: null };
      }

      const progress: Progress = {
        ...state.progress,
        stars: { ...state.progress.stars },
        gatesOpened: [...state.progress.gatesOpened],
        inventory: { ...state.progress.inventory },
      };

      const existingStars = progress.stars[result.levelId] ?? 0;
      if (result.stars > existingStars) {
        progress.stars[result.levelId] = result.stars;
      }

      progress.xp += result.xpGained;
      progress.coins += result.coinsGained;
      progress.weeklyLeaguePoints += result.xpGained;
      let quests = progress.dailyQuests.length
        ? progress.dailyQuests.map((quest) => ({ ...quest }))
        : initializeDailyQuests();
      const beforeCompletion = new Map(
        quests.map((quest) => [quest.id, quest.completed]),
      );

      if (mode === "play") {
        quests = applyQuestProgress(quests, "finish_two_sessions", 1);
      }

      if (result.stars > 0) {
        quests = applyQuestProgress(quests, "earn_five_stars", result.stars);
      }

      if (mode === "practice") {
        const scanningQuest = questRewardFor("practice_scanning");
        if (
          scanningQuest?.skillTarget &&
          level.skills.includes(scanningQuest.skillTarget)
        ) {
          quests = applyQuestProgress(quests, "practice_scanning", 1);
        }
      }
      const previousLastPlayed = progress.lastPlayedISO;
      progress.lastPlayedISO = result.ts;

      if (mode === "play" && result.stars === 0) {
        progress.hearts = Math.max(progress.hearts - 1, 0);
      }
      if (mode === "play" && result.stars === 3 && progress.hearts < MAX_HEARTS) {
        progress.hearts += 1;
      }

      if (
        result.stars > 0 &&
        (!previousLastPlayed || !isSameDay(previousLastPlayed, result.ts))
      ) {
        progress.streakDays += 1;
        if (progress.streakFreezeArmed) {
          progress.streakFreezeArmed = false;
        }
      }

      if (!isSameDay(progress.lastHeartsRefillISO, result.ts)) {
        progress.lastHeartsRefillISO = result.ts;
      }

      quests.forEach((quest) => {
        const wasComplete = beforeCompletion.get(quest.id);
        if (!wasComplete && quest.completed) {
          const reward = questRewardFor(quest.id);
          if (reward) {
            progress.coins += reward.rewardCoins;
            progress.xp += reward.rewardXP;
            progress.weeklyLeaguePoints += reward.rewardXP;
          }
        }
      });

      progress.dailyQuests = quests;

      const baseQuality = Math.max(
        1,
        Math.min(5, Math.round(result.score / 20)),
      );
      const scheduler = level.skills.reduce((current, skill, index) => {
        const adjustment = Math.max(1, Math.min(5, baseQuality - index));
        return integrateSchedulerResult(current, skill, adjustment);
      }, state.scheduler);

      const updatedLevels = updateLockedState(levels, progress);

      return {
        progress,
        levels: updatedLevels,
        scheduler,
        practiceQueue: selectPracticeSkills(scheduler),
        activeSession: null,
        isDirty: true,
      };
    });
  },
  earnXP: (amount) =>
    set((state) => ({
      progress: { ...state.progress, xp: state.progress.xp + Math.max(0, amount) },
      isDirty: true,
    })),
  spendCoins: (amount) => {
    if (amount <= 0) return false;
    const available = get().progress.coins;
    if (available < amount) return false;
    set((state) => ({
      progress: { ...state.progress, coins: state.progress.coins - amount },
      isDirty: true,
    }));
    return true;
  },
  loseHeart: (count = 1) =>
    set((state) => ({
      progress: {
        ...state.progress,
        hearts: Math.max(0, state.progress.hearts - count),
      },
      isDirty: true,
    })),
  regainHeart: (count = 1) =>
    set((state) => ({
      progress: {
        ...state.progress,
        hearts: Math.min(MAX_HEARTS, state.progress.hearts + count),
      },
      isDirty: true,
    })),
  addStars: (levelId, stars) =>
    set((state) => {
      const existing = state.progress.stars[levelId] ?? 0;
      if (stars <= existing) {
        return {};
      }
      const progress: Progress = {
        ...state.progress,
        stars: { ...state.progress.stars, [levelId]: stars },
      };
      return {
        progress,
        levels: updateLockedState(state.levels, progress),
        isDirty: true,
      };
    }),
  openGate: (levelId, useKey = false) => {
    const { progress, levels } = get();
    const level = levels.find((lvl) => lvl.id === levelId);
    if (!level || !level.gate) return false;
    if (progress.gatesOpened.includes(levelId)) return true;

    const worldStars = starsForWorld(progress, level.world, levels);
    const requiredStars = requiredStarsForGate(level.world);

    if (!useKey && worldStars < requiredStars) {
      return false;
    }

    if (useKey && progress.inventory.keys <= 0) {
      return false;
    }

    set((state) => {
      const nextProgress: Progress = {
        ...state.progress,
        gatesOpened: [...state.progress.gatesOpened, levelId],
        inventory: { ...state.progress.inventory },
      };

      if (useKey) {
        nextProgress.inventory.keys = Math.max(
          0,
          nextProgress.inventory.keys - 1,
        );
      }

      return {
        progress: nextProgress,
        levels: updateLockedState(state.levels, nextProgress),
        isDirty: true,
      };
    });

    return true;
  },
  applyBooster: (booster, targetLevelId) => {
    if (booster === "gateKey") {
      if (!targetLevelId) return false;
      return get().openGate(targetLevelId, true);
    }

    const mapping: Record<Exclude<BoosterKind, "gateKey">, keyof Progress["inventory"]> = {
      extraHeart: "extraHearts",
      starDoubler: "doubler",
      streakFreeze: "freeze",
    };

    const inventoryKey = mapping[booster as Exclude<BoosterKind, "gateKey">];
    const stash = get().progress.inventory[inventoryKey];
    if (stash <= 0) return false;

    set((state) => {
      const progress: Progress = {
        ...state.progress,
        inventory: { ...state.progress.inventory },
      };
      progress.inventory[inventoryKey] -= 1;

      if (booster === "extraHeart") {
        progress.hearts = Math.min(progress.hearts + 1, MAX_HEARTS);
      }
      if (booster === "streakFreeze") {
        progress.streakFreezeArmed = true;
      }
      let activeSession = state.activeSession;
      if (booster === "starDoubler") {
        if (state.activeSession) {
          activeSession = {
            ...state.activeSession,
            booster: { ...state.activeSession.booster, starDoubler: true },
          };
        } else {
          return {
            progress,
            levels: updateLockedState(state.levels, progress),
            isDirty: true,
            pendingStarDoubler: true,
          };
        }
      }
      return {
        progress,
        levels: updateLockedState(state.levels, progress),
        isDirty: true,
        activeSession,
      };
    });
    return true;
  },
  purchaseBooster: (booster) => {
    const cost = BOOSTER_COSTS[booster];
    if (cost == null) return false;
    const success = get().spendCoins(cost);
    if (!success) return false;

    const mapping: Record<BoosterKind, keyof Progress["inventory"]> = {
      extraHeart: "extraHearts",
      starDoubler: "doubler",
      gateKey: "keys",
      streakFreeze: "freeze",
    };

    const inventoryKey = mapping[booster];

    set((state) => ({
      progress: {
        ...state.progress,
        inventory: {
          ...state.progress.inventory,
          [inventoryKey]: state.progress.inventory[inventoryKey] + 1,
        },
      },
      isDirty: true,
    }));

    return true;
  },
  refreshPracticeQueue: () =>
    set((state) => ({
      practiceQueue: selectPracticeSkills(state.scheduler),
    })),
  };
});

export type { GameState };
