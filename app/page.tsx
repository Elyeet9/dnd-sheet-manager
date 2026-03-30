"use client";

import { useEffect, useState } from "react";

type SheetData = {
  characterName: string;
  background: string;
  className: string;
  species: string;
  subclass: string;
  level: string;
  xp: string;
  armorClass: string;
  shield: string;
  hpCurrent: string;
  hpTemp: string;
  hpMax: string;
  hitDiceSpent: string;
  hitDiceMax: string;
  deathSuccesses: number;
  deathFailures: number;
};

const defaultSheetData: SheetData = {
  characterName: "",
  background: "",
  className: "",
  species: "",
  subclass: "",
  level: "",
  xp: "",
  armorClass: "",
  shield: "",
  hpCurrent: "",
  hpTemp: "",
  hpMax: "",
  hitDiceSpent: "",
  hitDiceMax: "",
  deathSuccesses: 0,
  deathFailures: 0,
};

const storageKey = "dnd-sheet-2024-v1";

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetData>(defaultSheetData);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Partial<SheetData>;
        setSheetData({
          ...defaultSheetData,
          ...parsed,
          characterName: parsed.characterName ?? "",
          background: parsed.background ?? "",
          className: parsed.className ?? "",
          species: parsed.species ?? "",
          subclass: parsed.subclass ?? "",
          level: parsed.level ?? "",
          xp: parsed.xp ?? "",
          armorClass: parsed.armorClass ?? "",
          shield: parsed.shield ?? "",
          hpCurrent: parsed.hpCurrent ?? "",
          hpTemp: parsed.hpTemp ?? "",
          hpMax: parsed.hpMax ?? "",
          hitDiceSpent: parsed.hitDiceSpent ?? "",
          hitDiceMax: parsed.hitDiceMax ?? "",
          deathSuccesses: parsed.deathSuccesses ?? 0,
          deathFailures: parsed.deathFailures ?? 0,
        });
      } catch {
        setSheetData(defaultSheetData);
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(sheetData));
  }, [hasHydrated, sheetData]);

  const handleDownload = () => {
    if (typeof window === "undefined") {
      return;
    }
    const blob = new Blob([JSON.stringify(sheetData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dnd-sheet.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleChange = (field: keyof SheetData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSheetData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const renderPips = (
    label: string,
    value: number,
    onChange: (next: number) => void,
  ) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-purple-200">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((index) => {
          const isActive = index < value;
          return (
            <button
              key={`${label}-${index}`}
              type="button"
              onClick={() => onChange(isActive ? index : index + 1)}
              className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                isActive
                  ? "border-purple-400 bg-purple-400 text-slate-950"
                  : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
              }`}
              aria-label={`${label} ${index + 1}`}
            >
              •
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#140d24] text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50">DnD 2024 Sheet</h1>
            <p className="text-sm text-slate-300">
              Begin with core info and expand as modules are added.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md bg-purple-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-900"
            disabled={!hasHydrated}
          >
            Save JSON
          </button>
        </div>

        <section className="grid items-stretch gap-3 md:grid-cols-12">
          <div className="h-full rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-6 lg:col-span-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <input
                  value={sheetData.characterName}
                  onChange={handleChange("characterName")}
                  className="rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-sm text-slate-100"
                />
                <label className="text-xs font-semibold text-purple-200">
                  Character Name
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <input
                    value={sheetData.background}
                    onChange={handleChange("background")}
                    className="rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-sm text-slate-100"
                  />
                  <label className="text-xs font-semibold text-purple-200">
                    Background
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    value={sheetData.className}
                    onChange={handleChange("className")}
                    className="rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-sm text-slate-100"
                  />
                  <label className="text-xs font-semibold text-purple-200">Class</label>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <input
                    value={sheetData.species}
                    onChange={handleChange("species")}
                    className="rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-sm text-slate-100"
                  />
                  <label className="text-xs font-semibold text-purple-200">Species</label>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    value={sheetData.subclass}
                    onChange={handleChange("subclass")}
                    className="rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-sm text-slate-100"
                  />
                  <label className="text-xs font-semibold text-purple-200">Subclass</label>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="flex h-full flex-col justify-center gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-center text-xs font-semibold text-purple-200">Level</label>
                <input
                  type="number"
                  min={1}
                  value={sheetData.level}
                  onChange={handleChange("level")}
                  className="mx-auto w-full max-w-14 rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-center text-sm text-slate-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-center text-xs font-semibold text-purple-200">XP</label>
                <input
                  type="number"
                  min={0}
                  value={sheetData.xp}
                  onChange={handleChange("xp")}
                  className="mx-auto w-full max-w-14 rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-center text-sm text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="h-full rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="flex h-full flex-col justify-center gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-center text-xs font-semibold text-purple-200">
                  Armor Class
                </label>
                <input
                  type="number"
                  min={0}
                  value={sheetData.armorClass}
                  onChange={handleChange("armorClass")}
                  className="mx-auto w-full max-w-14 rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-center text-sm text-slate-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-center text-xs font-semibold text-purple-200">Shield</label>
                <input
                  type="number"
                  min={0}
                  value={sheetData.shield}
                  onChange={handleChange("shield")}
                  className="mx-auto w-full max-w-14 rounded-none border-b border-purple-500/60 bg-[#140d24] px-2 py-2 text-center text-sm text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="h-full rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-12 lg:col-span-5">
            <div className="grid h-full gap-3 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2 lg:col-span-2">
                <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Hit Points
                </div>
                <div className="grid flex-1 grid-cols-2 items-stretch gap-3">
                  <div className="row-span-2 flex h-full flex-col gap-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hpCurrent}
                      onChange={handleChange("hpCurrent")}
                      className="min-h-28 flex-1 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-center text-sm text-slate-100"
                    />
                    <label className="text-xs font-semibold text-purple-200">
                      Current
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hpTemp}
                      onChange={handleChange("hpTemp")}
                        className="rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-sm text-slate-100"
                    />
                    <label className="text-xs font-semibold text-purple-200">
                      Temp
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hpMax}
                      onChange={handleChange("hpMax")}
                        className="rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-sm text-slate-100"
                    />
                    <label className="text-xs font-semibold text-purple-200">
                      Max
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2 lg:col-span-1">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Hit Dice
                </div>
                <div className="flex flex-1 flex-col justify-center gap-3">
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hitDiceSpent}
                      onChange={handleChange("hitDiceSpent")}
                      className="rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-sm text-slate-100"
                    />
                    <label className="text-xs font-semibold text-purple-200">
                      Spent
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hitDiceMax}
                      onChange={handleChange("hitDiceMax")}
                      className="rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-sm text-slate-100"
                    />
                    <label className="text-xs font-semibold text-purple-200">
                      Max
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2 lg:col-span-1">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Death Saves
                </div>
                <div className="grid flex-1 content-center gap-3">
                  {renderPips("Successes", sheetData.deathSuccesses, (next) =>
                    setSheetData((prev) => ({ ...prev, deathSuccesses: next })),
                  )}
                  {renderPips("Failures", sheetData.deathFailures, (next) =>
                    setSheetData((prev) => ({ ...prev, deathFailures: next })),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
