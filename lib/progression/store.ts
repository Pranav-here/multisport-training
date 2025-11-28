import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { Filters, filtersSchema, Level, LevelStatus, Progress, WeeklyPlan, World } from './types'
import { getProgress, listLevels, listNudges, listWorlds } from './mock'

const noopStorage: Storage = {
  getItem: (key: string) => {
    void key
    return null
  },
  setItem: (key: string, value: string) => {
    void key
    void value
  },
  removeItem: (key: string) => {
    void key
  },
  clear: () => undefined,
  key: (index: number) => {
    void index
    return null
  },
  length: 0,
}

const storage = createJSONStorage<ProgressionState>(() =>
  typeof window !== 'undefined' ? window.localStorage : noopStorage,
)

function memoizeLast<Args extends unknown[], Result>(fn: (...args: Args) => Result) {
  let lastArgs: Args | null = null
  let lastResult: Result
  let hasResult = false
  return (...args: Args): Result => {
    if (
      hasResult &&
      lastArgs &&
      args.length === lastArgs.length &&
      args.every((arg, index) => Object.is(arg, lastArgs[index]))
    ) {
      return lastResult
    }
    lastArgs = args
    lastResult = fn(...args)
    hasResult = true
    return lastResult
  }
}

export interface ProgressionState {
  worlds: World[]
  levels: Level[]
  nudges: Awaited<ReturnType<typeof listNudges>>
  progress: Progress | null
  loading: boolean
  error: string | null
  selectedWorldId: string
  selectedLevelId: string | null
  filters: Filters
  weeklyPlan: WeeklyPlan
  lastPlannerSaveAt: number | null
  actions: {
    load: () => Promise<void>
    setSelectedWorld: (worldId: string) => void
    setSelectedLevel: (levelId: string | null) => void
    setQuery: (query: string) => void
    toggleDifficulty: (difficulty: number) => void
    toggleStatus: (status: LevelStatus) => void
    clearFilters: () => void
    markLevelComplete: (levelId: string) => Promise<void>
    saveWeeklyPlan: (plan: WeeklyPlan) => Promise<void>
  }
}

const defaultPlan: WeeklyPlan = { mon: null, wed: null, fri: null }

const createFilters = () => filtersSchema.parse({})


const createBaseState = (): Omit<ProgressionState, 'actions'> => ({
  worlds: listWorlds(),
  levels: [],
  nudges: [],
  progress: null,
  loading: false,
  error: null,
  selectedWorldId: 'grassroots',
  selectedLevelId: null,
  filters: createFilters(),
  weeklyPlan: defaultPlan,
  lastPlannerSaveAt: null,
})

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      ...createBaseState(),
      actions: {
        load: async () => {
          if (get().loading || get().levels.length > 0) {
            return
          }
          set({ loading: true, error: null })
          try {
            const [levels, progress, nudges] = await Promise.all([listLevels(), getProgress(), listNudges()])
            const currentLevelId = progress.currentLevelId ?? levels.find((level) => level.status !== 'locked')?.id ?? null
            set({
              levels,
              progress,
              nudges,
              loading: false,
              selectedLevelId: currentLevelId,
              selectedWorldId: currentLevelId
                ? levels.find((level) => level.id === currentLevelId)?.worldId ?? get().selectedWorldId
                : get().selectedWorldId,
            })
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Unable to load progression data',
            })
          }
        },
        setSelectedWorld: (worldId) => {
          set({ selectedWorldId: worldId })
        },
        setSelectedLevel: (levelId) => {
          set({ selectedLevelId: levelId })
        },
        setQuery: (query) => {
          set((state) => ({
            filters: {
              ...state.filters,
              query,
            },
          }))
        },
        toggleDifficulty: (difficulty) => {
          set((state) => {
            const exists = state.filters.difficulty.includes(difficulty)
            return {
              filters: {
                ...state.filters,
                difficulty: exists
                  ? state.filters.difficulty.filter((value) => value !== difficulty)
                  : [...state.filters.difficulty, difficulty],
              },
            }
          })
        },
        toggleStatus: (status) => {
          set((state) => {
            const exists = state.filters.status.includes(status)
            return {
              filters: {
                ...state.filters,
                status: exists
                  ? state.filters.status.filter((value) => value !== status)
                  : [...state.filters.status, status],
              },
            }
          })
        },
        clearFilters: () => {
          set({ filters: createFilters() })
        },
        markLevelComplete: async (levelId) => {
          const level = get().levels.find((entry) => entry.id === levelId)
          if (!level) {
            return
          }
          const updatedLevel: Level = { ...level, status: 'complete', score: 100 }
          set((state) => {
            const nextLevels = state.levels.map((entry) => (entry.id === levelId ? updatedLevel : entry))
            const nextLevelId = computeNextLevelId(levelId, nextLevels)
            return {
              levels: nextLevels,
              progress: state.progress
                ? {
                    ...state.progress,
                    completedCount: state.progress.completedCount + (level.status === 'complete' ? 0 : 1),
                    currentLevelId: nextLevelId,
                    lastPlayedAt: new Date(),
                  }
                : state.progress,
              selectedLevelId: nextLevelId,
            }
          })
        },
        saveWeeklyPlan: async (plan) => {
          // In a real app this would POST to an API. Mock latency for parity.
          await new Promise((resolve) => setTimeout(resolve, 80))
          set({
            weeklyPlan: plan,
            lastPlannerSaveAt: Date.now(),
          })
        },
      },
    }),
    {
      name: 'progression-store',
      storage,
      partialize: (state) => ({
        weeklyPlan: state.weeklyPlan,
        filters: state.filters,
      }),
    },
  ),
)

