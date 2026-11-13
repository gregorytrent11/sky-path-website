"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import { toPlainText } from "@/components/RichText";
import {
  HOMEPAGE_SUCCESS_STORIES,
  MAX_SUCCESS_STORIES,
  archiveOverflowStories,
} from "@/lib/success-stories";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminSuccessStoriesPage() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"live" | "archive">("live");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("status", "adopted")
      .in("success_story_status", ["published", "archived"])
      .not("success_story", "is", null)
      .order("updated_at", { ascending: false });
    setDogs((data ?? []).filter((dog: Dog) => dog.success_story?.trim()));
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  const live = dogs ? dogs.filter((dog) => dog.success_story_status === "published") : [];
  const archive = dogs ? dogs.filter((dog) => dog.success_story_status === "archived") : [];
  // A hidden dog's story is published but not on the site, and doesn't take
  // one of the slots.
  const showingCount = live.filter((dog) => dog.is_visible).length;

  async function moveToArchive(dog: Dog) {
    setNotice(null);
    setError(null);
    setBusyId(dog.id);
    const { error: updateError } = await supabase
      .from("dogs")
      .update({ success_story_status: "archived" })
      .eq("id", dog.id);
    if (updateError) setError(updateError.message);
    else setNotice(`${dog.name}'s story moved to the archive.`);
    await reload();
    setBusyId(null);
  }

  async function putBack(dog: Dog) {
    setNotice(null);
    setError(null);
    setBusyId(dog.id);
    const { error: updateError } = await supabase
      .from("dogs")
      .update({ success_story_status: "published" })
      .eq("id", dog.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      // Back on the site as the newest story; if that makes one too many,
      // the oldest takes its place in the archive.
      const { archived, error: archiveError } = await archiveOverflowStories();
      if (archiveError) setError(archiveError);
      else
        setNotice(
          archived.length > 0
            ? `${dog.name}'s story is back on the website. To make room, ${archived.join(", ")} moved to the archive.`
            : `${dog.name}'s story is back on the website.`
        );
    }
    await reload();
    setBusyId(null);
  }

  // Deleting removes the story text only; the dog's record and photos stay.
  async function deleteStory(dog: Dog) {
    if (
      !window.confirm(
        `Delete ${dog.name}'s success story? The story text will be removed and cannot be recovered. ${dog.name}'s dog record and photos are kept.`
      )
    ) {
      return;
    }
    setNotice(null);
    setError(null);
    setBusyId(dog.id);
    const { error: updateError } = await supabase
      .from("dogs")
      .update({ success_story: null, success_story_status: "draft" })
      .eq("id", dog.id);
    if (updateError) setError(updateError.message);
    else setNotice(`${dog.name}'s story was deleted.`);
    await reload();
    setBusyId(null);
  }

  function storyTable(rows: Dog[], archived: boolean) {
    return (
      <div className="mt-3 overflow-x-auto rounded-xl border border-brand-soft-blue/60">
        <table className="min-w-full divide-y divide-brand-soft-blue/60 bg-brand-white text-sm">
          <thead className="bg-brand-gray/50 text-left text-xs uppercase tracking-wide text-brand-charcoal/80">
            <tr>
              <th className="px-4 py-3">Dog</th>
              <th className="px-4 py-3">Story</th>
              <th className="px-4 py-3">Last saved</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-soft-blue/30">
            {rows.map((dog) => (
              <tr key={dog.id} className={busyId === dog.id ? "opacity-50" : ""}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-charcoal">
                  {dog.name}
                  {!dog.is_visible && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      Hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-brand-charcoal/80">
                  <p className="line-clamp-2 max-w-md">{toPlainText(dog.success_story ?? "")}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brand-charcoal/80">
                  {formatDate(dog.updated_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/dogs/edit/?id=${dog.id}`}
                      className="text-brand-purple hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === dog.id}
                      onClick={() => (archived ? putBack(dog) : moveToArchive(dog))}
                      className="text-brand-charcoal/70 hover:underline"
                    >
                      {archived ? "Put back on website" : "Move to archive"}
                    </button>
                    {archived && (
                      <button
                        type="button"
                        disabled={busyId === dog.id}
                        onClick={() => deleteStory(dog)}
                        className="text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Success Stories</h1>
      <p className="mt-3 text-sm text-brand-charcoal/70">
        The website shows up to {MAX_SUCCESS_STORIES} stories, and the homepage shows the{" "}
        {HOMEPAGE_SUCCESS_STORIES} most recent. When another story is published, the oldest one
        moves to the Archive tab. To write a story, open an adopted dog from the Dogs page.
      </p>

      {notice && (
        <p role="status" className="mt-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!dogs ? (
        <p className="mt-6 text-brand-charcoal/80">Loading…</p>
      ) : (
        <>
          <div role="tablist" aria-label="Success stories" className="mt-6 flex gap-1 border-b border-brand-soft-blue/60">
            {(
              [
                ["live", `On the website (${showingCount} of ${MAX_SUCCESS_STORIES})`],
                ["archive", `Archive (${archive.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`-mb-px rounded-t-md border-b-2 px-4 py-2 text-sm font-semibold ${
                  tab === key
                    ? "border-brand-purple text-brand-purple"
                    : "border-transparent text-brand-charcoal/70 hover:text-brand-charcoal"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "live" ? (
            live.length === 0 ? (
              <p className="mt-4 text-sm text-brand-charcoal/80">No stories are published yet.</p>
            ) : (
              storyTable(live, false)
            )
          ) : archive.length === 0 ? (
            <p className="mt-4 text-sm text-brand-charcoal/80">
              Nothing in the archive yet. Stories land here when you move them, or once more than{" "}
              {MAX_SUCCESS_STORIES} have been published.
            </p>
          ) : (
            storyTable(archive, true)
          )}
        </>
      )}
    </div>
  );
}
