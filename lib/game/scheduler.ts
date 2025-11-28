import { SchedulerEntry, Skill, SKILLS } from "./types";
export type { SchedulerEntry } from "./types";
import { toISODateTime } from "./progress";

const DEFAULT_INTERVAL = 1;
const DEFAULT_EASE = 2.5;

const clampQuality = (quality: number) => Math.min(Math.max(quality, 0), 5);

export const seedScheduler = (): SchedulerEntry[] =>
  SKILLS.map((skill) => ({
    skill,
    due: toISODateTime(),
    interval: DEFAULT_INTERVAL,
    ease: DEFAULT_EASE,
    repetitions: 0,
  }));

export const selectPracticeSkills = (
  entries: SchedulerEntry[],
  count = 3,
  now = new Date(),
): Skill[] => {
  const nowTime = now.getTime();
  const sorted = [...entries].sort((a, b) => {
    const aDue = new Date(a.due).getTime();
    const bDue = new Date(b.due).getTime();
    const aOverdue = aDue <= nowTime;
    const bOverdue = bDue <= nowTime;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return aDue - bDue;
  });

  return sorted.slice(0, count).map((entry) => entry.skill);
};

export const updateSchedulerEntry = (
  entry: SchedulerEntry,
  quality: number,
  now = new Date(),
): SchedulerEntry => {
  const q = clampQuality(quality);
  if (q < 3) {
    return {
      ...entry,
      repetitions: 0,
      interval: DEFAULT_INTERVAL,
      due: toISODateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    };
  }

  const easeDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const ease = Math.max(1.3, entry.ease + easeDelta);
  const repetitions = entry.repetitions + 1;
  const interval =
    repetitions === 1
      ? 1
      : repetitions === 2
        ? 6
        : Math.round(entry.interval * ease);
  const due = toISODateTime(
    new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
  );

  return {
    ...entry,
    ease,
    repetitions,
    interval,
    due,
  };
};

export const integrateSchedulerResult = (
  entries: SchedulerEntry[],
  skill: Skill,
  quality: number,
  now = new Date(),
): SchedulerEntry[] =>
  entries.map((entry) =>
    entry.skill === skill ? updateSchedulerEntry(entry, quality, now) : entry,
  );
