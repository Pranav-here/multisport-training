import { Progress } from "./types";

const makeInventory = () => ({
  keys: 0,
  freeze: 0,
  doubler: 0,
  extraHearts: 0,
});

export const createInitialProgress = (): Progress => ({
  xp: 0,
  coins: 0,
  stars: {},
  hearts: 5,
  streakDays: 0,
  lastPlayedISO: null,
  gatesOpened: [],
  inventory: makeInventory(),
  weeklyLeaguePoints: 0,
  dailyQuests: [],
  lastHeartsRefillISO: null,
  streakFreezeArmed: false,
});

export const hydrateProgress = (value: unknown): Progress => {
  const base = createInitialProgress();
  if (!value || typeof value !== "object") {
    return base;
  }

  const record = value as Partial<Progress>;
  return {
    xp: record.xp ?? base.xp,
    coins: record.coins ?? base.coins,
    stars: record.stars ?? base.stars,
    hearts: Math.min(Math.max(record.hearts ?? base.hearts, 0), 5),
    streakDays: Math.max(record.streakDays ?? base.streakDays, 0),
    lastPlayedISO: record.lastPlayedISO ?? base.lastPlayedISO,
    gatesOpened: record.gatesOpened ?? base.gatesOpened,
    inventory: {
      keys: record.inventory?.keys ?? 0,
      freeze: record.inventory?.freeze ?? 0,
      doubler: record.inventory?.doubler ?? 0,
      extraHearts: record.inventory?.extraHearts ?? 0,
    },
    weeklyLeaguePoints: record.weeklyLeaguePoints ?? base.weeklyLeaguePoints,
    dailyQuests: record.dailyQuests ?? base.dailyQuests,
    lastHeartsRefillISO:
      record.lastHeartsRefillISO ?? base.lastHeartsRefillISO,
    streakFreezeArmed: record.streakFreezeArmed ?? base.streakFreezeArmed,
  };
};

export const isSameDay = (a: string | null, b: string | null) => {
  if (!a || !b) return false;
  const left = new Date(a);
  const right = new Date(b);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

export const toISODateTime = (date = new Date()) => date.toISOString();

export const shouldRefillHearts = (lastRefillISO: string | null) => {
  if (!lastRefillISO) return true;
  const last = new Date(lastRefillISO);
  const now = new Date();
  return now.getDate() !== last.getDate() || now.getTime() - last.getTime() > 24 * 60 * 60 * 1000;
};
