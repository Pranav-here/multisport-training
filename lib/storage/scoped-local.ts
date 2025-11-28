/**
 * User-scoped localStorage with schema versioning
 * Prevents data leaks across user accounts and provides migration support
 */

import { logger } from '@/lib/log'

export const SCHEMA_VERSION = "v2";

/**
 * Generate a namespaced key for localStorage
 * Format: athletiqs:{version}:{userId}:{key}
 */
export function ns(userId: string, key: string): string {
  if (!userId) {
    throw new Error("userId is required for scoped localStorage");
  }
  return `athletiqs:${SCHEMA_VERSION}:${userId}:${key}`;
}

/**
 * Get an item from scoped localStorage
 */
export function getScopedItem<T = string>(userId: string, key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const scopedKey = ns(userId, key);
    const item = localStorage.getItem(scopedKey);

    if (item === null) {
      return null;
    }

    // Try to parse as JSON, fall back to string
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), userId, key },
      "Error reading from scoped localStorage"
    );
    return null;
  }
}

/**
 * Set an item in scoped localStorage
 */
export function setScopedItem<T>(userId: string, key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const scopedKey = ns(userId, key);
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(scopedKey, serialized);
  } catch (error) {
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      logger.warn(
        { userId, key },
        "localStorage quota exceeded. Consider clearing old data."
      );
    } else {
      logger.error(
        { error: error instanceof Error ? error.message : String(error), userId, key },
        "Error writing to scoped localStorage"
      );
    }
  }
}

/**
 * Remove an item from scoped localStorage
 */
export function removeScopedItem(userId: string, key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const scopedKey = ns(userId, key);
    localStorage.removeItem(scopedKey);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), userId, key },
      "Error removing from scoped localStorage"
    );
  }
}

/**
 * Clear all items for a specific user
 * Useful when logging out
 */
export function clearUserScope(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const prefix = `athletiqs:${SCHEMA_VERSION}:${userId}:`;
    const keysToRemove: string[] = [];

    // Find all keys for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    logger.info(
      { userId, itemsCleared: keysToRemove.length },
      "Cleared scoped localStorage items for user"
    );
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), userId },
      "Error clearing user scope from localStorage"
    );
  }
}

/**
 * Migrate old unscoped keys to new scoped format
 * Call this on login to migrate legacy data
 */
export function migrateOldKeys(userId: string, oldKeys: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    oldKeys.forEach((oldKey) => {
      const value = localStorage.getItem(oldKey);
      if (value !== null) {
        // Move to new scoped key
        const newKey = ns(userId, oldKey);
        localStorage.setItem(newKey, value);

        // Remove old key
        localStorage.removeItem(oldKey);

        logger.info({ userId, oldKey, newKey }, "Migrated localStorage key");
      }
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), userId },
      "Error migrating old localStorage keys"
    );
  }
}

/**
 * Clear all old schema versions
 * Useful for cleaning up after a migration
 */
export function clearOldSchemas(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    const currentPrefix = `athletiqs:${SCHEMA_VERSION}:`;

    // Find all athletiqs keys that don't match current schema
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("athletiqs:") && !key.startsWith(currentPrefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      logger.info(
        { itemsCleared: keysToRemove.length },
        "Cleared old schema localStorage items"
      );
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Error clearing old schemas from localStorage"
    );
  }
}

/**
 * Get storage usage for current user
 */
export function getUserStorageSize(userId: string): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const prefix = `athletiqs:${SCHEMA_VERSION}:${userId}:`;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          // Approximate size in bytes (UTF-16)
          totalSize += (key.length + value.length) * 2;
        }
      }
    }

    return totalSize;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), userId },
      "Error calculating user storage size"
    );
    return 0;
  }
}

/**
 * Common scoped localStorage keys
 * Use these constants instead of hard-coding strings
 */
export const STORAGE_KEYS = {
  DASHBOARD_LAST_DRAFT: "dashboard:lastDraft",
  ONBOARDING_COMPLETED: "onboarding:completed",
  PREFERENCES: "user:preferences",
  RECENT_SEARCHES: "search:recent",
  QUICK_POST_DRAFT: "quickPost:draft",
  CHALLENGE_REMINDERS: "challenge:reminders",
  THEME: "ui:theme",
} as const;

/**
 * Helper hook for React components (use this in components)
 */
export function useScopedLocalStorage<T>(userId: string | undefined, key: string) {
  if (!userId) {
    return {
      value: null,
      setValue: () => {},
      removeValue: () => {},
    };
  }

  return {
    value: getScopedItem<T>(userId, key),
    setValue: (value: T) => setScopedItem(userId, key, value),
    removeValue: () => removeScopedItem(userId, key),
  };
}
