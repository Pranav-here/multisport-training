"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { logger } from "@/lib/log";

/**
 * Server actions for dashboard mutations
 * These run on the server and provide type-safe mutations
 */

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Toggle like on a clip
 */
export async function toggleClipLike(clipId: string): Promise<ActionResult<{ liked: boolean; count: number }>> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from("clip_likes")
      .select("id")
      .eq("clip_id", clipId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      logger.error({ error: checkError.message, clipId, userId: user.id }, "Failed to check existing like");
      return { success: false, error: "Failed to check like status" };
    }

    let liked = false;

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase.from("clip_likes").delete().eq("id", existingLike.id);

      if (deleteError) {
        logger.error({ error: deleteError.message, clipId, userId: user.id }, "Failed to unlike clip");
        return { success: false, error: "Failed to unlike" };
      }

      liked = false;
    } else {
      // Like
      const { error: insertError } = await supabase.from("clip_likes").insert({
        clip_id: clipId,
        user_id: user.id,
      });

      if (insertError) {
        logger.error({ error: insertError.message, clipId, userId: user.id }, "Failed to like clip");
        return { success: false, error: "Failed to like" };
      }

      liked = true;
    }

    // Get updated count
    const { count, error: countError } = await supabase
      .from("clip_likes")
      .select("id", { count: "exact", head: true })
      .eq("clip_id", clipId);

    if (countError) {
      logger.error({ error: countError.message, clipId }, "Failed to get like count");
      // Still return success, just with estimated count
      return { success: true, data: { liked, count: liked ? 1 : 0 } };
    }

    logger.info({ clipId, userId: user.id, liked, count }, "Toggled clip like");

    // Revalidate the dashboard page to show updated data
    revalidatePath("/dashboard");

    return { success: true, data: { liked, count: count ?? 0 } };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), clipId },
      "Unexpected error toggling clip like"
    );
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a clip
 */
export async function deleteClip(clipId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const { data: clip, error: fetchError } = await supabase
      .from("clips")
      .select("user_id")
      .eq("id", clipId)
      .single();

    if (fetchError || !clip) {
      logger.error({ error: fetchError?.message, clipId, userId: user.id }, "Failed to fetch clip for deletion");
      return { success: false, error: "Clip not found" };
    }

    if (clip.user_id !== user.id) {
      logger.warn({ clipId, userId: user.id, ownerId: clip.user_id }, "Unauthorized clip deletion attempt");
      return { success: false, error: "You don't have permission to delete this clip" };
    }

    // Delete the clip
    const { error: deleteError } = await supabase.from("clips").delete().eq("id", clipId);

    if (deleteError) {
      logger.error({ error: deleteError.message, clipId, userId: user.id }, "Failed to delete clip");
      return { success: false, error: "Failed to delete clip" };
    }

    logger.info({ clipId, userId: user.id }, "Deleted clip");

    // Revalidate the dashboard page
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), clipId },
      "Unexpected error deleting clip"
    );
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Submit a quick post
 */
export async function submitQuickPost(data: {
  content: string;
  tags: string[];
}): Promise<ActionResult<{ postId: string }>> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (!data.content || data.content.trim().length === 0) {
      return { success: false, error: "Content is required" };
    }

    if (data.content.length > 200) {
      return { success: false, error: "Content must be 200 characters or less" };
    }

    // TODO: Create a quick post in the database
    // For now, just log it
    logger.info(
      { userId: user.id, content: data.content, tags: data.tags },
      "Quick post submitted (not yet implemented)"
    );

    // Revalidate the dashboard page
    revalidatePath("/dashboard");

    return { success: true, data: { postId: "temp-id" } };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Unexpected error submitting quick post"
    );
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Increment streak
 */
export async function incrementStreak(hashtagId?: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Call the increment streak RPC or update the streaks table
    // TODO: Implement proper streak increment logic
    logger.info({ userId: user.id, hashtagId }, "Increment streak (not yet fully implemented)");

    // Revalidate the dashboard page
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Unexpected error incrementing streak"
    );
    return { success: false, error: "An unexpected error occurred" };
  }
}
