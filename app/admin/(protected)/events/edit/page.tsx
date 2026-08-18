"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { Event, EventInsert, EventStatus, EventUpdate } from "@/types/database";
import { slugify } from "@/lib/slugify";
import { triggerDeploy } from "@/lib/trigger-deploy";
import { removeEventCoverObject } from "@/lib/storage-cleanup";
import FocalPointPicker from "@/components/admin/FocalPointPicker";
import RichTextField from "@/components/admin/RichTextField";

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024;

type FormState = {
  title: string;
  slug: string;
  status: EventStatus;
  event_date: string;
  location: string;
  summary: string;
  body: string;
  cover_image_url: string;
  cover_focal_x: number;
  cover_focal_y: number;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  status: "draft",
  event_date: "",
  location: "",
  summary: "",
  body: "",
  cover_image_url: "",
  cover_focal_x: 50,
  cover_focal_y: 50,
};

function eventToForm(event: Event): FormState {
  return {
    title: event.title,
    slug: event.slug,
    status: event.status,
    event_date: event.event_date ?? "",
    location: event.location ?? "",
    summary: event.summary ?? "",
    body: event.body ?? "",
    cover_image_url: event.cover_image_url ?? "",
    cover_focal_x: event.cover_focal_x ?? 50,
    cover_focal_y: event.cover_focal_y ?? 50,
  };
}

function fieldClasses() {
  return "mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple";
}

function EditEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!!eventId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    // Resets loading state before an intentional external data fetch,
    // guarded by eventId dependency; not derived/cascading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    async function load() {
      const { data } = await supabase.from("events").select("*").eq("id", eventId as string).maybeSingle();
      if (data) {
        setForm(eventToForm(data));
        setSlugTouched(true);
        setOriginalSlug(data.slug);
      }
      setLoading(false);
    }
    load();
  }, [eventId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Covers that this edit replaced or removed. They're deleted only once the
  // save succeeds -- deleting on the spot would leave the still-saved row
  // pointing at a missing file if the admin then navigated away.
  const supersededCovers = useRef<string[]>([]);

  function supersedeCover(url: string) {
    if (url) supersededCovers.current.push(url);
  }

  async function flushSupersededCovers() {
    const urls = supersededCovers.current;
    supersededCovers.current = [];
    await Promise.all(urls.map((url) => removeEventCoverObject(url)));
  }

  async function handleCoverUpload(file: File | undefined) {
    if (!file) return;
    setCoverError(null);
    const replacedCover = form.cover_image_url;

    if (!file.type.startsWith("image/")) {
      setCoverError("Cover photo must be an image.");
      return;
    }
    if (file.size > MAX_COVER_IMAGE_BYTES) {
      setCoverError(`Cover photo must be under ${MAX_COVER_IMAGE_BYTES / 1024 / 1024}MB.`);
      return;
    }

    setCoverUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `covers/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("event-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) {
      setCoverUploading(false);
      setCoverError(`Upload failed: ${uploadError.message}`);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("event-photos").getPublicUrl(path);
    supersedeCover(replacedCover);
    setForm((prev) => ({
      ...prev,
      cover_image_url: publicUrlData.publicUrl,
      cover_focal_x: 50,
      cover_focal_y: 50,
    }));
    setCoverUploading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload: EventUpdate = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      status: form.status,
      event_date: form.event_date || null,
      location: form.location.trim() || null,
      summary: form.summary.trim() || null,
      body: form.body.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      cover_focal_x: form.cover_focal_x,
      cover_focal_y: form.cover_focal_y,
    };

    if (eventId) {
      const { error: updateError } = await supabase.from("events").update(payload).eq("id", eventId);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      // A brand-new page shell is only needed when the URL itself changes
      // -- editing content on an existing page doesn't, since the page
      // fetches live data from Supabase on load regardless of the static
      // build.
      await flushSupersededCovers();
      if (payload.slug !== originalSlug) triggerDeploy();
      router.push("/admin/events/");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const insertPayload: EventInsert = {
        ...payload,
        title: payload.title!,
        slug: payload.slug!,
        created_by: user?.id,
      };
      const { error: insertError } = await supabase.from("events").insert(insertPayload);
      setSaving(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      await flushSupersededCovers();
      triggerDeploy();
      router.push("/admin/events/");
    }
  }

  if (loading) {
    return <p className="text-brand-charcoal/80">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin/events/" className="text-sm text-brand-purple hover:underline">
          ← Back to events
        </Link>
      </div>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-deep-blue">
        {eventId ? "Edit Event" : "Add an Event"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-brand-charcoal">
              Title *
            </label>
            <input
              id="event-title"
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                update("title", title);
                if (!slugTouched) update("slug", slugify(title));
              }}
              className={fieldClasses()}
            />
          </div>
          <div>
            <label htmlFor="event-slug" className="block text-sm font-medium text-brand-charcoal">
              URL slug *
            </label>
            <input
              id="event-slug"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", slugify(e.target.value));
              }}
              className={fieldClasses()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-status" className="block text-sm font-medium text-brand-charcoal">
              Status
            </label>
            <select
              id="event-status"
              value={form.status}
              onChange={(e) => update("status", e.target.value as EventStatus)}
              className={fieldClasses()}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-brand-charcoal">
              Event date
            </label>
            <input
              id="event-date"
              type="date"
              value={form.event_date}
              onChange={(e) => update("event_date", e.target.value)}
              className={fieldClasses()}
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-location" className="block text-sm font-medium text-brand-charcoal">
            Location
          </label>
          <input
            id="event-location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className={fieldClasses()}
          />
        </div>

        <div>
          <label htmlFor="event-cover-image" className="block text-sm font-medium text-brand-charcoal">
            Cover photo
          </label>
          {form.cover_image_url && (
            <div className="mt-2 flex flex-wrap items-start gap-6">
              <FocalPointPicker
                src={form.cover_image_url}
                x={form.cover_focal_x}
                y={form.cover_focal_y}
                onChange={(x, y) => setForm((prev) => ({ ...prev, cover_focal_x: x, cover_focal_y: y }))}
              />
              <div>
                <p className="text-xs font-medium text-brand-charcoal/70">Preview on events list</p>
                <div className="relative mt-1 aspect-[4/3] w-40 overflow-hidden rounded-lg bg-brand-gray">
                  <Image
                    src={form.cover_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: `${form.cover_focal_x}% ${form.cover_focal_y}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-purple px-4 py-2 text-sm font-semibold text-brand-purple hover:bg-brand-lavender/20">
              {coverUploading ? "Uploading…" : form.cover_image_url ? "Replace photo" : "Upload photo"}
              <input
                id="event-cover-image"
                type="file"
                accept="image/*"
                disabled={coverUploading}
                onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                className="sr-only"
              />
            </label>
            {form.cover_image_url && (
              <button
                type="button"
                onClick={() => {
                  supersedeCover(form.cover_image_url);
                  update("cover_image_url", "");
                }}
                className="text-sm text-red-700 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-brand-charcoal/60">Images up to 2MB.</p>
          {coverError && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {coverError}
            </p>
          )}
        </div>

        <RichTextField
          id="event-summary"
          label="Summary (shown on the events list)"
          value={form.summary}
          onChange={(value) => update("summary", value)}
          maxLength={750}
          rows={3}
          hint="The events list clamps this to three lines of plain text, so formatting here won't be visible to visitors."
        />

        <RichTextField
          id="event-body"
          label="Full post"
          value={form.body}
          onChange={(value) => update("body", value)}
          maxLength={1500}
          rows={10}
        />

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
        >
          {saving ? "Saving…" : eventId ? "Save Changes" : "Create Event"}
        </button>
      </form>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<p className="text-brand-charcoal/80">Loading…</p>}>
      <EditEventForm />
    </Suspense>
  );
}
