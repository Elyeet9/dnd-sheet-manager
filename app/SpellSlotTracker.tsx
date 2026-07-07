"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const MAX_SLOTS_CAP = 9;

const diamondTransition = {
  type: "spring" as const,
  stiffness: 700,
  damping: 22,
};

export default function SpellSlotTracker({
  max,
  expended,
  label,
  onChangeMax,
  onChangeExpended,
}: {
  max: number;
  expended: number;
  label: string;
  onChangeMax: (next: number) => void;
  onChangeExpended: (next: number) => void;
}) {
  const clampedMax = Math.max(0, Math.min(MAX_SLOTS_CAP, max));
  const clampedExpended = Math.max(0, Math.min(clampedMax, expended));

  // Skip the entrance pop on first render (no SSR/hydration flash); slots added
  // later still pop in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {clampedMax > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: clampedMax }).map((_, index) => {
            // A lit diamond is an available (unspent) slot; spending darkens it
            // from the right. Long rest sets expended to 0 → every slot lit.
            const available = clampedMax - clampedExpended;
            const filled = index < available;
            return (
              <motion.button
                key={index}
                type="button"
                onClick={() =>
                  onChangeExpended(
                    clampedMax - (index < available ? index : index + 1),
                  )
                }
                initial={mounted ? { scale: 0, opacity: 0 } : false}
                animate={{
                  scale: filled ? 1.12 : 1,
                  opacity: 1,
                }}
                whileTap={{ scale: 0.78 }}
                transition={diamondTransition}
                className={`h-3.5 w-3.5 rotate-45 border transition-colors ${
                  filled
                    ? "border-transparent bg-purple-400 [box-shadow:0_0_6px_color-mix(in_oklab,var(--color-purple-500)_55%,transparent)]"
                    : "border-purple-500/40 bg-transparent"
                }`}
                aria-label={`${label} spell slot ${index + 1}${
                  filled ? " (available)" : " (expended)"
                }`}
                aria-pressed={!filled}
              />
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => onChangeMax(clampedMax - 1)}
          disabled={clampedMax <= 0}
          className="flex h-4 w-4 items-center justify-center rounded border border-purple-900/60 bg-sheet-0 text-[11px] leading-none font-semibold text-red-300 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Remove a ${label} slot`}
          title="Remove a slot"
        >
          −
        </button>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => onChangeMax(clampedMax + 1)}
          disabled={clampedMax >= MAX_SLOTS_CAP}
          className="flex h-4 w-4 items-center justify-center rounded border border-purple-900/60 bg-sheet-0 text-[11px] leading-none font-semibold text-emerald-300 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Add a ${label} slot`}
          title="Add a slot"
        >
          +
        </button>
      </div>
    </div>
  );
}
