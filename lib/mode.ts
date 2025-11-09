import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { logger } from "./log";

/**
 * Cookie-based mode persistence with JWT signing
 * Provides durable mode selection without client redirects
 */

export type Mode = "training" | "discovery";

const COOKIE_NAME = "athletiqs_mode";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Get or generate secret key for JWT signing
function getSecretKey(): Uint8Array {
  const secret = process.env.MODE_COOKIE_SECRET;

  if (!secret) {
    logger.warn("MODE_COOKIE_SECRET not set, using insecure fallback");
    // Fallback for development - NOT secure for production
    return new TextEncoder().encode("insecure-fallback-secret-change-in-production");
  }

  if (secret.length < 32) {
    logger.warn("MODE_COOKIE_SECRET should be at least 32 characters for security");
  }

  return new TextEncoder().encode(secret);
}

const SECRET_KEY = getSecretKey();

/**
 * Get the current mode from the signed cookie
 * Returns 'training' as the default if no mode is set
 */
export async function getMode(): Promise<Mode> {
  try {
    const cookieStore = await cookies();
    const modeCookie = cookieStore.get(COOKIE_NAME);

    if (!modeCookie?.value) {
      return "training";
    }

    // Verify and decode the JWT
    const { payload } = await jwtVerify(modeCookie.value, SECRET_KEY, {
      algorithms: ["HS256"],
    });

    const mode = payload.mode as Mode | undefined;

    if (mode !== "training" && mode !== "discovery") {
      logger.warn({ mode }, "Invalid mode in cookie, defaulting to training");
      return "training";
    }

    return mode;
  } catch (error) {
    // JWT verification failed or other error
    logger.warn({ error: error instanceof Error ? error.message : String(error) }, "Failed to read mode cookie");
    return "training";
  }
}

/**
 * Set the mode in a signed cookie
 * This should be called from a server action or route handler
 */
export async function setMode(mode: Mode): Promise<void> {
  try {
    // Create a signed JWT with the mode
    const token = await new SignJWT({ mode })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${COOKIE_MAX_AGE}s`)
      .sign(SECRET_KEY);

    const cookieStore = await cookies();

    // Set the cookie
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    logger.info({ mode }, "Mode cookie set");
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), mode },
      "Failed to set mode cookie"
    );
    throw new Error("Failed to set mode");
  }
}

/**
 * Clear the mode cookie
 */
export async function clearMode(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    logger.info("Mode cookie cleared");
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, "Failed to clear mode cookie");
    throw new Error("Failed to clear mode");
  }
}

/**
 * Server action to toggle mode
 * Can be called from client components
 */
export async function toggleMode(): Promise<Mode> {
  const currentMode = await getMode();
  const newMode: Mode = currentMode === "training" ? "discovery" : "training";
  await setMode(newMode);
  return newMode;
}
