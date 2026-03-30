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
  strength: string;
  dexterity: string;
  constitution: string;
  intelligence: string;
  wisdom: string;
  charisma: string;
  skillProficiencies: Record<SkillKey, boolean>;
  skillExpertise: Record<SkillKey, boolean>;
  savingThrowProficiencies: Record<AbilityKey, boolean>;
  initiativeAdjust: number;
  passivePerceptionAdjust: number;
  speed: string;
  size: string;
  heroicInspiration: boolean;
  hpCurrent: string;
  hpTemp: string;
  hpMax: string;
  hitDiceSpent: string;
  hitDiceMax: string;
  deathSuccesses: number;
  deathFailures: number;
};

type SkillKey =
  | "athletics"
  | "acrobatics"
  | "sleightOfHand"
  | "stealth"
  | "arcana"
  | "history"
  | "investigation"
  | "nature"
  | "religion"
  | "animalHandling"
  | "insight"
  | "medicine"
  | "perception"
  | "survival"
  | "deception"
  | "intimidation"
  | "performance"
  | "persuasion";

type AbilityKey =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

const skillKeys: SkillKey[] = [
  "athletics",
  "acrobatics",
  "sleightOfHand",
  "stealth",
  "arcana",
  "history",
  "investigation",
  "nature",
  "religion",
  "animalHandling",
  "insight",
  "medicine",
  "perception",
  "survival",
  "deception",
  "intimidation",
  "performance",
  "persuasion",
];

const defaultSkillFlags = skillKeys.reduce<Record<SkillKey, boolean>>(
  (accumulator, key) => ({ ...accumulator, [key]: false }),
  {} as Record<SkillKey, boolean>,
);

