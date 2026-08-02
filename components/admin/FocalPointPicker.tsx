"use client";

import { useRef, useState } from "react";

// Lets an admin click/drag on a photo to choose which point stays centered
// when the browser crops it to different aspect ratios (a wide event card
// vs. a taller detail-page hero). Stored as a 0-100 percentage pair rather
// than pixel coordinates so it stays correct regardless of the image's
// original resolution or the container it's displayed in.
//
// The preview box is sized to the image's own natural aspect ratio (set
// once it loads) so it renders with no letterboxing -- that keeps a click's
// position-within-the-container mathematically identical to its position
// within the image itself, which is what object-position percentages are
// defined against.
export default function FocalPointPicker({
  src,
  x,
  y,
  onChange,
}: {
  src: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  function updateFromPointer(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextX = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const nextY = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    onChange(Math.round(nextX), Math.round(nextY));
  }

  return (
    <div>
      <div
        ref={containerRef}
        role="slider"
        aria-label="Cover photo focal point"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(x)}
        aria-valuetext={`${Math.round(x)}% across, ${Math.round(y)}% down`}
        tabIndex={0}
        onPointerDown={(e) => {
          setDragging(true);
          updateFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging) updateFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        onKeyDown={(e) => {
          const step = 2;
          if (e.key === "ArrowLeft") onChange(Math.max(0, x - step), y);
          if (e.key === "ArrowRight") onChange(Math.min(100, x + step), y);
          if (e.key === "ArrowUp") onChange(x, Math.max(0, y - step));
          if (e.key === "ArrowDown") onChange(x, Math.min(100, y + step));
        }}
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
        className="relative w-full max-w-md cursor-crosshair select-none overflow-hidden rounded-lg border border-brand-soft-blue/60 bg-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-purple"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- needs plain <img> sized to natural aspect ratio for exact pointer-coordinate math */}
        <img
          src={src}
          alt=""
          className="h-full w-full"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setAspectRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-purple/80 shadow"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-brand-charcoal/60">
        Click or drag on the photo to choose what stays in view when it&rsquo;s cropped.
      </p>
    </div>
  );
}
