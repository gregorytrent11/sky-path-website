"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Dog, DogStatus } from "@/types/database";

const statusStyles: Record<DogStatus, string> = {
  draft: "bg-brand-gray text-brand-charcoal",
  published: "bg-green-100 text-green-800",
  pending: "bg-brand-purple text-brand-white",
  adopted: "bg-brand-deep-blue text-brand-white",
  archived: "bg-brand-charcoal/10 text-brand-charcoal/80",
};

export default function AdminDogsPage() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setDogs(data ?? []);
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  async function setStatus(id: string, status: DogStatus) {
    setBusyId(id);
    await supabase.from("dogs").update({ status }).eq("id", id);
    await reload();
    setBusyId(null);
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This also removes their photos and cannot be undone.`)) {
      return;
    }
    setBusyId(id);
    await supabase.from("dogs").delete().eq("id", id);
    await reload();
    setBusyId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Dogs</h1>
        <Link
          href="/admin/dogs/edit/"
          className="rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-brand-white hover:bg-brand-deep-blue"
        >
          Add Dog
        </Link>
      </div>

      {!dogs ? (
        <p className="mt-6 text-brand-charcoal/80">Loading…</p>
      ) : dogs.length === 0 ? (
        <p className="mt-6 text-brand-charcoal/80">No dogs yet. Add your first one.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-brand-soft-blue/60">
          <table className="min-w-full divide-y divide-brand-soft-blue/60 bg-brand-white text-sm">
            <thead className="bg-brand-gray/50 text-left text-xs uppercase tracking-wide text-brand-charcoal/80">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Breed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-soft-blue/30">
              {dogs.map((dog) => (
                <tr key={dog.id} className={busyId === dog.id ? "opacity-50" : ""}>
                  <td className="px-4 py-3 font-medium text-brand-charcoal">{dog.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[dog.status]}`}>
                      {dog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/80">{dog.breed || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/dogs/edit/?id=${dog.id}`}
                        className="text-brand-purple hover:underline"
                      >
                        Edit
                      </Link>
                      {dog.status !== "published" && dog.status !== "adopted" && (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setStatus(dog.id, "published")}
                          className="text-brand-purple hover:underline"
                        >
                          Publish
                        </button>
                      )}
                      {dog.status === "published" && (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setStatus(dog.id, "archived")}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Archive
                        </button>
                      )}
                      {dog.status !== "adopted" && (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setStatus(dog.id, "adopted")}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Mark Adopted
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === dog.id}
                        onClick={() => remove(dog.id, dog.name)}
                        className="text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
