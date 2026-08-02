"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Event, EventInsert, EventStatus, EventUpdate } from "@/types/database";
import { slugify } from "@/lib/slugify";

type FormState = {
  title: string;
  slug: string;
  status: EventStatus;
  event_date: string;
  location: string;
  summary: string;
  body: string;
  cover_image_url: string;
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
      }
      setLoading(false);
    }
    load();
  }, [eventId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    };

    if (eventId) {
      const { error: updateError } = await supabase.from("events").update(payload).eq("id", eventId);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
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
            Cover image URL
          </label>
          <input
            id="event-cover-image"
            type="url"
            placeholder="https://…"
            value={form.cover_image_url}
            onChange={(e) => update("cover_image_url", e.target.value)}
            className={fieldClasses()}
          />
        </div>

        <div>
          <label htmlFor="event-summary" className="block text-sm font-medium text-brand-charcoal">
            Summary (shown on the events list)
          </label>
          <textarea
            id="event-summary"
            rows={3}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            className={fieldClasses()}
          />
        </div>

        <div>
          <label htmlFor="event-body" className="block text-sm font-medium text-brand-charcoal">
            Full post
          </label>
          <textarea
            id="event-body"
            rows={10}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            className={fieldClasses()}
          />
        </div>

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
