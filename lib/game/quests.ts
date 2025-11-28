import { DailyQuestDefinition, DailyQuestState, Skill } from "./types";

export const DAILY_QUESTS: DailyQuestDefinition[] = [
  {
    id: "finish_two_sessions",
    label: "Finish 2 sessions",
    type: "sessions",
    goal: 2,
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: "earn_five_stars",
    label: "Earn 5 stars",
    type: "stars",
    goal: 5,
    rewardCoins: 25,
    rewardXP: 30,
  },
  {
    id: "practice_scanning",
    label: "Practice scanning",
    type: "practice",
    goal: 1,
    rewardCoins: 25,
    rewardXP: 30,
    skillTarget: "scanning",
  },
];

export const initializeDailyQuests = (): DailyQuestState[] =>
  DAILY_QUESTS.map((quest) => ({
    id: quest.id,
    progress: 0,
    completed: false,
  }));

export const applyQuestProgress = (
  states: DailyQuestState[],
  questId: string,
  delta: number,
) =>
  states.map((state) => {
    if (state.id !== questId) return state;
    const quest = DAILY_QUESTS.find((item) => item.id === questId);
    if (!quest) return state;
    const nextProgress = Math.min(state.progress + delta, quest.goal);
    return {
      ...state,
      progress: nextProgress,
      completed: nextProgress >= quest.goal,
    };
  });

export const isQuestCompleted = (
  questId: string,
  states: DailyQuestState[],
): boolean => {
  const quest = states.find((state) => state.id === questId);
  if (!quest) return false;
  return quest.completed;
};

export const questRewardFor = (questId: string) =>
  DAILY_QUESTS.find((quest) => quest.id === questId);

export const questTargetsSkill = (questId: string, skill: Skill) => {
  const quest = DAILY_QUESTS.find((item) => item.id === questId);
  if (!quest?.skillTarget) return false;
  return quest.skillTarget === skill;
};
