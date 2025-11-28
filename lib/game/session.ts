import { Level, SessionMode, Skill } from "./types";

export type RoundMedia =
  | { type: "video"; src: string; poster?: string; alt: string }
  | { type: "image"; src: string; alt: string }
  | null;

export type RoundQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type SessionRound = {
  id: string;
  skill: Skill;
  title: string;
  instruction: string;
  media: RoundMedia;
  quiz?: RoundQuiz;
  requiresEffortRating: boolean;
};

export type SessionPerformance = {
  correctAnswers: number;
  totalQuestions: number;
  avgEffort: number; // 1..5
  timeSeconds: number;
  missed: number;
  scoreOverride?: number;
};

const BASE_XP_MAP: Record<number, number> = {
  1: 10,
  2: 10,
  3: 15,
  4: 15,
  5: 20,
  6: 20,
};

const STAR_XP_BONUS = 5;

const COIN_REWARDS: Record<0 | 1 | 2 | 3, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
};

export const calculateScore = (
  performance: SessionPerformance,
  thresholds: Level["thresholds"],
): number => {
  if (performance.scoreOverride != null) {
    return Math.max(0, Math.min(100, performance.scoreOverride));
  }

  const accuracy =
    performance.totalQuestions === 0
      ? 1
      : performance.correctAnswers / performance.totalQuestions;
  const effort = performance.avgEffort / 5;

  const timeScore = Math.max(
    0,
    1 - performance.timeSeconds / (performance.totalQuestions * 30 || 120),
  );

  const weighted =
    accuracy * 0.55 + effort * 0.35 + Math.max(timeScore, 0.1) * 0.1;
  const base = weighted * 100;

  // Encourage minimal misses
  const missPenalty = Math.min(performance.missed * 5, 25);

  const score = Math.round(base - missPenalty);

  // Soft floor
  if (score >= thresholds.one) {
    return score;
  }

  return Math.max(score, thresholds.one - 15);
};

export const resolveStars = (
  score: number,
  thresholds: Level["thresholds"],
): 0 | 1 | 2 | 3 => {
  if (score >= thresholds.three) return 3;
  if (score >= thresholds.two) return 2;
  if (score >= thresholds.one) return 1;
  return 0;
};

export const resolveRewards = (
  level: Level,
  stars: 0 | 1 | 2 | 3,
  mode: SessionMode,
  doublerActive: boolean,
) => {
  const baseXp = BASE_XP_MAP[level.world] ?? 10;
  const xpReward = baseXp + stars * STAR_XP_BONUS;
  const coins = COIN_REWARDS[stars];

  if (mode === "practice") {
    return {
      xp: Math.round(xpReward * 0.5),
      coins: Math.round(coins * 0.5),
    };
  }

  return {
    xp: xpReward,
    coins: doublerActive ? coins * 2 : coins,
  };
};

export const buildRoundsForLevel = (level: Level): SessionRound[] => {
  const baseMedia: Record<Skill, RoundMedia> = {
    first_touch: {
      type: "image",
      src: "/media/first-touch.svg",
      alt: "Player receiving the ball with the inside of the foot",
    },
    scanning: {
      type: "image",
      src: "/media/scanning.svg",
      alt: "Player checking over their shoulder while dribbling",
    },
    passing: {
      type: "image",
      src: "/media/passing.svg",
      alt: "Player preparing a through pass down the wing",
    },
    turning: {
      type: "image",
      src: "/media/turning.svg",
      alt: "Player shielding the ball while turning away",
    },
    press_break: {
      type: "image",
      src: "/media/press-break.svg",
      alt: "Midfielder splitting defenders to break a press",
    },
    finishing: {
      type: "image",
      src: "/media/finishing.svg",
      alt: "Striker curling a shot into the top corner",
    },
  };

  return level.skills.slice(0, 3).map((skill, index) => {
    const id = `${level.id}-round-${index + 1}`;
    const title = [
      "See it & plan",
      "Clip replay",
      "Decision check",
      "Own it",
    ][index] ?? `Challenge ${index + 1}`;

    const instruction = [
      "Preview the technique focus and plan your approach.",
      "Watch the play and visualize the correct movement.",
      "Make the read and choose the best option.",
      "Rate your execution and lock in the feel.",
    ][index] ?? "Stay sharp and trust your touches.";

    const quiz: RoundQuiz | undefined =
      index === 2
        ? {
            question: "What is the best option in this scenario?",
            options: [
              "Hold the ball and wait",
              "Play the one-touch pass",
              "Turn into the press",
              "Chip it long",
            ],
            answerIndex: 1,
          }
        : undefined;

    return {
      id,
      skill,
      title,
      instruction,
      media: baseMedia[skill],
      quiz,
      requiresEffortRating: true,
    };
  });
};