const computeNextLevelId = (completedId: string, levels: Level[]): string | null => {
  const completed = levels.find((entry) => entry.id === completedId)
  if (!completed) {
    return null
  }
  const next = levels
    .filter((entry) => entry.number > completed.number)
    .find((entry) => entry.status === 'in_progress' || entry.status === 'unlocked')
  return next?.id ?? null
}

const normalize = (value: string) => value.trim().toLowerCase()

const memoizedLevelsForWorld = memoizeLast((levels: Level[], worldId: string) =>
  levels.filter((level) => level.worldId === worldId),
)

const memoizedFilteredLevels = memoizeLast(
  (levels: Level[], selectedWorldId: string, filters: Filters) => {
    const query = normalize(filters.query)
    return levels.filter((level) => {
      if (level.worldId !== selectedWorldId) {
        return false
      }
      const matchesQuery =
        query.length === 0 ||
        normalize(level.title).includes(query) ||
        level.tags.some((tag) => normalize(tag).includes(query)) ||
        `level ${level.number}`.includes(query)
      const matchesDifficulty =
        filters.difficulty.length === 0 || filters.difficulty.includes(level.difficulty)
      const matchesStatus = filters.status.length === 0 || filters.status.includes(level.status)
      return matchesQuery && matchesDifficulty && matchesStatus
    })
  },
)

export const selectWorlds = (state: ProgressionState) => state.worlds
export const selectWorldById = (worldId: string) => (state: ProgressionState) =>
  state.worlds.find((world) => world.id === worldId) ?? state.worlds[0]

export const selectFilters = (state: ProgressionState) => state.filters

export const selectLevelsForWorld = (worldId: string) => (state: ProgressionState) =>
  memoizedLevelsForWorld(state.levels, worldId)

export const selectFilteredLevels = (state: ProgressionState) =>
  memoizedFilteredLevels(state.levels, state.selectedWorldId, state.filters)

export const selectResultCount = (state: ProgressionState) => selectFilteredLevels(state).length

export const selectSelectedLevel = (state: ProgressionState) =>
  state.selectedLevelId ? state.levels.find((level) => level.id === state.selectedLevelId) ?? null : null

export const selectProgress = (state: ProgressionState) => state.progress

export const selectWeeklyPlan = (state: ProgressionState) => state.weeklyPlan

export const selectNudges = (state: ProgressionState) => state.nudges


export const resetProgressionStore = () => {
  const base = createBaseState()
  useProgressionStore.setState((state) => ({ ...base, actions: state.actions }), true)
  if (typeof window !== 'undefined') {
    window.localStorage?.removeItem('progression-store')
  }
}

export const selectContinueLevel = (state: ProgressionState) => {
  const currentId = state.progress?.currentLevelId
  if (currentId) {
    const current = state.levels.find((level) => level.id === currentId)
    if (current) {
      return current
    }
  }
  return (
    state.levels.find((level) => level.status === 'in_progress') ??
    state.levels.find((level) => level.status === 'unlocked') ??
    state.levels[0] ??
    null
  )
}
