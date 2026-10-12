import Link from "next/link";
import type { Dog } from "@/types/database";
import { dogSummaryLine } from "@/components/dogs/dog-display";
import CroppedPhoto from "@/components/dogs/CroppedPhoto";

export default function DogCard({ dog }: { dog: Dog }) {
  return (
    <Link
      href={`/dogs/${dog.slug}/`}
      className="group block overflow-hidden rounded-xl border border-brand-soft-blue/60 bg-brand-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray">
        {dog.primary_photo_url ? (
          <CroppedPhoto
            src={dog.primary_photo_url}
            alt={dog.name}
            crop={dog.primary_photo_crop}
            focalX={dog.primary_photo_focal_x}
            focalY={dog.primary_photo_focal_y}
            className="transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-charcoal/70">
            Photo coming soon
          </div>
        )}
        {dog.status === "adopted" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-deep-blue px-3 py-1 text-xs font-semibold text-brand-white">
            Adopted
          </span>
        )}
        {dog.status === "incoming" && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-brand-charcoal">
            Incoming
          </span>
        )}
        {dog.status === "pending" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-purple px-3 py-1 text-xs font-semibold text-brand-white">
            Pending Adoption
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">{dog.name}</h2>
        <p className="mt-1 text-sm text-brand-charcoal/80">{dogSummaryLine(dog) || "Details coming soon"}</p>
      </div>
    </Link>
  );
}
