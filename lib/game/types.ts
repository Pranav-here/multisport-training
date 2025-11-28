export type Skill =
  | "first_touch"
  | "scanning"
  | "passing"
  | "turning"
  | "press_break"
  | "finishing";

export const SKILLS: Skill[] = [
  "first_touch",
  "scanning",
  "passing",
  "turning",
  "press_break",
  "finishing",
];

export type Thresholds = {
  one: number;
  two: number;
  three: number;
};

export type Level = {
  id: string;
  world: number; // 1..6
  number: number; // 1..120
  title: string;
  skills: Skill[];
  estMinutes: number;
  thresholds: Thresholds;
  locked: boolean;
  neighbors: string[];
  gate?: boolean;
};

export type BoosterInventory = {
  keys: number;
  freeze: number;
  doubler: number;
  extraHearts: number;
};

export type Progress = {
  xp: number;
  coins: number;
  stars: Record<string, 0 | 1 | 2 | 3>;
  hearts: number; // 0..5
  streakDays: number;
  lastPlayedISO: string | null;
  gatesOpened: string[]; // level ids of gate nodes
  inventory: BoosterInventory;
  weeklyLeaguePoints: number;
  dailyQuests: DailyQuestState[];
  lastHeartsRefillISO: string | null;
  streakFreezeArmed: boolean;
};

export type SessionResult = {
  levelId: string;
  score: number;
  stars: 0 | 1 | 2 | 3;
  xpGained: number;
  coinsGained: number;
  missed: number;
  ts: string;
};

export type SessionMode = "play" | "practice";

export type DailyQuestDefinition = {
  id: string;
  label: string;
  rewardXP: number;
  rewardCoins: number;
  goal: number;
  type: "sessions" | "stars" | "practice";
  skillTarget?: Skill;
};

export type DailyQuestState = {
  id: string;
  progress: number;
  completed: boolean;
};

export type SchedulerEntry = {
  skill: Skill;
  due: string;
  interval: number;
  ease: number;
  repetitions: number;
};

export const MAX_WORLDS = 6;
export const LEVELS_PER_WORLD = 20;
export const MAX_HEARTS = 5;
export const STAR_GATE_INTERVAL = 20;

export const BOOSTER_COSTS = {
  extraHeart: 100,
  starDoubler: 150,
  gateKey: 200,
  streakFreeze: 250,
} as const;
