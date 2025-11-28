import { describe, expect, it } from "vitest";

import {
  integrateSchedulerResult,
  seedScheduler,
  selectPracticeSkills,
} from "@/lib/game/scheduler";
import { SKILLS } from "@/lib/game/types";

describe("scheduler", () => {
  it("seeds entries for every skill", () => {
    const entries = seedScheduler();
    expect(entries).toHaveLength(SKILLS.length);
    const skills = entries.map((entry) => entry.skill);
    expect(new Set(skills).size).toBe(SKILLS.length);
  });

  it("prioritises overdue skills when selecting practice queue", () => {
    const entries = seedScheduler();
    entries[0].due = "2023-01-01T00:00:00.000Z";
    entries[1].due = "2099-01-01T00:00:00.000Z";
    const picks = selectPracticeSkills(entries, 2, new Date("2024-01-01"));
    expect(picks[0]).toBe(entries[0].skill);
  });

  it("adjusts interval based on quality", () => {
    const entries = seedScheduler();
    const skill = entries[0].skill;
    const afterFirstReview = integrateSchedulerResult(
      entries,
      skill,
      5,
      new Date("2024-01-01T00:00:00.000Z"),
    );
    const secondReviewDate = new Date("2024-01-05T00:00:00.000Z");
    const afterSecondReview = integrateSchedulerResult(
      afterFirstReview,
      skill,
      5,
      secondReviewDate,
    );
    const updated = afterSecondReview.find((entry) => entry.skill === skill);
    expect(updated?.interval).toBeGreaterThan(entries[0].interval);
    expect(new Date(updated?.due ?? 0).getTime()).toBeGreaterThan(
      secondReviewDate.getTime(),
    );

    const resetQuality = integrateSchedulerResult(
      afterSecondReview,
      skill,
      1,
      new Date("2024-01-10T00:00:00.000Z"),
    );
    const resetEntry = resetQuality.find((entry) => entry.skill === skill);
    expect(resetEntry?.interval).toBe(1);
    expect(new Date(resetEntry?.due ?? 0).getTime()).toBeGreaterThan(
      new Date("2024-01-10T00:00:00.000Z").getTime(),
    );
  });
});
