import { supabase } from "@/lib/supabase/client";

// At most this many success stories are published on the site at once; the
// rescue's social media pages carry the full history. Publishing one more
// moves the oldest to the archive (Admin > Success Stories), and the public
// page never lists more.
export const MAX_SUCCESS_STORIES = 10;

// The homepage shows only the most recent few, with a button to the full page.
export const HOMEPAGE_SUCCESS_STORIES = 4;

// Call after a story has been published. Keeps the newest MAX_SUCCESS_STORIES
// stories on the website and moves any older ones to the archive. Returns the
// names of the dogs whose stories were archived. "Newest" is by last save,
// the same order the public pages use, so the story just published is always
// kept.
export async function archiveOverflowStories(): Promise<{
  archived: string[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("dogs")
    .select("id, name, success_story")
    .eq("status", "adopted")
    .eq("is_visible", true)
    .eq("success_story_status", "published")
    .not("success_story", "is", null)
    .order("updated_at", { ascending: false });
  if (error) return { archived: [], error: error.message };

  const overflow = (data ?? [])
    .filter((dog) => dog.success_story?.trim())
    .slice(MAX_SUCCESS_STORIES);
  if (overflow.length === 0) return { archived: [], error: null };

  const { error: updateError } = await supabase
    .from("dogs")
    .update({ success_story_status: "archived" })
    .in(
      "id",
      overflow.map((dog) => dog.id)
    );
  if (updateError) return { archived: [], error: updateError.message };
  return { archived: overflow.map((dog) => dog.name), error: null };
}
