import type { PhotoCrop } from "@/types/database";
import { CARD_ASPECT, croppedImageStyle, isPhotoCrop } from "@/lib/photo-crop";

// Renders a dog photo inside a positioned frame (the parent must be
// `relative` with a fixed aspect ratio). With a stored crop the exact
// rectangle the admin chose fills the frame; without one it falls back to
// the original cover + focal-point behaviour.
//
// `images.unoptimized` is on (static export), so next/image would be a plain
// <img> anyway -- using <img> directly lets the crop maths set width/height.
export default function CroppedPhoto({
  src,
  alt,
  crop,
  focalX = 50,
  focalY = 50,
  frameAspect = CARD_ASPECT,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  crop?: PhotoCrop | null;
  focalX?: number;
  focalY?: number;
  frameAspect?: number;
  className?: string;
  priority?: boolean;
}) {
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : undefined;
  if (isPhotoCrop(crop)) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- crop maths needs direct control of the img box */}
        <img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          draggable={false}
          style={croppedImageStyle(crop, frameAspect)}
        />
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- matches the cropped branch so both render identically */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: `${focalX}% ${focalY}%` }}
      />
    </div>
  );
}
