import { z } from 'zod'

export const levelStatusSchema = z.enum(['unlocked', 'in_progress', 'complete', 'locked'])
export type LevelStatus = z.infer<typeof levelStatusSchema>

export const levelDifficultySchema = z.number().int().min(1).max(5)

export const worldSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  range: z.tuple([z.number().int().positive(), z.number().int().positive()]),
})
export type World = z.infer<typeof worldSchema>

export const levelSchema = z.object({
  id: z.string(),
  number: z.number().int().min(1).max(120),
  worldId: z.string(),
  title: z.string(),
  objectives: z.array(z.string().min(1)),
  estMinutes: z.number().int().min(1),
  difficulty: levelDifficultySchema,
  status: levelStatusSchema,
  score: z.number().int().min(0).max(100),
  tags: z.array(z.string()),
  coachNotes: z.string().optional(),
  media: z
    .object({
      poster: z.string().url().optional(),
      url: z.string().url(),
      type: z.enum(['video', 'image']).default('video'),
    })
    .optional(),
})
export type Level = z.infer<typeof levelSchema>

export const progressSchema = z.object({
  currentLevelId: z.string().nullable(),
  streakDays: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  arcPercent: z.record(z.string(), z.number().min(0).max(1)),
  lastPlayedAt: z.coerce.date().nullable(),
})
export type Progress = z.infer<typeof progressSchema>

export const nudgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  actionLabel: z.string(),
  href: z.string(),
})
export type Nudge = z.infer<typeof nudgeSchema>

export const weeklyPlanSchema = z.object({
  mon: z.string().nullable(),
  wed: z.string().nullable(),
  fri: z.string().nullable(),
})
export type WeeklyPlan = z.infer<typeof weeklyPlanSchema>

export const filtersSchema = z.object({
  query: z.string().default(''),
  difficulty: z.array(levelDifficultySchema).default([]),
  status: z.array(levelStatusSchema).default([]),
})
export type Filters = z.infer<typeof filtersSchema>
