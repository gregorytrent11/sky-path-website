import type { PhotoCrop } from "@/types/database";

// Every place a dog photo is shown is a 4:3 frame (homepage/listing cards,
// profile gallery, success stories) or a square (admin + gallery thumbnails),
// so the crop admins draw is a 4:3 box -- what the cards will show.
export const CARD_ASPECT = 4 / 3;

export const MAX_FEATURED_DOGS = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Largest 4:3 crop that fits the image, placed so the stored focal point
// lands where `object-fit: cover; object-position: X% Y%` would have put it.
// Opening the editor on a never-cropped photo therefore shows exactly what
// visitors see today.
export function cropFromFocal(
  naturalWidth: number,
  naturalHeight: number,
  focalX: number,
  focalY: number,
  aspect = CARD_ASPECT
): PhotoCrop {
  const imageAspect = naturalWidth / naturalHeight;
  let w = 1;
  let h = 1;
  if (imageAspect > aspect) {
    // Image is wider than the frame: full height, trimmed sides.
    w = aspect / imageAspect;
  } else {
    h = imageAspect / aspect;
  }
  const x = (focalX / 100) * (1 - w);
  const y = (focalY / 100) * (1 - h);
  return normalizeCrop({ x, y, w, h, ar: aspect });
}

// Keeps a crop inside the image and its numbers tidy for storage.
export function normalizeCrop(crop: PhotoCrop): PhotoCrop {
  const w = clamp(crop.w, 0.02, 1);
  const h = clamp(crop.h, 0.02, 1);
  const x = clamp(crop.x, 0, 1 - w);
  const y = clamp(crop.y, 0, 1 - h);
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return { x: round(x), y: round(y), w: round(w), h: round(h), ar: round(crop.ar) };
}

// Centre of the crop as a 0-100 focal point, so the legacy focal columns
// stay meaningful for anything that still reads them.
export function focalFromCrop(crop: PhotoCrop): { x: number; y: number } {
  return {
    x: Math.round((crop.x + crop.w / 2) * 100),
    y: Math.round((crop.y + crop.h / 2) * 100),
  };
}

// Inline styles that make an absolutely positioned <img> show `crop` filling
// a frame of aspect `frameAspect` (width / height) with cover semantics: the
// crop is scaled until it covers the frame and centred, so a 4:3 crop in a
// square thumbnail loses a little on the left and right, never the top.
//
// Only percentages and transforms are used, so no natural image size is
// needed: the img keeps its own aspect ratio via `height: auto` (or `width:
// auto`), and translate percentages refer to the img's own box.
export function croppedImageStyle(crop: PhotoCrop, frameAspect: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    maxWidth: "none",
    maxHeight: "none",
  };
  if (frameAspect >= crop.ar) {
    // Frame is wider than the crop: crop width spans the frame width.
    return {
      ...base,
      width: `${100 / crop.w}%`,
      height: "auto",
      left: `${(-crop.x / crop.w) * 100}%`,
      top: "50%",
      transform: `translateY(-${(crop.y + crop.h / 2) * 100}%)`,
    };
  }
  // Frame is taller than the crop: crop height spans the frame height.
  return {
    ...base,
    height: `${100 / crop.h}%`,
    width: "auto",
    top: `${(-crop.y / crop.h) * 100}%`,
    left: "50%",
    transform: `translateX(-${(crop.x + crop.w / 2) * 100}%)`,
  };
}

export function isPhotoCrop(value: unknown): value is PhotoCrop {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return ["x", "y", "w", "h", "ar"].every((k) => typeof c[k] === "number" && Number.isFinite(c[k]));
}
