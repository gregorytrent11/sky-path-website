"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { triggerDeploy } from "@/lib/trigger-deploy";
import type { Dog, DogStatus } from "@/types/database";

const statusStyles: Record<DogStatus, string> = {
  draft: "bg-brand-gray text-brand-charcoal",
  published: "bg-green-100 text-green-800",
  pending: "bg-brand-purple text-brand-white",
  adopted: "bg-brand-deep-blue text-brand-white",
  archived: "bg-brand-charcoal/10 text-brand-charcoal/80",
};

export default function AdminDogsPage() {
  const router = useRouter();
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
    triggerDeploy();
  }

  async function markAdopted(id: string) {
    setBusyId(id);
    await supabase.from("dogs").update({ status: "adopted" }).eq("id", id);
    setBusyId(null);
    triggerDeploy();
    // Send the admin straight to the edit form, where a success story can
    // now be added -- marking adopted from the list alone left no obvious
    // way to find that field.
    router.push(`/admin/dogs/edit/?id=${id}`);
  }

  async function setVisible(id: string, is_visible: boolean) {
    setBusyId(id);
    await supabase.from("dogs").update({ is_visible }).eq("id", id);
    await reload();
    setBusyId(null);
    triggerDeploy();
  }

  async function setFeatured(id: string, featured: boolean) {
    setBusyId(id);
    await supabase.from("dogs").update({ featured }).eq("id", id);
    await reload();
    setBusyId(null);
    // Featured status only affects the homepage's client-side dog fetch,
    // not which static pages exist -- no rebuild needed.
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This also removes their photos and cannot be undone.`)) {
      return;
    }
    setBusyId(id);
    await supabase.from("dogs").delete().eq("id", id);
    await reload();
    setBusyId(null);
    triggerDeploy();
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
                    {!dog.is_visible && (
                      <span className="ml-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Hidden
                      </span>
                    )}
                    {dog.featured && (
                      <span className="ml-1 rounded-full bg-brand-purple/10 px-2 py-1 text-xs font-medium text-brand-purple">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/80">{dog.breed || "-"}</td>
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
                        <>
                          <button
                            type="button"
                            disabled={busyId === dog.id}
                            onClick={() => setStatus(dog.id, "draft")}
                            className="text-brand-charcoal/70 hover:underline"
                          >
                            Unpublish
                          </button>
                          <button
                            type="button"
                            disabled={busyId === dog.id}
                            onClick={() => setStatus(dog.id, "archived")}
                            className="text-brand-charcoal/70 hover:underline"
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {dog.status !== "adopted" ? (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => markAdopted(dog.id)}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Mark Adopted
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setStatus(dog.id, "published")}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Unmark Adopted
                        </button>
                      )}
                      {dog.is_visible ? (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setVisible(dog.id, false)}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Hide from site
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setVisible(dog.id, true)}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Show on site
                        </button>
                      )}
                      {dog.featured ? (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setFeatured(dog.id, false)}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Unfeature
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === dog.id}
                          onClick={() => setFeatured(dog.id, true)}
                          className="text-brand-charcoal/70 hover:underline"
                        >
                          Feature
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
