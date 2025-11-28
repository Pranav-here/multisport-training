import { describe, expect, it } from "vitest";

import { resolveRewards, resolveStars } from "@/lib/game/session";
import { Level } from "@/lib/game/types";

const baseLevel: Level = {
  id: "level-1",
  world: 1,
  number: 1,
  title: "First Touch Warmup",
  skills: ["first_touch", "scanning", "passing"],
  estMinutes: 3,
  thresholds: { one: 40, two: 70, three: 90 },
  locked: false,
  neighbors: [],
};

describe("session rewards", () => {
  it("awards base xp and coins in play mode", () => {
    const rewards = resolveRewards(baseLevel, 3, "play", false);
    expect(rewards.xp).toBe(25);
    expect(rewards.coins).toBe(15);
  });

  it("doubles coins when star doubler is active", () => {
    const rewards = resolveRewards(baseLevel, 3, "play", true);
    expect(rewards.coins).toBe(30);
  });

  it("halves rewards in practice mode", () => {
    const rewards = resolveRewards(baseLevel, 2, "practice", false);
    expect(rewards.xp).toBe(10);
    expect(rewards.coins).toBe(5); // 10 * 0.5 rounded
  });

  it("evaluates star thresholds correctly", () => {
    expect(resolveStars(20, baseLevel.thresholds)).toBe(0);
    expect(resolveStars(45, baseLevel.thresholds)).toBe(1);
    expect(resolveStars(72, baseLevel.thresholds)).toBe(2);
    expect(resolveStars(95, baseLevel.thresholds)).toBe(3);
  });
});