const abilityKeys: AbilityKey[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

const defaultSavingThrowFlags = abilityKeys.reduce<Record<AbilityKey, boolean>>(
  (accumulator, key) => ({ ...accumulator, [key]: false }),
  {} as Record<AbilityKey, boolean>,
);

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
  strength: "",
  dexterity: "",
  constitution: "",
  intelligence: "",
  wisdom: "",
  charisma: "",
  skillProficiencies: defaultSkillFlags,
  skillExpertise: defaultSkillFlags,
  savingThrowProficiencies: defaultSavingThrowFlags,
  initiativeAdjust: 0,
  passivePerceptionAdjust: 0,
  speed: "",
  size: "",
  heroicInspiration: false,
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
          strength: parsed.strength ?? "",
          dexterity: parsed.dexterity ?? "",
          constitution: parsed.constitution ?? "",
          intelligence: parsed.intelligence ?? "",
          wisdom: parsed.wisdom ?? "",
          charisma: parsed.charisma ?? "",
          skillProficiencies: {
            ...defaultSkillFlags,
            ...(parsed.skillProficiencies ?? {}),
          },
          skillExpertise: {
            ...defaultSkillFlags,
            ...(parsed.skillExpertise ?? {}),
          },
          savingThrowProficiencies: {
            ...defaultSavingThrowFlags,
            ...(parsed.savingThrowProficiencies ?? {}),
          },
          initiativeAdjust: parsed.initiativeAdjust ?? 0,
          passivePerceptionAdjust: parsed.passivePerceptionAdjust ?? 0,
          speed: parsed.speed ?? "",
          size: parsed.size ?? "",
          heroicInspiration: parsed.heroicInspiration ?? false,
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

  const handleSkillToggle =
    (field: "skillProficiencies" | "skillExpertise", key: SkillKey) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setSheetData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [key]: checked,
        },
      }));
    };

  const toggleSkillFlag = (
    field: "skillProficiencies" | "skillExpertise",
    key: SkillKey,
  ) => {
    setSheetData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: !prev[field][key],
      },
    }));
  };

  const toggleSavingThrow = (key: AbilityKey) => {
    setSheetData((prev) => ({
      ...prev,
      savingThrowProficiencies: {
        ...prev.savingThrowProficiencies,
        [key]: !prev.savingThrowProficiencies[key],
      },
    }));
  };

  const toNumber = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getAbilityMod = (key: AbilityKey) =>
    Math.floor((toNumber(sheetData[key]) - 10) / 2);

  const formatMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getSkillTotal = (skillKey: SkillKey, abilityKey: AbilityKey) => {
    const isProficient = sheetData.skillProficiencies[skillKey];
    const isExpert = sheetData.skillExpertise[skillKey];
    return (
      getAbilityMod(abilityKey) +
      (isProficient ? proficiencyBonus : 0) +
      (isExpert ? proficiencyBonus : 0)
    );
  };

  const adjustNumeric = (field: "initiativeAdjust" | "passivePerceptionAdjust", delta: number) => {
    setSheetData((prev) => ({
      ...prev,
      [field]: prev[field] + delta,
    }));
  };

  const levelValue = Math.max(1, toNumber(sheetData.level));
  const proficiencyBonus =
    levelValue >= 17
      ? 6
      : levelValue >= 13
        ? 5
        : levelValue >= 9
          ? 4
          : levelValue >= 5
            ? 3
            : 2;

  const abilities: Array<{
    key: AbilityKey;
    label: string;
    skills: { key: SkillKey; label: string }[];
  }> = [
    {
      key: "strength",
      label: "Strength",
      skills: [{ key: "athletics", label: "Athletics" }],
    },
    {
      key: "dexterity",
      label: "Dexterity",
      skills: [
        { key: "acrobatics", label: "Acrobatics" },
        { key: "sleightOfHand", label: "Sleight of Hand" },
        { key: "stealth", label: "Stealth" },
      ],
    },
    {
      key: "constitution",
      label: "Constitution",
      skills: [],
    },
    {
      key: "intelligence",
      label: "Intelligence",
      skills: [
        { key: "arcana", label: "Arcana" },
        { key: "history", label: "History" },
        { key: "investigation", label: "Investigation" },
        { key: "nature", label: "Nature" },
        { key: "religion", label: "Religion" },
      ],
    },
    {
      key: "wisdom",
      label: "Wisdom",
      skills: [
        { key: "animalHandling", label: "Animal Handling" },
        { key: "insight", label: "Insight" },
        { key: "medicine", label: "Medicine" },
        { key: "perception", label: "Perception" },
        { key: "survival", label: "Survival" },
      ],
    },
    {
      key: "charisma",
      label: "Charisma",
      skills: [
        { key: "deception", label: "Deception" },
        { key: "intimidation", label: "Intimidation" },
        { key: "performance", label: "Performance" },
        { key: "persuasion", label: "Persuasion" },
      ],
    },
  ];

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

        <section className="grid items-start gap-3 md:grid-cols-12">
          <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-12 lg:col-span-4">
            <div className="grid items-stretch gap-3 lg:grid-cols-2">
              <div className="grid gap-3">
                <div className="flex h-full flex-col gap-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Proficiency Bonus
                  </div>
                  <div className="flex flex-1 items-center justify-center text-2xl font-semibold text-slate-100">
                    +{proficiencyBonus}
                  </div>
                </div>
                {abilities
                  .filter((ability) =>
                    ["strength", "dexterity", "constitution"].includes(ability.key),
                  )
                  .map((ability) => {
                    const rawValue =
                      (sheetData[ability.key as keyof SheetData] as string) ?? "";
                    const value = toNumber(rawValue);
                    return (
                      <div
                        key={ability.key}
                        className="flex h-full flex-col gap-2 rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                          {ability.label}
                        </div>
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            min={1}
                            value={rawValue}
                            onChange={handleChange(ability.key as keyof SheetData)}
                            className="w-16 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-center text-sm text-slate-100"
                          />
                          <span className="text-lg font-semibold text-slate-100">
                            {formatMod(value)}
                          </span>
                        </div>
                        <div className="mt-2 h-px w-full bg-purple-900/60" />
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1">
                            <span className="text-[11px] font-semibold text-purple-200">
                              Saving Throw
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-100">
                                {(() => {
                                  const isProficient =
                                    sheetData.savingThrowProficiencies[
                                      ability.key
                                    ];
                                  const total =
                                    Math.floor((value - 10) / 2) +
                                    (isProficient ? proficiencyBonus : 0);
                                  return total >= 0 ? `+${total}` : `${total}`;
                                })()}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSavingThrow(ability.key)}
                                className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                  sheetData.savingThrowProficiencies[ability.key]
                                    ? "border-purple-400 bg-purple-400 text-slate-950"
                                    : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                }`}
                                aria-label={`${ability.label} saving throw proficiency`}
                              />
                            </div>
                          </div>
                          {ability.skills.length > 0 && (
                            <div className="h-px w-full bg-purple-900/60" />
                          )}
                          {ability.skills.length > 0 && (
                            <>
                              {ability.skills.map((skill) => {
                                const isProficient =
                                  sheetData.skillProficiencies[skill.key];
                                const isExpert =
                                  sheetData.skillExpertise[skill.key];
                                const skillTotal =
                                  Math.floor((value - 10) / 2) +
                                  (isProficient ? proficiencyBonus : 0) +
                                  (isExpert ? proficiencyBonus : 0);
                                const formatted =
                                  skillTotal >= 0
                                    ? `+${skillTotal}`
                                    : `${skillTotal}`;
                                return (
                                  <div
                                    key={skill.key}
                                    className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1"
                                  >
                                    <span className="text-[11px] font-semibold text-purple-200">
                                      {skill.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-semibold text-slate-100">
                                        {formatted}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSkillFlag(
                                            "skillProficiencies",
                                            skill.key,
                                          )
                                        }
                                        className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                          sheetData.skillProficiencies[skill.key]
                                            ? "border-purple-400 bg-purple-400 text-slate-950"
                                            : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                        }`}
                                        aria-label={`${skill.label} proficiency`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSkillFlag(
                                            "skillExpertise",
                                            skill.key,
                                          )
                                        }
                                        className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                          sheetData.skillExpertise[skill.key]
                                            ? "border-purple-400 bg-purple-400 text-slate-950"
                                            : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                        }`}
                                        aria-label={`${skill.label} expertise`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Heroic Inspiration
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSheetData((prev) => ({
                        ...prev,
                        heroicInspiration: !prev.heroicInspiration,
                      }))
                    }
                    className={`h-10 w-10 rounded-full border text-base font-semibold transition-colors ${
                      sheetData.heroicInspiration
                        ? "border-purple-400 bg-purple-400 text-slate-950"
                        : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                    }`}
                    aria-label="Toggle heroic inspiration"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                {abilities
                  .filter((ability) =>
                    ["intelligence", "wisdom", "charisma"].includes(ability.key),
                  )
                  .map((ability) => {
                    const rawValue =
                      (sheetData[ability.key as keyof SheetData] as string) ?? "";
                    const value = toNumber(rawValue);
                    return (
                      <div
                        key={ability.key}
                        className="flex h-full flex-col gap-2 rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                          {ability.label}
                        </div>
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            min={1}
                            value={rawValue}
                            onChange={handleChange(ability.key as keyof SheetData)}
                            className="w-16 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-center text-sm text-slate-100"
                          />
                          <span className="text-lg font-semibold text-slate-100">
                            {formatMod(value)}
                          </span>
                        </div>
                        <div className="mt-2 h-px w-full bg-purple-900/60" />
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1">
                            <span className="text-[11px] font-semibold text-purple-200">
                              Saving Throw
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-100">
                                {(() => {
                                  const isProficient =
                                    sheetData.savingThrowProficiencies[
                                      ability.key
                                    ];
                                  const total =
                                    Math.floor((value - 10) / 2) +
                                    (isProficient ? proficiencyBonus : 0);
                                  return total >= 0 ? `+${total}` : `${total}`;
                                })()}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSavingThrow(ability.key)}
                                className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                  sheetData.savingThrowProficiencies[ability.key]
                                    ? "border-purple-400 bg-purple-400 text-slate-950"
                                    : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                }`}
                                aria-label={`${ability.label} saving throw proficiency`}
                              />
                            </div>
                          </div>
                          {ability.skills.length > 0 && (
                            <div className="h-px w-full bg-purple-900/60" />
                          )}
                          {ability.skills.length > 0 && (
                            <>
                              {ability.skills.map((skill) => {
                                const isProficient =
                                  sheetData.skillProficiencies[skill.key];
                                const isExpert =
                                  sheetData.skillExpertise[skill.key];
                                const skillTotal =
                                  Math.floor((value - 10) / 2) +
                                  (isProficient ? proficiencyBonus : 0) +
                                  (isExpert ? proficiencyBonus : 0);
                                const formatted =
                                  skillTotal >= 0
                                    ? `+${skillTotal}`
                                    : `${skillTotal}`;
                                return (
                                  <div
                                    key={skill.key}
                                    className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1"
                                  >
                                    <span className="text-[11px] font-semibold text-purple-200">
                                      {skill.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-semibold text-slate-100">
                                        {formatted}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSkillFlag(
                                            "skillProficiencies",
                                            skill.key,
                                          )
                                        }
                                        className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                          sheetData.skillProficiencies[skill.key]
                                            ? "border-purple-400 bg-purple-400 text-slate-950"
                                            : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                        }`}
                                        aria-label={`${skill.label} proficiency`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSkillFlag(
                                            "skillExpertise",
                                            skill.key,
                                          )
                                        }
                                        className={`h-4 w-4 rounded-full border text-[10px] font-semibold transition-colors ${
                                          sheetData.skillExpertise[skill.key]
                                            ? "border-purple-400 bg-purple-400 text-slate-950"
                                            : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                        }`}
                                        aria-label={`${skill.label} expertise`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm md:col-span-12 lg:col-span-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Initiative
                </div>
                <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2">
                  <div className="text-2xl font-semibold text-slate-100">
                    {(() => {
                      const total = getAbilityMod("dexterity") + sheetData.initiativeAdjust;
                      return total >= 0 ? `+${total}` : `${total}`;
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustNumeric("initiativeAdjust", -1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                      aria-label="Decrease initiative"
                    >
                      −
                    </button>
                    <span
                      className={`text-sm font-semibold ${
                        sheetData.initiativeAdjust >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {sheetData.initiativeAdjust >= 0
                        ? `+${sheetData.initiativeAdjust}`
                        : `${sheetData.initiativeAdjust}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustNumeric("initiativeAdjust", 1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                      aria-label="Increase initiative"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Speed
                </div>
                <div className="mt-2 flex flex-1 items-center justify-center">
                  <input
                    value={sheetData.speed}
                    onChange={handleChange("speed")}
                    className="w-24 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-center text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Size
                </div>
                <div className="mt-2 flex flex-1 items-center justify-center">
                  <input
                    value={sheetData.size}
                    onChange={handleChange("size")}
                    className="w-24 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-2 py-2 text-center text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Passive Perception
                </div>
                <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2">
                  <div className="text-2xl font-semibold text-slate-100">
                    {(() => {
                      const total =
                        10 +
                        getSkillTotal("perception", "wisdom") +
                        sheetData.passivePerceptionAdjust;
                      return total >= 0 ? `+${total}` : `${total}`;
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustNumeric("passivePerceptionAdjust", -1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                      aria-label="Decrease passive perception"
                    >
                      −
                    </button>
                    <span
                      className={`text-sm font-semibold ${
                        sheetData.passivePerceptionAdjust >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {sheetData.passivePerceptionAdjust >= 0
                        ? `+${sheetData.passivePerceptionAdjust}`
                        : `${sheetData.passivePerceptionAdjust}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustNumeric("passivePerceptionAdjust", 1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                      aria-label="Increase passive perception"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
