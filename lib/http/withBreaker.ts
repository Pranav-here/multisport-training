import { logger } from "../log";

/**
 * Simple circuit breaker implementation with timeout and error budget
 * Prevents cascading failures by failing fast when a service is unhealthy
 */

type BreakerState = "closed" | "open" | "half-open";

interface BreakerConfig {
  timeout?: number; // Request timeout in ms (default: 5000)
  errorThreshold?: number; // Number of errors before opening (default: 5)
  resetTimeout?: number; // Time to wait before trying again in ms (default: 60000)
  successThreshold?: number; // Successes needed to close from half-open (default: 2)
}

interface BreakerStats {
  state: BreakerState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  nextRetryTime?: number;
}

const breakers = new Map<string, BreakerStats>();

const defaultConfig: Required<BreakerConfig> = {
  timeout: 5000,
  errorThreshold: 5,
  resetTimeout: 60000,
  successThreshold: 2,
};

/**
 * Execute a function with circuit breaker protection
 */
export async function withBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  config: BreakerConfig = {}
): Promise<{ ok: true; value: T } | { ok: false; error: Error }> {
  const cfg = { ...defaultConfig, ...config };
  const breaker = getOrCreateBreaker(name);

  // Check if circuit is open
  if (breaker.state === "open") {
    const now = Date.now();
    if (breaker.nextRetryTime && now < breaker.nextRetryTime) {
      logger.warn(
        {
          breaker: name,
          state: breaker.state,
          nextRetry: new Date(breaker.nextRetryTime).toISOString(),
        },
        "Circuit breaker is open, failing fast"
      );
      return {
        ok: false,
        error: new Error(`Circuit breaker '${name}' is open`),
      };
    }
    // Transition to half-open to test the service
    breaker.state = "half-open";
    breaker.successes = 0;
    logger.info({ breaker: name }, "Circuit breaker transitioning to half-open");
  }

  const startTime = Date.now();

  try {
    // Execute with timeout
    const result = await withTimeout(fn(), cfg.timeout);
    const duration = Date.now() - startTime;

    // Success - update breaker state
    breaker.successes++;
    breaker.failures = Math.max(0, breaker.failures - 1); // Decay failures on success

    if (breaker.state === "half-open") {
      if (breaker.successes >= cfg.successThreshold) {
        breaker.state = "closed";
        breaker.failures = 0;
        breaker.successes = 0;
        logger.info(
          { breaker: name, duration },
          "Circuit breaker closed after successful recovery"
        );
      }
    }

    logger.debug(
      { breaker: name, state: breaker.state, duration },
      "Circuit breaker call succeeded"
    );

    return { ok: true, value: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));

    // Failure - update breaker state
    breaker.failures++;
    breaker.lastFailureTime = Date.now();
    breaker.successes = 0; // Reset success count on failure

    if (
      breaker.state === "closed" &&
      breaker.failures >= cfg.errorThreshold
    ) {
      breaker.state = "open";
      breaker.nextRetryTime = Date.now() + cfg.resetTimeout;
      logger.error(
        {
          breaker: name,
          failures: breaker.failures,
          threshold: cfg.errorThreshold,
          nextRetry: new Date(breaker.nextRetryTime).toISOString(),
          error: err.message,
          duration,
        },
        "Circuit breaker opened due to failures"
      );
    } else if (breaker.state === "half-open") {
      breaker.state = "open";
      breaker.nextRetryTime = Date.now() + cfg.resetTimeout;
      logger.error(
        {
          breaker: name,
          nextRetry: new Date(breaker.nextRetryTime).toISOString(),
          error: err.message,
          duration,
        },
        "Circuit breaker re-opened after failed recovery attempt"
      );
    } else {
      logger.warn(
        {
          breaker: name,
          state: breaker.state,
          failures: breaker.failures,
          threshold: cfg.errorThreshold,
          error: err.message,
          duration,
        },
        "Circuit breaker call failed"
      );
    }

    return { ok: false, error: err };
  }
}

/**
 * Get or create a breaker for a given name
 */
function getOrCreateBreaker(name: string): BreakerStats {
  if (!breakers.has(name)) {
    breakers.set(name, {
      state: "closed",
      failures: 0,
      successes: 0,
    });
  }
  return breakers.get(name)!;
}

/**
 * Execute a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Get the current state of a circuit breaker
 */
export function getBreakerState(name: string): BreakerStats | undefined {
  return breakers.get(name);
}

/**
 * Reset a circuit breaker to its initial state
 */
export function resetBreaker(name: string): void {
  breakers.delete(name);
  logger.info({ breaker: name }, "Circuit breaker manually reset");
}

/**
 * Get all circuit breaker states (useful for health checks)
 */
export function getAllBreakerStates(): Record<string, BreakerStats> {
  return Object.fromEntries(breakers.entries());
}
