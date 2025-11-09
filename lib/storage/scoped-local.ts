/**
 * User-scoped localStorage with schema versioning
 * Prevents data leaks across user accounts and provides migration support
 */

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
    console.error("Error reading from scoped localStorage:", error);
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
    console.error("Error writing to scoped localStorage:", error);
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded. Consider clearing old data.");
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
    console.error("Error removing from scoped localStorage:", error);
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

    console.log(`Cleared ${keysToRemove.length} scoped localStorage items for user`);
  } catch (error) {
    console.error("Error clearing user scope from localStorage:", error);
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

        console.log(`Migrated localStorage key: ${oldKey} -> ${newKey}`);
      }
    });
  } catch (error) {
    console.error("Error migrating old localStorage keys:", error);
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
      console.log(`Cleared ${keysToRemove.length} old schema localStorage items`);
    }
  } catch (error) {
    console.error("Error clearing old schemas from localStorage:", error);
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
    console.error("Error calculating user storage size:", error);
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
