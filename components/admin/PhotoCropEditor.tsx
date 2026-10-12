"use client";

import { useEffect, useRef, useState } from "react";
import type { PhotoCrop } from "@/types/database";
import { CARD_ASPECT, cropFromFocal, normalizeCrop } from "@/lib/photo-crop";
import CroppedPhoto from "@/components/dogs/CroppedPhoto";

// Lets an admin crop and adjust a dog photo: drag the 4:3 box to move it,
// drag its corner or use the slider to zoom, arrow keys to nudge. The crop is
// stored as fractions of the original image, so nothing is re-encoded and the
// original stays untouched -- it can be adjusted again any time.
//
// The picture is shown at its own natural aspect ratio (set once it loads),
// so a box drawn over it maps 1:1 onto fractions of the image itself.
export default function PhotoCropEditor({
  src,
  crop,
  focalX,
  focalY,
  onChange,
}: {
  src: string;
  crop: PhotoCrop | null;
  focalX: number;
  focalY: number;
  onChange: (crop: PhotoCrop) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [draft, setDraft] = useState<PhotoCrop | null>(crop);
  const lastCommitted = useRef<string>(crop ? JSON.stringify(crop) : "");
  const drag = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    start: PhotoCrop;
  } | null>(null);

  // Once the image size is known, a never-cropped photo starts from the box
  // the focal point currently produces -- so the editor opens on exactly what
  // visitors see today.
  useEffect(() => {
    if (!natural || draft) return;
    // Seeding the draft from freshly loaded image dimensions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(cropFromFocal(natural.w, natural.h, focalX, focalY));
  }, [natural, draft, focalX, focalY]);

  // Save a short moment after the last adjustment instead of on every pixel
  // of a drag.
  useEffect(() => {
    if (!draft) return;
    const serialized = JSON.stringify(draft);
    if (serialized === lastCommitted.current) return;
    const handle = window.setTimeout(() => {
      lastCommitted.current = serialized;
      onChange(draft);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draft, onChange]);

  // Fraction of the image height a box of fraction-width `w` must have to
  // stay 4:3 in pixels.
  function heightFor(w: number): number {
    if (!natural) return w;
    return (w * (natural.w / natural.h)) / CARD_ASPECT;
  }

  // Widest 4:3 box that fits inside the image.
  function maxWidth(): number {
    if (!natural) return 1;
    const imageAspect = natural.w / natural.h;
    return imageAspect > CARD_ASPECT ? CARD_ASPECT / imageAspect : 1;
  }

  function withSize(base: PhotoCrop, w: number): PhotoCrop {
    const clampedW = Math.min(maxWidth(), Math.max(maxWidth() * 0.2, w));
    const h = heightFor(clampedW);
    // Zoom around the centre of the current box.
    const cx = base.x + base.w / 2;
    const cy = base.y + base.h / 2;
    return normalizeCrop({ x: cx - clampedW / 2, y: cy - h / 2, w: clampedW, h, ar: CARD_ASPECT });
  }

  function pointerFraction(clientX: number, clientY: number): { fx: number; fy: number } | null {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { fx: (clientX - rect.left) / rect.width, fy: (clientY - rect.top) / rect.height };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!draft) return;
    const point = pointerFraction(e.clientX, e.clientY);
    if (!point) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const target = e.target as HTMLElement;
    if (target.dataset.handle === "resize") {
      drag.current = { mode: "resize", startX: point.fx, startY: point.fy, start: draft };
      return;
    }
    const inside =
      point.fx >= draft.x &&
      point.fx <= draft.x + draft.w &&
      point.fy >= draft.y &&
      point.fy <= draft.y + draft.h;
    let start = draft;
    if (!inside) {
      // Clicking outside the box recentres it there.
      start = normalizeCrop({ ...draft, x: point.fx - draft.w / 2, y: point.fy - draft.h / 2 });
      setDraft(start);
    }
    drag.current = { mode: "move", startX: point.fx, startY: point.fy, start };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const point = pointerFraction(e.clientX, e.clientY);
    if (!point) return;
    const dx = point.fx - d.startX;
    const dy = point.fy - d.startY;
    if (d.mode === "move") {
      setDraft(normalizeCrop({ ...d.start, x: d.start.x + dx, y: d.start.y + dy }));
      return;
    }
    // Resize from the bottom-right corner, keeping the top-left pinned.
    const w = Math.min(maxWidth(), Math.max(maxWidth() * 0.2, d.start.w + dx));
    const h = heightFor(w);
    setDraft(normalizeCrop({ x: d.start.x, y: d.start.y, w, h, ar: CARD_ASPECT }));
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!draft) return;
    const step = 0.02;
    let next: PhotoCrop | null = null;
    if (e.key === "ArrowLeft") next = { ...draft, x: draft.x - step };
    if (e.key === "ArrowRight") next = { ...draft, x: draft.x + step };
    if (e.key === "ArrowUp") next = { ...draft, y: draft.y - step };
    if (e.key === "ArrowDown") next = { ...draft, y: draft.y + step };
    if (e.key === "+" || e.key === "=") next = withSize(draft, draft.w * 0.95);
    if (e.key === "-" || e.key === "_") next = withSize(draft, draft.w / 0.95);
    if (next) {
      e.preventDefault();
      setDraft(normalizeCrop(next));
    }
  }

  // Slider: 100 = whole picture (widest box), lower = zoomed in.
  const zoomPercent = draft ? Math.round((draft.w / maxWidth()) * 100) : 100;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
      <div>
        <div
          ref={containerRef}
          role="application"
          aria-label="Crop and adjust photo. Drag the box to move it, drag its corner to resize, arrow keys to nudge, plus and minus to zoom."
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          style={natural ? { aspectRatio: `${natural.w} / ${natural.h}` } : undefined}
          className="relative w-full touch-none select-none overflow-hidden rounded-lg border border-brand-soft-blue/60 bg-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> at natural aspect so pointer fractions equal image fractions */}
          <img
            src={src}
            alt=""
            className="block h-full w-full"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
          />
          {draft && (
            <div
              aria-hidden="true"
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{
                left: `${draft.x * 100}%`,
                top: `${draft.y * 100}%`,
                width: `${draft.w * 100}%`,
                height: `${draft.h * 100}%`,
              }}
            >
              {/* rule-of-thirds guide */}
              <div className="pointer-events-none absolute inset-y-0 left-1/3 border-l border-white/40" />
              <div className="pointer-events-none absolute inset-y-0 left-2/3 border-l border-white/40" />
              <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-white/40" />
              <div className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-white/40" />
              <div
                data-handle="resize"
                className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-brand-purple shadow"
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-brand-charcoal">
          <label className="flex flex-1 items-center gap-2">
            <span className="shrink-0 text-xs text-brand-charcoal/70">Zoom</span>
            <input
              type="range"
              min={20}
              max={100}
              value={zoomPercent}
              disabled={!draft}
              onChange={(e) => {
                if (!draft) return;
                setDraft(withSize(draft, (Number(e.target.value) / 100) * maxWidth()));
              }}
              aria-label="Zoom"
              className="w-full accent-brand-purple"
            />
          </label>
          <button
            type="button"
            disabled={!natural}
            onClick={() => natural && setDraft(cropFromFocal(natural.w, natural.h, 50, 50))}
            className="rounded-full border border-brand-soft-blue px-3 py-1 text-xs font-semibold text-brand-charcoal hover:bg-brand-gray"
          >
            Reset
          </button>
        </div>
        <p className="mt-2 text-xs text-brand-charcoal/60">
          Drag the box to choose what shows; drag its corner or use Zoom to get closer. Changes save
          automatically. The original photo is kept, so you can adjust again later.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-charcoal/70">Card</p>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-gray">
            <CroppedPhoto
              src={src}
              alt=""
              crop={draft}
              focalX={focalX}
              focalY={focalY}
              frameAspect={CARD_ASPECT}
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-charcoal/70">
            Thumbnail
          </p>
          <div className="relative aspect-square w-24 overflow-hidden rounded-lg bg-brand-gray">
            <CroppedPhoto src={src} alt="" crop={draft} focalX={focalX} focalY={focalY} frameAspect={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
