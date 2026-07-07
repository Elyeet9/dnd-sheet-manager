"use client";

import { motion } from "motion/react";

export type ResourceMaxMode = "fixed" | "ability" | "proficiency";
export type ResourceRecharge = "short" | "long" | "other";

export type ResourceEntry = {
  id: string;
  name: string;
  maxMode: ResourceMaxMode;
  maxFixed: string;
  maxAbility: string;
  recharge: ResourceRecharge;
  rechargeOther: string;
  used: string;
};

type AbilityOption = { key: string; label: string; mod: number };

const PIP_CAP = 24;

const rechargeLabels: Record<ResourceRecharge, string> = {
  short: "Short Rest",
  long: "Long Rest",
  other: "Other",
};

export function resolveResourceMax(
  entry: ResourceEntry,
  abilities: AbilityOption[],
  proficiencyBonus: number,
): number {
  if (entry.maxMode === "proficiency") {
    return Math.max(0, proficiencyBonus);
  }
  if (entry.maxMode === "ability") {
    const ability = abilities.find((option) => option.key === entry.maxAbility);
    return Math.max(0, ability ? ability.mod : 0);
  }
  return Math.max(0, Number.parseInt(entry.maxFixed, 10) || 0);
}

const fieldClass =
  "rounded-md border border-purple-900/60 bg-sheet-0 px-2 py-1 text-xs text-slate-100";

function ResourceCard({
  entry,
  abilities,
  proficiencyBonus,
  onUpdate,
  onRemove,
}: {
  entry: ResourceEntry;
  abilities: AbilityOption[];
  proficiencyBonus: number;
  onUpdate: (id: string, patch: Partial<ResourceEntry>) => void;
  onRemove: (id: string) => void;
}) {
  const max = resolveResourceMax(entry, abilities, proficiencyBonus);
  const used = Math.max(0, Math.min(max, Number.parseInt(entry.used, 10) || 0));
  const pipCount = Math.min(max, PIP_CAP);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="flex flex-col gap-2 rounded-lg border border-purple-900/60 bg-sheet-1 p-2"
    >
      <div className="flex items-center gap-2">
        <input
          value={entry.name}
          onChange={(event) => onUpdate(entry.id, { name: event.target.value })}
          placeholder="Resource name"
          className={`min-w-0 flex-1 ${fieldClass} text-sm font-semibold placeholder:text-slate-500`}
        />
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-xs font-semibold text-red-300 transition hover:border-red-300"
          aria-label={`Remove ${entry.name || "resource"}`}
        >
          −
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-purple-300/80">
          Max
        </span>
        <select
          value={entry.maxMode}
          onChange={(event) =>
            onUpdate(entry.id, { maxMode: event.target.value as ResourceMaxMode })
          }
          className={fieldClass}
        >
          <option value="fixed">Fixed</option>
          <option value="ability">Ability Mod</option>
          <option value="proficiency">Prof. Bonus</option>
        </select>
        {entry.maxMode === "fixed" && (
          <input
            type="text"
            inputMode="numeric"
            value={entry.maxFixed}
            onChange={(event) =>
              onUpdate(entry.id, {
                maxFixed: event.target.value.replace(/[^0-9]/g, ""),
              })
            }
            className={`w-12 text-center ${fieldClass}`}
            aria-label="Max uses"
          />
        )}
        {entry.maxMode === "ability" && (
          <select
            value={entry.maxAbility}
            onChange={(event) =>
              onUpdate(entry.id, { maxAbility: event.target.value })
            }
            className={fieldClass}
          >
            <option value="">Ability…</option>
            {abilities.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {entry.maxMode !== "fixed" && (
          <span className="text-[11px] font-semibold text-purple-200">
            = {max}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-purple-300/80">
          Recharge
        </span>
        <select
          value={entry.recharge}
          onChange={(event) =>
            onUpdate(entry.id, {
              recharge: event.target.value as ResourceRecharge,
            })
          }
          className={fieldClass}
        >
          {(Object.keys(rechargeLabels) as ResourceRecharge[]).map((key) => (
            <option key={key} value={key}>
              {rechargeLabels[key]}
            </option>
          ))}
        </select>
        {entry.recharge === "other" && (
          <input
            value={entry.rechargeOther}
            onChange={(event) =>
              onUpdate(entry.id, { rechargeOther: event.target.value })
            }
            placeholder="e.g. dawn"
            className={`min-w-0 flex-1 ${fieldClass} placeholder:text-slate-500`}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-purple-900/40 pt-2">
        {max > 0 ? (
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {Array.from({ length: pipCount }).map((_, index) => {
              // Checked = available, blank = used. The first `available` pips
              // are checked; spending unchecks from the right.
              const available = max - used;
              const checked = index < available;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    onUpdate(entry.id, {
                      used: String(
                        max - (index < available ? index : index + 1),
                      ),
                    })
                  }
                  className={`h-3.5 w-3.5 rounded-sm border transition-colors ${
                    checked
                      ? "border-transparent bg-purple-400 [box-shadow:0_0_6px_rgba(168,85,247,0.5)]"
                      : "border-purple-500/40 bg-transparent hover:border-purple-300"
                  }`}
                  aria-label={`Use ${index + 1}${
                    checked ? " (available)" : " (spent)"
                  }`}
                  aria-pressed={!checked}
                />
              );
            })}
            {max > PIP_CAP && (
              <span className="text-[10px] text-purple-300/70">
                {max - used}/{max}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-purple-300/60">Set a max above</span>
        )}
        <button
          type="button"
          onClick={() => onUpdate(entry.id, { used: "0" })}
          disabled={used === 0}
          className="shrink-0 rounded-md border border-purple-900/60 bg-sheet-0 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-purple-200 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
          title="Restore all uses"
        >
          Restore
        </button>
      </div>
    </motion.div>
  );
}

export default function AdditionalResources({
  resources,
  abilities,
  proficiencyBonus,
  onAdd,
  onUpdate,
  onRemove,
}: {
  resources: ResourceEntry[];
  abilities: AbilityOption[];
  proficiencyBonus: number;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ResourceEntry>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-sheet-1 px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
          Additional Resources
        </div>
      </div>

      {resources.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-purple-900/60 bg-sheet-1 px-3 py-4 text-center text-xs text-purple-200/70">
          Track any resource and other limited-use
          features here.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {resources.map((entry) => (
            <ResourceCard
              key={entry.id}
              entry={entry}
              abilities={abilities}
              proficiencyBonus={proficiencyBonus}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-sheet-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:bg-sheet-4"
      >
        <span className="text-sm">+</span>
        Add Resource
      </button>
    </div>
  );
}
