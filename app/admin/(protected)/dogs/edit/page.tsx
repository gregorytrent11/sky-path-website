"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type {
  Dog,
  DogAgeCategory,
  DogEnergyLevel,
  DogInsert,
  DogSex,
  DogSize,
  DogStatus,
  DogUpdate,
} from "@/types/database";
import DogMediaManager from "@/components/admin/DogMediaManager";
import { slugify } from "@/lib/slugify";

type FormState = {
  name: string;
  slug: string;
  status: DogStatus;
  breed: string;
  sex: DogSex | "";
  age_category: DogAgeCategory | "";
  weight_lbs: string;
  size: DogSize | "";
  energy_level: DogEnergyLevel | "";
  good_with_kids: boolean;
  good_with_dogs: boolean;
  good_with_cats: boolean;
  house_trained: boolean;
  location: string;
  intake_date: string;
  description: string;
  foster_notes: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  status: "draft",
  breed: "",
  sex: "",
  age_category: "",
  weight_lbs: "",
  size: "",
  energy_level: "",
  good_with_kids: false,
  good_with_dogs: false,
  good_with_cats: false,
  house_trained: false,
  location: "",
  intake_date: "",
  description: "",
  foster_notes: "",
};

function dogToForm(dog: Dog): FormState {
  return {
    name: dog.name,
    slug: dog.slug,
    status: dog.status,
    breed: dog.breed ?? "",
    sex: dog.sex ?? "",
    age_category: dog.age_category ?? "",
    weight_lbs: dog.weight_lbs != null ? String(dog.weight_lbs) : "",
    size: dog.size ?? "",
    energy_level: dog.energy_level ?? "",
    good_with_kids: !!dog.good_with_kids,
    good_with_dogs: !!dog.good_with_dogs,
    good_with_cats: !!dog.good_with_cats,
    house_trained: !!dog.house_trained,
    location: dog.location ?? "",
    intake_date: dog.intake_date ?? "",
    description: dog.description ?? "",
    foster_notes: dog.foster_notes ?? "",
  };
}

function selectClasses() {
  return "mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple";
}

function EditDogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dogId = searchParams.get("id");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!!dogId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dogName, setDogName] = useState<string | null>(null);

  useEffect(() => {
    if (!dogId) return;
    // Resets loading state before an intentional external data fetch,
    // guarded by dogId dependency; not derived/cascading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    async function load() {
      const { data } = await supabase.from("dogs").select("*").eq("id", dogId as string).maybeSingle();
      if (data) {
        const loadedDog: Dog = data;
        setForm(dogToForm(loadedDog));
        setSlugTouched(true);
        setDogName(loadedDog.name);
      }
      setLoading(false);
    }
    load();
  }, [dogId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload: DogUpdate = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      status: form.status,
      breed: form.breed.trim() || null,
      sex: form.sex || null,
      age_category: form.age_category || null,
      weight_lbs: form.weight_lbs ? Number(form.weight_lbs) : null,
      size: form.size || null,
      energy_level: form.energy_level || null,
      good_with_kids: form.good_with_kids,
      good_with_dogs: form.good_with_dogs,
      good_with_cats: form.good_with_cats,
      house_trained: form.house_trained,
      location: form.location.trim() || null,
      intake_date: form.intake_date || null,
      description: form.description.trim() || null,
      foster_notes: form.foster_notes.trim() || null,
    };

    if (dogId) {
      const { error: updateError } = await supabase.from("dogs").update(payload).eq("id", dogId);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push("/admin/dogs/");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const insertPayload: DogInsert = {
        ...payload,
        name: payload.name!,
        slug: payload.slug!,
        created_by: user?.id,
      };
      const { data, error: insertError } = await supabase
        .from("dogs")
        .insert(insertPayload)
        .select("id")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message ?? "Could not create dog.");
        return;
      }
      router.push(`/admin/dogs/edit/?id=${data.id}`);
    }
  }

  if (loading) {
    return <p className="text-brand-charcoal/80">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin/dogs/" className="text-sm text-brand-purple hover:underline">
          ← Back to dogs
        </Link>
      </div>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-deep-blue">
        {dogId ? `Edit ${dogName ?? "Dog"}` : "Add a Dog"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dog-name" className="block text-sm font-medium text-brand-charcoal">
              Name *
            </label>
            <input
              id="dog-name"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                update("name", name);
                if (!slugTouched) update("slug", slugify(name));
              }}
              className={selectClasses()}
            />
          </div>
          <div>
            <label htmlFor="dog-slug" className="block text-sm font-medium text-brand-charcoal">
              URL slug *
            </label>
            <input
              id="dog-slug"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", slugify(e.target.value));
              }}
              className={selectClasses()}
            />
          </div>
        </div>

        <div>
          <label htmlFor="dog-status" className="block text-sm font-medium text-brand-charcoal">
            Status
          </label>
          <select
            id="dog-status"
            value={form.status}
            onChange={(e) => update("status", e.target.value as DogStatus)}
            className={selectClasses()}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
            <option value="pending">Adoption Pending</option>
            <option value="adopted">Adopted</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dog-breed" className="block text-sm font-medium text-brand-charcoal">
              Breed
            </label>
            <input
              id="dog-breed"
              value={form.breed}
              onChange={(e) => update("breed", e.target.value)}
              className={selectClasses()}
            />
          </div>
          <div>
            <label htmlFor="dog-location" className="block text-sm font-medium text-brand-charcoal">
              Location
            </label>
            <input
              id="dog-location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={selectClasses()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="dog-sex" className="block text-sm font-medium text-brand-charcoal">
              Sex
            </label>
            <select
              id="dog-sex"
              value={form.sex}
              onChange={(e) => update("sex", e.target.value as DogSex)}
              className={selectClasses()}
            >
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label htmlFor="dog-age" className="block text-sm font-medium text-brand-charcoal">
              Age
            </label>
            <select
              id="dog-age"
              value={form.age_category}
              onChange={(e) => update("age_category", e.target.value as DogAgeCategory)}
              className={selectClasses()}
            >
              <option value="">—</option>
              <option value="puppy">Puppy</option>
              <option value="young">Young</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label htmlFor="dog-size" className="block text-sm font-medium text-brand-charcoal">
              Size
            </label>
            <select
              id="dog-size"
              value={form.size}
              onChange={(e) => update("size", e.target.value as DogSize)}
              className={selectClasses()}
            >
              <option value="">—</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>
          <div>
            <label htmlFor="dog-weight" className="block text-sm font-medium text-brand-charcoal">
              Weight (lbs)
            </label>
            <input
              id="dog-weight"
              type="number"
              min="0"
              value={form.weight_lbs}
              onChange={(e) => update("weight_lbs", e.target.value)}
              className={selectClasses()}
            />
          </div>
        </div>

        <div>
          <label htmlFor="dog-energy" className="block text-sm font-medium text-brand-charcoal">
            Energy level
          </label>
          <select
            id="dog-energy"
            value={form.energy_level}
            onChange={(e) => update("energy_level", e.target.value as DogEnergyLevel)}
            className={selectClasses()}
          >
            <option value="">—</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-brand-charcoal">Compatibility</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["good_with_kids", "Good with kids"],
                ["good_with_dogs", "Good with dogs"],
                ["good_with_cats", "Good with cats"],
                ["house_trained", "House trained"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-brand-charcoal">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="dog-intake-date" className="block text-sm font-medium text-brand-charcoal">
            Intake date
          </label>
          <input
            id="dog-intake-date"
            type="date"
            value={form.intake_date}
            onChange={(e) => update("intake_date", e.target.value)}
            className={selectClasses()}
          />
        </div>

        <div>
          <label htmlFor="dog-description" className="block text-sm font-medium text-brand-charcoal">
            Public description
          </label>
          <textarea
            id="dog-description"
            rows={6}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={selectClasses()}
          />
        </div>

        <div>
          <label htmlFor="dog-foster-notes" className="block text-sm font-medium text-brand-charcoal">
            Foster notes (internal only, never shown publicly)
          </label>
          <textarea
            id="dog-foster-notes"
            rows={4}
            value={form.foster_notes}
            onChange={(e) => update("foster_notes", e.target.value)}
            className={selectClasses()}
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
          {saving ? "Saving…" : dogId ? "Save Changes" : "Create Dog"}
        </button>
      </form>

      {dogId && (
        <div className="mt-10 max-w-2xl border-t border-brand-soft-blue/60 pt-6">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">Photos &amp; Video</h2>
          <div className="mt-3">
            <DogMediaManager dogId={dogId} dogName={form.name || "this dog"} />
          </div>
        </div>
      )}
      {!dogId && (
        <p className="mt-6 max-w-2xl text-sm text-brand-charcoal/80">
          Save the dog first, then you&rsquo;ll be able to upload photos and video.
        </p>
      )}
    </div>
  );
}

export default function EditDogPage() {
  return (
    <Suspense fallback={<p className="text-brand-charcoal/80">Loading…</p>}>
      <EditDogForm />
    </Suspense>
  );
}
