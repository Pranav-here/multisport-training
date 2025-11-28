import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LevelGrid } from "../LevelGrid"
import type { Level } from "@/lib/progression/types"

const buildLevels = (): Level[] =>
  Array.from({ length: 12 }, (_, index) => ({
    id: `level-${index + 1}`,
    number: index + 1,
    worldId: "grassroots",
    title: `Sample Level ${index + 1}`,
    objectives: ["Do a thing", "Do another"],
    estMinutes: 8,
    difficulty: ((index % 5) + 1) as Level["difficulty"],
    status: index === 0 ? "in_progress" : index % 4 === 0 ? "locked" : "unlocked",
    score: 70,
    tags: ["touch"],
  }))

describe("LevelGrid keyboard flow", () => {
  it("moves focus with keyboard and triggers selection", async () => {
    const levels = buildLevels()
    const onSelect = vi.fn()

    render(
      <LevelGrid
        levels={levels}
        query=""
        difficultyFilter={[]}
        statusFilter={[]}
        resultCount={levels.length}
        selectedLevelId={null}
        onQueryChange={() => {}}
        onToggleDifficulty={() => {}}
        onToggleStatus={() => {}}
        onClearFilters={() => {}}
        onSelectLevel={onSelect}
      />,
    )

    const grid = screen.getByRole("grid", { name: /level grid/i })
    grid.focus()

    await userEvent.keyboard("{Home}")
    await waitFor(() => {
      const firstTile = grid.querySelector('button[data-index="0"]') as HTMLButtonElement
      expect(firstTile).toHaveFocus()
    })

    await userEvent.keyboard("{ArrowRight}")
    await waitFor(() => {
      const secondTile = grid.querySelector('button[data-index="1"]') as HTMLButtonElement
      expect(secondTile).toHaveFocus()
    })

    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith(levels[1])
  })
})
