import {
  LEVELS_PER_WORLD,
  Level,
  MAX_WORLDS,
  SKILLS,
  STAR_GATE_INTERVAL,
  Skill,
} from "./types";

const WORLD_THEMES = [
  "Backyard Breakthrough",
  "Street Vision",
  "Midfield Maestro",
  "Press Breakers",
  "Final Third Fury",
  "Champions Circuit",
] as const;

const FRIENDLY_TITLES = [
  "First Touch Warmup",
  "Shoulder Check Shuffle",
  "Tap & Move Flow",
  "Quick Pivot Escape",
  "Vision Up Challenge",
  "Through Ball Thread",
  "One-Touch Relay",
  "Spin and Strike",
  "Press Break Escape",
  "Target Finishing Finesse",
] as const;

const clampTitle = (index: number) =>
  FRIENDLY_TITLES[index % FRIENDLY_TITLES.length];

const worldDifficultyBase = (world: number) => 8 + world * 2;

const computeThresholds = (world: number) => {
  const base = worldDifficultyBase(world);
  return {
    one: 40 + base,
    two: 70 + base,
    three: 90 + base,
  };
};

const levelSkills = (world: number, levelIndex: number): Skill[] => {
  const primary = SKILLS[(world - 1) % SKILLS.length];
  const secondary =
    SKILLS[(levelIndex + world) % SKILLS.length];
  const tertiary = SKILLS[(levelIndex + world + 2) % SKILLS.length];
  return [primary, secondary, tertiary].reduce<Skill[]>((acc, skill) => {
    if (!acc.includes(skill)) {
      acc.push(skill);
    }
    return acc;
  }, []);
};

export const generateLevelId = (n: number) => `level-${n}`;

export const generateSeedLevels = (): Level[] => {
  const totalLevels = MAX_WORLDS * LEVELS_PER_WORLD;
  const levels: Level[] = [];

  for (let world = 1; world <= MAX_WORLDS; world += 1) {
    for (let index = 0; index < LEVELS_PER_WORLD; index += 1) {
      const absoluteNumber = (world - 1) * LEVELS_PER_WORLD + index + 1;
      const id = generateLevelId(absoluteNumber);
      const isGate = absoluteNumber % STAR_GATE_INTERVAL === 0;
      const nextId =
        absoluteNumber < totalLevels
          ? generateLevelId(absoluteNumber + 1)
          : null;
      const isFirstFive = absoluteNumber <= 5;
      const locked =
        isGate ||
        (!isFirstFive &&
          (world > 1 ||
            (absoluteNumber > 1 &&
              absoluteNumber % STAR_GATE_INTERVAL !== 1 &&
              absoluteNumber > 5)));

      levels.push({
        id,
        world,
        number: absoluteNumber,
        title: `${WORLD_THEMES[world - 1]} ${absoluteNumber === 1 ? "Intro" : clampTitle(index)}`,
        skills: levelSkills(world, index),
        estMinutes: 3 + ((absoluteNumber + world) % 4),
        thresholds: computeThresholds(world),
        locked,
        neighbors: nextId ? [nextId] : [],
        gate: isGate,
      });
    }
  }

  return levels;
};

export const getWorldLabel = (world: number) =>
  `${world}. ${WORLD_THEMES[world - 1] ?? "Adventure"}`;
