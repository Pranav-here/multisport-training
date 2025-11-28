import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetProgressionStore,
  selectContinueLevel,
  selectFilteredLevels,
  useProgressionStore,
} from './store'

describe('progression store selectors', () => {
  beforeEach(() => {
    resetProgressionStore()
  })

  it('filters levels by difficulty', async () => {
    const { actions } = useProgressionStore.getState()
    await actions.load()
    actions.setSelectedWorld('grassroots')
    actions.toggleDifficulty(3)
    const state = useProgressionStore.getState()
    const filtered = selectFilteredLevels(state)
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((level) => level.difficulty === 3)).toBe(true)
  })

  it('returns the current level for continue selector', async () => {
    const { actions } = useProgressionStore.getState()
    await actions.load()
    const state = useProgressionStore.getState()
    const continueLevel = selectContinueLevel(state)
    expect(continueLevel?.id).toBe(state.progress?.currentLevelId)
  })

  it('advances continue level after completion', async () => {
    const { actions } = useProgressionStore.getState()
    await actions.load()
    const first = selectContinueLevel(useProgressionStore.getState())
    expect(first).not.toBeNull()
    if (!first) return
    await actions.markLevelComplete(first.id)
    const next = selectContinueLevel(useProgressionStore.getState())
    expect(next?.id).not.toBe(first.id)
  })
})
