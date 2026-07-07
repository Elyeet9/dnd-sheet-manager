"use client";

import { useState } from "react";
import { motion } from "motion/react";

export type CasterType = "full" | "half" | "third";

// 2024 spell-slot tables, transcribed from the official class tables.
// Each row is a character level (index 0 = level 1); each row holds the slots
// for spell levels 1–9.
//
// Full caster   → Sorcerer/Wizard/Cleric/Druid/Bard table.
// Half caster   → Paladin/Ranger table (2024: slots begin at level 1).
// Third caster  → Eldritch Knight/Arcane Trickster table (begins at level 3).

const FULL_CASTER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const HALF_CASTER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
];

const THIRD_CASTER: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
];

const TABLES: Record<CasterType, number[][]> = {
  full: FULL_CASTER,
  half: HALF_CASTER,
  third: THIRD_CASTER,
};

// Returns the 9 max-slot values (spell levels 1–9) for the given caster type
// at the given character level.
export function slotsForCaster(type: CasterType, level: number): number[] {
  const clampedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return TABLES[type][clampedLevel - 1];
}

const casterOptions: { type: CasterType; label: string }[] = [
  { type: "full", label: "Full Caster" },
  { type: "half", label: "Half Caster" },
  { type: "third", label: "Third Caster" },
];

export default function SpellSlotHelper({
  defaultLevel,
  onApply,
}: {
  defaultLevel: number;
  onApply: (type: CasterType, casterLevel: number) => void;
}) {
  // Tracks the character level by default (covers standard single-class
  // characters with no extra clicks), but becomes a manual value once the user
  // edits it — a multiclassed character's caster level differs from their total.
  const seed = String(Math.max(1, Math.min(20, Math.floor(defaultLevel) || 1)));
  const [touched, setTouched] = useState(false);
  const [casterLevel, setCasterLevel] = useState(seed);
  const displayLevel = touched ? casterLevel : seed;

  const parsedLevel = Math.max(
    1,
    Math.min(20, Number.parseInt(displayLevel, 10) || 1),
  );

  const setLevel = (next: string) => {
    setTouched(true);
    setCasterLevel(next);
  };
  const stepLevel = (delta: number) => {
    setTouched(true);
    setCasterLevel(String(Math.max(1, Math.min(20, parsedLevel + delta))));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 rounded-lg border border-dashed border-purple-700/60 bg-sheet-1 px-3 py-3"
    >
      <p className="text-center text-[11px] leading-relaxed text-purple-200/90">
        No spell slots set. Set your caster level (sum of caster levels if
        multiclassing), then fill the 2024 defaults:
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-300/80">
          Caster Level
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => stepLevel(-1)}
            disabled={parsedLevel <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-sm font-semibold text-red-300 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease caster level"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={displayLevel}
            onChange={(event) =>
              setLevel(event.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-12 rounded-md border border-purple-900/60 bg-sheet-0 px-2 py-1 text-center text-sm text-slate-100"
            aria-label="Caster level"
          />
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => stepLevel(1)}
            disabled={parsedLevel >= 20}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-sm font-semibold text-emerald-300 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase caster level"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {casterOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onApply(option.type, parsedLevel)}
            className="rounded-md border border-purple-500/60 bg-sheet-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-purple-100 transition hover:border-purple-300 hover:bg-sheet-3"
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
