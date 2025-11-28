import { createInitialProgress, hydrateProgress } from "./progress";
import { Progress } from "./types";

let progressStore: Progress = createInitialProgress();

export const getProgress = (): Progress => progressStore;

export const mergeProgress = (incoming: Progress): Progress => {
  const hydrated = hydrateProgress(incoming);

  progressStore = {
    ...progressStore,
    ...hydrated,
    stars: { ...progressStore.stars, ...hydrated.stars },
    gatesOpened: Array.from(
      new Set([...progressStore.gatesOpened, ...hydrated.gatesOpened]),
    ),
    inventory: {
      keys:
        hydrated.inventory.keys !== undefined
          ? hydrated.inventory.keys
          : progressStore.inventory.keys,
      freeze:
        hydrated.inventory.freeze !== undefined
          ? hydrated.inventory.freeze
          : progressStore.inventory.freeze,
      doubler:
        hydrated.inventory.doubler !== undefined
          ? hydrated.inventory.doubler
          : progressStore.inventory.doubler,
      extraHearts:
        hydrated.inventory.extraHearts !== undefined
          ? hydrated.inventory.extraHearts
          : progressStore.inventory.extraHearts,
    },
    dailyQuests:
      hydrated.dailyQuests?.length ? hydrated.dailyQuests : progressStore.dailyQuests,
  };

  return progressStore;
};

export const overwriteProgress = (incoming: Progress): Progress => {
  progressStore = hydrateProgress(incoming);
  return progressStore;
};

export const resetProgress = () => {
  progressStore = createInitialProgress();
  return progressStore;
};
