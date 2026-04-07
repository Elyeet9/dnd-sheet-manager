"use client";

import React, { useEffect, useRef, useState } from "react";
import { Cinzel_Decorative } from "next/font/google";
import Swal from "sweetalert2";

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
  weapons: WeaponEntry[];
  hpCurrent: string;
  hpTemp: string;
  hpMax: string;
  hitDiceSpent: string;
  hitDiceMax: string;
  deathSuccesses: number;
  deathFailures: number;
  classFeaturesLeft: string[];
  classFeaturesRight: string[];
  speciesTraits: string[];
  feats: string[];
  armorTrainingLight: boolean;
  armorTrainingMedium: boolean;
  armorTrainingHeavy: boolean;
  armorTrainingShields: boolean;
  weaponProficiencies: string;
  toolProficiencies: string;
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

type WeaponEntry = {
  id: string;
  name: string;
  attackBonus: string;
  damageType: string;
  notes: string;
};

const titleFont = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

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

const defaultWeapons: WeaponEntry[] = Array.from({ length: 6 }, (_, index) => ({
  id: `default-${index + 1}`,
  name: "",
  attackBonus: "",
  damageType: "",
  notes: "",
}));

const defaultSheetData: SheetData = {
  characterName: "",
  background: "",
  className: "",
  species: "",
  subclass: "",
  level: "1",
  xp: "",
  armorClass: "10",
  shield: "0",
  strength: "10",
  dexterity: "10",
  constitution: "10",
  intelligence: "10",
  wisdom: "10",
  charisma: "10",
  skillProficiencies: defaultSkillFlags,
  skillExpertise: defaultSkillFlags,
  savingThrowProficiencies: defaultSavingThrowFlags,
  initiativeAdjust: 0,
  passivePerceptionAdjust: 0,
  speed: "30",
  size: "M",
  heroicInspiration: false,
  weapons: defaultWeapons,
  hpCurrent: "",
  hpTemp: "",
  hpMax: "",
  hitDiceSpent: "",
  hitDiceMax: "",
  deathSuccesses: 0,
  deathFailures: 0,
  classFeaturesLeft: [""],
  classFeaturesRight: [""],
  speciesTraits: [""],
  feats: [""],
  armorTrainingLight: false,
  armorTrainingMedium: false,
  armorTrainingHeavy: false,
  armorTrainingShields: false,
  weaponProficiencies: "",
  toolProficiencies: "",
};

const storageKey = "dnd-sheet-2024-v1";

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetData>(defaultSheetData);
  const [activeTab, setActiveTab] = useState<"info" | "combat" | "features">("info");
  const [hasHydrated, setHasHydrated] = useState(false);
  const loadInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

  const normalizeSheetData = (partial: Partial<SheetData> = {}): SheetData => ({
    ...defaultSheetData,
    ...partial,
    characterName: partial.characterName ?? "",
    background: partial.background ?? "",
    className: partial.className ?? "",
    species: partial.species ?? "",
    subclass: partial.subclass ?? "",
    level: partial.level ?? "1",
    xp: partial.xp ?? "",
    armorClass: partial.armorClass ?? "10",
    shield: partial.shield ?? "0",
    strength: partial.strength ?? "10",
    dexterity: partial.dexterity ?? "10",
    constitution: partial.constitution ?? "10",
    intelligence: partial.intelligence ?? "10",
    wisdom: partial.wisdom ?? "10",
    charisma: partial.charisma ?? "10",
    skillProficiencies: {
      ...defaultSkillFlags,
      ...(partial.skillProficiencies ?? {}),
    },
    skillExpertise: {
      ...defaultSkillFlags,
      ...(partial.skillExpertise ?? {}),
    },
    savingThrowProficiencies: {
      ...defaultSavingThrowFlags,
      ...(partial.savingThrowProficiencies ?? {}),
    },
    initiativeAdjust: partial.initiativeAdjust ?? 0,
    passivePerceptionAdjust: partial.passivePerceptionAdjust ?? 0,
    speed: partial.speed ?? "",
    size: partial.size ?? "",
    heroicInspiration: partial.heroicInspiration ?? false,
    weapons: partial.weapons ?? defaultWeapons,
    hpCurrent: partial.hpCurrent ?? "",
    hpTemp: partial.hpTemp ?? "",
    hpMax: partial.hpMax ?? "",
    hitDiceSpent: partial.hitDiceSpent ?? "",
    hitDiceMax: partial.hitDiceMax ?? "",
    deathSuccesses: partial.deathSuccesses ?? 0,
    deathFailures: partial.deathFailures ?? 0,
    classFeaturesLeft: partial.classFeaturesLeft ?? [""],
    classFeaturesRight: partial.classFeaturesRight ?? [""],
    speciesTraits: partial.speciesTraits ?? [""],
    feats: partial.feats ?? [""],
    armorTrainingLight: partial.armorTrainingLight ?? false,
    armorTrainingMedium: partial.armorTrainingMedium ?? false,
    armorTrainingHeavy: partial.armorTrainingHeavy ?? false,
    armorTrainingShields: partial.armorTrainingShields ?? false,
    weaponProficiencies: partial.weaponProficiencies ?? "",
    toolProficiencies: partial.toolProficiencies ?? "",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Partial<SheetData>;
        setSheetData(normalizeSheetData(parsed));
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

  const validateJsonPayload = (payload: unknown) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return "Invalid JSON format.";
    }
    return null;
  };

  const confirmAndLoad = async (payload: Partial<SheetData>) => {
    const validationError = validateJsonPayload(payload);
    if (validationError) {
      await Swal.fire({
        title: "Invalid JSON",
        text: validationError,
        icon: "error",
        background: "#140d24",
        color: "#e2e8f0",
        confirmButtonColor: "#a855f7",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Load this JSON?",
      text: "This will overwrite the current sheet data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, load",
      cancelButtonText: "Cancel",
      background: "#140d24",
      color: "#e2e8f0",
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
    });

    if (result.isConfirmed) {
      setSheetData(normalizeSheetData(payload));
      setHasHydrated(true);
    }
  };

  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<SheetData>;
      await confirmAndLoad(parsed);
    } catch {
      await Swal.fire({
        title: "Invalid JSON",
        text: "We couldn't read that file. Make sure it's valid JSON.",
        icon: "error",
        background: "#140d24",
        color: "#e2e8f0",
        confirmButtonColor: "#a855f7",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleDropLoad = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<SheetData>;
      await confirmAndLoad(parsed);
    } catch {
      await Swal.fire({
        title: "Invalid JSON",
        text: "We couldn't read that file. Make sure it's valid JSON.",
        icon: "error",
        background: "#140d24",
        color: "#e2e8f0",
        confirmButtonColor: "#a855f7",
      });
    }
  };

  const handleNewCharacter = async () => {
    const result = await Swal.fire({
      title: "Start a new character?",
      text: "This will clear the current sheet data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
      background: "#140d24",
      color: "#e2e8f0",
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
    });

    if (result.isConfirmed) {
      setSheetData(defaultSheetData);
      setHasHydrated(true);
    }
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

  const adjustAbilityScore = (key: AbilityKey, delta: number) => {
    setSheetData((prev) => {
      const current = Number.parseInt(prev[key], 10);
      const safeCurrent = Number.isNaN(current) ? 10 : current;
      const next = Math.max(1, safeCurrent + delta);
      return {
        ...prev,
        [key]: String(next),
      };
    });
  };

  const addWeaponEntry = () => {
    const newEntry: WeaponEntry = {
      id: crypto.randomUUID(),
      name: "",
      attackBonus: "",
      damageType: "",
      notes: "",
    };
    setSheetData((prev) => ({
      ...prev,
      weapons: [...prev.weapons, newEntry],
    }));
  };

  const updateWeaponEntry = (
    id: string,
    field: keyof Omit<WeaponEntry, "id">,
    value: string,
  ) => {
    setSheetData((prev) => ({
      ...prev,
      weapons: prev.weapons.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const removeWeaponEntry = (id: string) => {
    setSheetData((prev) => ({
      ...prev,
      weapons: prev.weapons.filter((entry) => entry.id !== id),
    }));
  };

  const addModularItem = (
    side:
      | "classFeaturesLeft"
      | "classFeaturesRight"
      | "speciesTraits"
      | "feats",
  ) => {
    setSheetData((prev) => ({
      ...prev,
      [side]: [...prev[side], ""],
    }));
  };

  const updateModularItem = (
    side:
      | "classFeaturesLeft"
      | "classFeaturesRight"
      | "speciesTraits"
      | "feats",
    index: number,
    value: string,
  ) => {
    setSheetData((prev) => ({
      ...prev,
      [side]: prev[side].map((entry: string, idx: number) =>
        idx === index ? value : entry,
      ),
    }));
  };

  const removeModularItem = (
    side:
      | "classFeaturesLeft"
      | "classFeaturesRight"
      | "speciesTraits"
      | "feats",
    index: number,
  ) => {
    setSheetData((prev) => ({
      ...prev,
      [side]: prev[side].filter((_: string, idx: number) => idx !== index),
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
    <div
      className="flex min-h-screen flex-col bg-[#140d24] text-slate-100"
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current += 1;
        setIsDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
          setIsDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        handleDropLoad(file);
      }}
    >
      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#140d24]/80">
          <div className="rounded-xl border border-purple-400/80 bg-[#1f1635] px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
            Drop JSON to load
          </div>
        </div>
      )}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl font-semibold text-slate-50 ${titleFont.className}`}
            >
              DnD 2024 Sheet
            </h1>
            <p className="text-sm text-slate-300">
              Begin with core info and expand as modules are added.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
            <input
              ref={loadInputRef}
              type="file"
              accept="application/json"
              onChange={handleLoad}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleNewCharacter}
              className="rounded-md border border-purple-900/60 bg-[#0f0a1c] px-4 py-2 text-sm font-semibold text-purple-200 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasHydrated}
            >
              New Character
            </button>
            <button
              type="button"
              onClick={() => loadInputRef.current?.click()}
              className="rounded-md border border-purple-500/60 bg-transparent px-4 py-2 text-sm font-semibold text-purple-200 transition hover:border-purple-400"
            >
              Load JSON
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md bg-purple-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-900"
              disabled={!hasHydrated}
            >
              Save JSON
            </button>
            </div>
            <p className="text-xs text-purple-200/70">
              Data is saved in your browser cache. Still save JSON to prevent data loss.
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:items-center lg:gap-3">
          <div className={`flex flex-col gap-3 md:flex-row md:items-stretch lg:contents ${activeTab === "combat" || activeTab === "features" ? "hidden lg:contents" : "flex"}`}>
            {/* Character Header: Main Info Box */}
            <div className="h-full flex-1 rounded-xl border border-purple-900/60 bg-[#1f1635] p-3 shadow-sm md:flex-2 lg:col-span-4 lg:h-40">
              <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <input
                  value={sheetData.characterName}
                  onChange={handleChange("characterName")}
                  className="w-full rounded-none border-b border-purple-500/60 bg-transparent px-2 py-0.5 text-base font-semibold text-slate-100 outline-none"
                />
                <label className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-300/80">
                  Character Name
                </label>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex flex-col">
                  <input
                    value={sheetData.background}
                    onChange={handleChange("background")}
                    className="w-full rounded-none border-b border-purple-500/60 bg-transparent px-2 py-0 text-sm text-slate-100 outline-none"
                  />
                  <label className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-300/80">
                    Background
                  </label>
                </div>
                <div className="flex flex-col">
                  <input
                    value={sheetData.className}
                    onChange={handleChange("className")}
                    className="w-full rounded-none border-b border-purple-500/60 bg-transparent px-2 py-0 text-sm text-slate-100 outline-none"
                  />
                  <label className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-300/80">
                    Class & Level
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex flex-col">
                  <input
                    value={sheetData.species}
                    onChange={handleChange("species")}
                    className="w-full rounded-none border-b border-purple-500/60 bg-transparent px-2 py-0 text-sm text-slate-100 outline-none"
                  />
                  <label className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-300/80">
                    Species
                  </label>
                </div>
                <div className="flex flex-col">
                  <input
                    value={sheetData.subclass}
                    onChange={handleChange("subclass")}
                    className="w-full rounded-none border-b border-purple-500/60 bg-transparent px-2 py-0 text-sm text-slate-100 outline-none"
                  />
                  <label className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-purple-300/80">
                    Subclass
                  </label>
                </div>
              </div>
              </div>
            </div>

            <div className="flex flex-1 flex-row items-center justify-center gap-3 md:col-span-12 lg:contents lg:flex-row lg:gap-3 xl:col-span-4">
              {/* Character Header: Level & XP (Circle/Oval shape) */}
              <div className="flex lg:col-span-1">
                <div className="relative flex h-40 w-28 flex-col items-center justify-center overflow-hidden rounded-[50%_50%_50%_50%/30%_30%_70%_70%] border-2 border-purple-500/60 bg-[#1f1635] shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, toNumber(sheetData.level) + 1);
                      setSheetData(prev => ({ ...prev, level: String(next) }));
                    }}
                    className="absolute top-1 left-1/2 z-10 -translate-x-1/2 text-purple-400 opacity-40 transition-all hover:scale-125 hover:opacity-100 active:scale-95"
                    aria-label="Level up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <div className="flex flex-1 flex-col items-center justify-center pt-2">
                    <input
                      type="number"
                      min={1}
                      value={sheetData.level}
                      onChange={handleChange("level")}
                      className="w-12 bg-transparent text-center text-2xl font-bold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
                      Level
                    </label>
                  </div>
                  <div className="h-px w-full bg-purple-500/40" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, toNumber(sheetData.level) - 1);
                      setSheetData(prev => ({ ...prev, level: String(next) }));
                    }}
                    className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 text-purple-400 opacity-40 transition-all hover:scale-125 hover:opacity-100 active:scale-95"
                    aria-label="Level down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div className="flex flex-1 flex-col items-center justify-center pb-2">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.xp}
                      onChange={handleChange("xp")}
                      className="w-16 bg-transparent text-center text-sm font-semibold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
                      XP
                    </label>
                  </div>
                </div>
              </div>

              {/* Character Header: AC & Shield (Shield shape) */}
              <div className="flex lg:col-span-1">
                <div className="relative flex h-40 w-28 flex-col items-center justify-center overflow-hidden border-x-2 border-b-2 border-purple-500/60 bg-[#1f1635] shadow-lg [clip-path:polygon(0%_0%,100%_0%,100%_70%,50%_100%,0%_70%)]">
                  <div className="bg-purple-900/30 w-full py-1 text-center">
                    <label className="text-[9px] font-bold uppercase tracking-tighter text-purple-300">
                      Armor Class
                    </label>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.armorClass}
                      onChange={handleChange("armorClass")}
                      className="w-12 bg-transparent text-center text-3xl font-bold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="h-px w-3/4 bg-purple-500/40" />
                  <div className="flex flex-col items-center pb-4 pt-1">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.shield}
                      onChange={handleChange("shield")}
                      className="w-10 bg-transparent text-center text-lg font-bold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
                      Shield
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Character Header: HP, Hit Dice, Death Saves (Combined Box) */}
          <div className={`h-40 rounded-xl border border-purple-900/60 bg-[#1f1635] p-1.5 shadow-sm md:col-span-12 lg:col-span-6 ${activeTab === "info" || activeTab === "features" ? "hidden lg:block" : "block"}`}>
            <div className="grid h-full grid-cols-12 gap-1 px-0.5 pb-0.5">
              {/* Hit Points Sub-box */}
              <div className="col-span-6 flex h-full flex-col overflow-hidden rounded-lg border border-purple-900/60 bg-[#140d24]">
                <div className="bg-purple-900/20 py-1 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-purple-200">
                  Hit Points
                </div>
                <div className="flex flex-1 items-stretch divide-x divide-purple-900/40">
                  <div className="flex flex-[1.5] flex-col items-center justify-center p-2 pt-8 pb-8 relative">
                    <div className="absolute top-2 flex gap-1.5 md:hidden">
                      {[1, 5].map((val) => (
                        <button
                          key={`hp-plus-mobile-${val}`}
                          type="button"
                          onClick={() => setSheetData(prev => ({ ...prev, hpCurrent: String(toNumber(prev.hpCurrent) + val) }))}
                          className="flex h-6 w-8 items-center justify-center rounded-md border border-purple-500/30 bg-purple-900/40 text-[10px] font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-800/60 active:scale-95 shadow-sm"
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                    <div className="absolute top-2 hidden gap-1.5 md:flex">
                      {[1, 5, 10].map((val) => (
                        <button
                          key={`hp-plus-${val}`}
                          type="button"
                          onClick={() => setSheetData(prev => ({ ...prev, hpCurrent: String(toNumber(prev.hpCurrent) + val) }))}
                          className="flex h-6 w-8 items-center justify-center rounded-md border border-purple-500/30 bg-purple-900/40 text-[10px] font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-800/60 active:scale-95 shadow-sm"
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hpCurrent}
                      onChange={handleChange("hpCurrent")}
                      className="w-full bg-transparent text-center text-4xl font-bold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="mt-1 text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
                      Current
                    </label>
                    <div className="absolute bottom-2 flex gap-1.5 md:hidden">
                      {[1, 5].map((val) => (
                        <button
                          key={`hp-minus-mobile-${val}`}
                          type="button"
                          onClick={() => setSheetData(prev => ({ ...prev, hpCurrent: String(Math.max(0, toNumber(prev.hpCurrent) - val)) }))}
                          className="flex h-6 w-8 items-center justify-center rounded-md border border-purple-500/30 bg-purple-900/40 text-[10px] font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-800/60 active:scale-95 shadow-sm"
                        >
                          -{val}
                        </button>
                      ))}
                    </div>
                    <div className="absolute bottom-2 hidden gap-1.5 md:flex">
                      {[1, 5, 10].map((val) => (
                        <button
                          key={`hp-minus-${val}`}
                          type="button"
                          onClick={() => setSheetData(prev => ({ ...prev, hpCurrent: String(Math.max(0, toNumber(prev.hpCurrent) - val)) }))}
                          className="flex h-6 w-8 items-center justify-center rounded-md border border-purple-500/30 bg-purple-900/40 text-[10px] font-bold text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-800/60 active:scale-95 shadow-sm"
                        >
                          -{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col divide-y divide-purple-900/40">
                    <div className="flex flex-1 flex-col items-center justify-center p-1">
                      <input
                        type="number"
                        min={0}
                        value={sheetData.hpTemp}
                        onChange={handleChange("hpTemp")}
                        className="w-full bg-transparent text-center text-lg font-semibold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <label className="text-[8px] font-bold uppercase text-purple-300/80">
                        Temp
                      </label>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center p-1">
                      <input
                        type="number"
                        min={0}
                        value={sheetData.hpMax}
                        onChange={handleChange("hpMax")}
                        className="w-full bg-transparent text-center text-lg font-semibold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <label className="text-[8px] font-bold uppercase text-purple-300/80">
                        Max
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hit Dice Sub-box */}
              <div className="col-span-3 flex h-full flex-col overflow-hidden rounded-lg border border-purple-900/60 bg-[#140d24]">
                <div className="bg-purple-900/20 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-purple-200">
                  Hit Dice
                </div>
                <div className="flex flex-1 flex-col divide-y divide-purple-900/40 p-1">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hitDiceSpent}
                      onChange={handleChange("hitDiceSpent")}
                      className="w-full bg-transparent text-center text-lg font-semibold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="text-[8px] font-bold uppercase text-purple-300/80">
                      Spent
                    </label>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <input
                      type="number"
                      min={0}
                      value={sheetData.hitDiceMax}
                      onChange={handleChange("hitDiceMax")}
                      className="w-full bg-transparent text-center text-lg font-semibold text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <label className="text-[8px] font-bold uppercase text-purple-300/80">
                      Total
                    </label>
                  </div>
                </div>
              </div>

              {/* Death Saves Sub-box */}
              <div className="col-span-3 flex h-full flex-col overflow-hidden rounded-lg border border-purple-900/60 bg-[#140d24]">
                <div className="bg-purple-900/20 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-purple-200">
                  Death Saves
                </div>
                <div className="flex flex-1 flex-col items-center justify-around py-1">
                  <div className="flex flex-col items-center scale-[0.9]">
                    <span className="mb-1 text-[8px] font-bold text-purple-300/80 uppercase">Successes</span>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={`success-${i}`}
                          className={`h-4 w-4 rotate-45 border-2 border-purple-500/40 transition-all ${
                            i < sheetData.deathSuccesses ? "bg-purple-400 border-none [box-shadow:0_0_8px_rgba(168,85,247,0.5)]" : "bg-transparent"
                          }`}
                          onClick={() => setSheetData(prev => ({ ...prev, deathSuccesses: i < prev.deathSuccesses ? i : i + 1 }))}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center scale-[0.9]">
                    <span className="mb-1 text-[8px] font-bold text-purple-300/80 uppercase">Failures</span>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={`failure-${i}`}
                          className={`h-4 w-4 rotate-45 border-2 border-purple-500/40 transition-all ${
                            i < sheetData.deathFailures ? "bg-purple-400 border-none [box-shadow:0_0_8px_rgba(168,85,247,0.5)]" : "bg-transparent"
                          }`}
                          onClick={() => setSheetData(prev => ({ ...prev, deathFailures: i < prev.deathFailures ? i : i + 1 }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`lg:hidden ${activeTab === "combat" ? "block" : "hidden"}`}>
          <div className="mt-1 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Weapons & Damage Cantrips
              </div>
            </div>

            <div className="mt-3 grid gap-2 overflow-x-auto">
              <div className="min-w-140 overflow-hidden rounded-lg border border-purple-900/60 divide-y divide-purple-900/60">
                <div className="grid min-w-0 grid-cols-[2.1fr_1.6fr_2fr_2.1fr_28px] gap-0 divide-x divide-purple-900/60 bg-[#0f0a1c] text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-200">
                  <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    Name
                  </div>
                  <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    Atk Bonus / DC
                  </div>
                  <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    Damage & Type
                  </div>
                  <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    Notes
                  </div>
                  <div />
                </div>

                {sheetData.weapons.length === 0 && (
                  <div className="rounded-lg border border-dashed border-purple-900/60 bg-[#140d24] px-3 py-6 text-center text-xs text-purple-200">
                    Add entries to track weapons and cantrips.
                  </div>
                )}

                {sheetData.weapons.map((entry) => (
                  <div
                    key={`mobile-${entry.id}`}
                    className="grid min-w-0 grid-cols-[2.1fr_1.6fr_2fr_2.1fr_28px] gap-0 divide-x divide-purple-900/60 bg-[#0f0a1c]"
                  >
                    <textarea
                      rows={1}
                      value={entry.name}
                      onChange={(event) =>
                        updateWeaponEntry(entry.id, "name", event.target.value)
                      }
                      ref={(element) => {
                        if (!element) return;
                        element.style.height = "auto";
                        element.style.height = `${element.scrollHeight}px`;
                      }}
                      onInput={(event) => {
                        const target = event.currentTarget;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                    />
                    <textarea
                      rows={1}
                      value={entry.attackBonus}
                      onChange={(event) =>
                        updateWeaponEntry(
                          entry.id,
                          "attackBonus",
                          event.target.value,
                        )
                      }
                      ref={(element) => {
                        if (!element) return;
                        element.style.height = "auto";
                        element.style.height = `${element.scrollHeight}px`;
                      }}
                      onInput={(event) => {
                        const target = event.currentTarget;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                    />
                    <textarea
                      rows={1}
                      value={entry.damageType}
                      onChange={(event) =>
                        updateWeaponEntry(
                          entry.id,
                          "damageType",
                          event.target.value,
                        )
                      }
                      ref={(element) => {
                        if (!element) return;
                        element.style.height = "auto";
                        element.style.height = `${element.scrollHeight}px`;
                      }}
                      onInput={(event) => {
                        const target = event.currentTarget;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                    />
                    <textarea
                      rows={1}
                      value={entry.notes}
                      onChange={(event) =>
                        updateWeaponEntry(entry.id, "notes", event.target.value)
                      }
                      ref={(element) => {
                        if (!element) return;
                        element.style.height = "auto";
                        element.style.height = `${element.scrollHeight}px`;
                      }}
                      onInput={(event) => {
                        const target = event.currentTarget;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                    />
                    <div className="flex items-center justify-center bg-transparent">
                      <button
                        type="button"
                        onClick={() => removeWeaponEntry(entry.id)}
                        className="flex h-9 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                        aria-label="Remove weapon"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addWeaponEntry}
                  className="flex w-full items-center justify-center gap-2 bg-[#140d24] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:bg-[#1a1130]"
                  aria-label="Add weapon"
                >
                  <span className="text-sm">+</span>
                  Add Weapon
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={`lg:hidden ${activeTab === "features" ? "block" : "hidden"}`}>
          <div className="mt-1 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Class Features
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {["classFeaturesLeft", "classFeaturesRight"].map((side) => {
                const entries = sheetData[
                  side as "classFeaturesLeft" | "classFeaturesRight"
                ] as string[];
                return (
                  <div
                    key={`mobile-${side}`}
                    className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                  >
                    <div className="space-y-2">
                      {entries.map((value: string, index: number) => (
                        <div
                          key={`mobile-${side}-${index}`}
                          className="flex items-start gap-2"
                        >
                          <textarea
                            rows={1}
                            value={value}
                            onChange={(event) =>
                              updateModularItem(
                                side as
                                  | "classFeaturesLeft"
                                  | "classFeaturesRight",
                                index,
                                event.target.value,
                              )
                            }
                            ref={(element) => {
                              if (!element) return;
                              element.style.height = "auto";
                              element.style.height = `${element.scrollHeight}px`;
                            }}
                            onInput={(event) => {
                              const target = event.currentTarget;
                              target.style.height = "auto";
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                            className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeModularItem(
                                side as
                                  | "classFeaturesLeft"
                                  | "classFeaturesRight",
                                index,
                              )
                            }
                            className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                            aria-label="Remove class feature"
                          >
                            −
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          addModularItem(
                            side as
                              | "classFeaturesLeft"
                              | "classFeaturesRight",
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                      >
                        <span className="text-sm">+</span>
                        Add Feature
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
              <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Species Traits
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="space-y-2">
                  {sheetData.speciesTraits.map((value: string, index: number) => (
                    <div
                      key={`mobile-speciesTraits-${index}`}
                      className="flex items-start gap-2"
                    >
                      <textarea
                        rows={1}
                        value={value}
                        onChange={(event) =>
                          updateModularItem(
                            "speciesTraits",
                            index,
                            event.target.value,
                          )
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeModularItem("speciesTraits", index)}
                        className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                        aria-label="Remove species trait"
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addModularItem("speciesTraits")}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                  >
                    <span className="text-sm">+</span>
                    Add Trait
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
              <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Feats
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="space-y-2">
                  {sheetData.feats.map((value: string, index: number) => (
                    <div key={`mobile-feats-${index}`} className="flex items-start gap-2">
                      <textarea
                        rows={1}
                        value={value}
                        onChange={(event) =>
                          updateModularItem("feats", index, event.target.value)
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeModularItem("feats", index)}
                        className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                        aria-label="Remove feat"
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addModularItem("feats")}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                  >
                    <span className="text-sm">+</span>
                    Add Feat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-3 md:grid-cols-12 lg:grid-cols-12">
          <aside className={`flex flex-col gap-3 md:col-span-12 lg:col-span-4 ${activeTab === "info" ? "flex" : "hidden lg:flex"}`}>
            <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
                            <div className="flex flex-col gap-3">
                              <div className="flex h-full flex-col gap-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
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
                                      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                                        {ability.label}
                                      </div>
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => adjustAbilityScore(ability.key, -1)}
                                            className="h-7 w-7 rounded-md border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-slate-200 transition hover:border-purple-400"
                                            aria-label={`Decrease ${ability.label}`}
                                          >
                                            -
                                          </button>
                                          <input
                                            type="number"
                                            min={1}
                                            value={rawValue}
                                            onChange={handleChange(ability.key as keyof SheetData)}
                                            className="w-10 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-1 py-1 text-center text-sm text-slate-100 placeholder:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => adjustAbilityScore(ability.key, 1)}
                                            className="h-7 w-7 rounded-md border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-slate-200 transition hover:border-purple-400"
                                            aria-label={`Increase ${ability.label}`}
                                          >
                                            +
                                          </button>
                                        </div>
                                        <span className="text-lg font-bold text-slate-100">
                                          {formatMod(value)}
                                        </span>
                                      </div>
                                      <div className="mt-1 h-px w-full bg-purple-900/60" />
                                      <div className="grid gap-1">
                                        <div className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-0.5">
                                          <span className="text-[10px] font-semibold text-purple-200">
                                            Saving Throw
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-semibold text-slate-100">
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
                                              className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                                        {ability.skills.map((skill, index) => {
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
                                              className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-0.5"
                                            >
                                                <span className="text-[10px] font-semibold text-purple-200">
                                                  {skill.label}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[10px] font-semibold text-slate-100">
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
                                                    className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                                                    className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                                      </div>
                                    </div>
                                  );
                                })}
                              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
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
                                  className={`h-8 w-8 rounded-full border text-base font-semibold transition-colors ${
                                    sheetData.heroicInspiration
                                      ? "border-purple-400 bg-purple-400 text-slate-950"
                                      : "border-purple-900/60 bg-[#0f0a1c] text-slate-300 hover:border-purple-400"
                                  }`}
                                  aria-label="Toggle heroic inspiration"
                                />
                              </div>
                            </div>

                <div className="flex flex-col gap-3">
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
                          <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                            {ability.label}
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => adjustAbilityScore(ability.key, -1)}
                                className="h-7 w-7 rounded-md border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-slate-200 transition hover:border-purple-400"
                                aria-label={`Decrease ${ability.label}`}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={rawValue}
                                onChange={handleChange(ability.key as keyof SheetData)}
                                className="w-10 rounded-none border-b border-purple-500/60 bg-[#0f0a1c] px-1 py-1 text-center text-sm text-slate-100 placeholder:text-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => adjustAbilityScore(ability.key, 1)}
                                className="h-7 w-7 rounded-md border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-slate-200 transition hover:border-purple-400"
                                aria-label={`Increase ${ability.label}`}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-lg font-bold text-slate-100">
                              {formatMod(value)}
                            </span>
                          </div>
                          <div className="mt-1 h-px w-full bg-purple-900/60" />
                          <div className="grid gap-1">
                            <div className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-0.5">
                              <span className="text-[10px] font-semibold text-purple-200">
                                Saving Throw
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-slate-100">
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
                                  className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                            {ability.skills.map((skill, index) => {
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
                                  className="flex items-center justify-between rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-0.5"
                                >
                                  <span className="text-[10px] font-semibold text-purple-200">
                                    {skill.label}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-slate-100">
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
                                        className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                                        className={`h-3.5 w-3.5 rounded-full border text-[9px] font-semibold transition-colors ${
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
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className={`rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm ${activeTab === "combat" || activeTab === "features" ? "hidden lg:block" : "block"}`}>
              <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Equipment Training & Proficiencies
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Armor Training
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-purple-200">
                  {[
                    { key: "armorTrainingLight", label: "Light" },
                    { key: "armorTrainingMedium", label: "Medium" },
                    { key: "armorTrainingHeavy", label: "Heavy" },
                    { key: "armorTrainingShields", label: "Shields" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setSheetData((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof SheetData],
                        }))
                      }
                      className="flex items-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1 text-left"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border text-[9px] font-semibold transition-colors ${
                          sheetData[item.key as keyof SheetData]
                            ? "border-purple-400 bg-purple-400 text-slate-950"
                            : "border-purple-900/60 bg-[#0f0a1c] text-slate-300"
                        }`}
                      />
                      <span className="font-semibold text-purple-200">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Weapons
                    </div>
                    <textarea
                      rows={2}
                      value={sheetData.weaponProficiencies}
                      onChange={(event) =>
                        setSheetData((prev) => ({
                          ...prev,
                          weaponProficiencies: event.target.value,
                        }))
                      }
                      className="mt-2 w-full resize-none rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Tools
                    </div>
                    <textarea
                      rows={2}
                      value={sheetData.toolProficiencies}
                      onChange={(event) =>
                        setSheetData((prev) => ({
                          ...prev,
                          toolProficiencies: event.target.value,
                        }))
                      }
                      className="mt-2 w-full resize-none rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-3 md:col-span-12 lg:col-span-8">
            <div className={`rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm ${activeTab === "combat" || activeTab === "features" ? "hidden lg:block" : "block"}`}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex h-full flex-col rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
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
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
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
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
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
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Passive Perception
                </div>
                <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2">
                  <div className="text-2xl font-semibold text-slate-100">
                    {(() => {
                      const total =
                        10 +
                        getSkillTotal("perception", "wisdom") +
                        sheetData.passivePerceptionAdjust;
                      return total >= 0 ? `${total}` : `${total}`;
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

            <div className={`mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 ${activeTab === "info" || activeTab === "features" ? "hidden lg:block" : "block"}`}>
              <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Weapons & Damage Cantrips
                </div>
              </div>

              <div className="mt-3 grid gap-2 overflow-x-auto">
                <div className="min-w-140 overflow-hidden rounded-lg border border-purple-900/60 divide-y divide-purple-900/60">
                  <div className="grid min-w-0 grid-cols-[2.1fr_1.6fr_2fr_2.1fr_28px] gap-0 divide-x divide-purple-900/60 bg-[#0f0a1c] text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-200">
                    <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      Name
                    </div>
                    <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      Atk Bonus / DC
                    </div>
                    <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      Damage & Type
                    </div>
                    <div className="flex min-w-0 items-center px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      Notes
                    </div>
                    <div />
                  </div>

                  {sheetData.weapons.length === 0 && (
                    <div className="rounded-lg border border-dashed border-purple-900/60 bg-[#140d24] px-3 py-6 text-center text-xs text-purple-200">
                      Add entries to track weapons and cantrips.
                    </div>
                  )}

                  {sheetData.weapons.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid min-w-0 grid-cols-[2.1fr_1.6fr_2fr_2.1fr_28px] gap-0 divide-x divide-purple-900/60 bg-[#0f0a1c]"
                    >
                      <textarea
                        rows={1}
                        value={entry.name}
                        onChange={(event) =>
                          updateWeaponEntry(entry.id, "name", event.target.value)
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                      />
                      <textarea
                        rows={1}
                        value={entry.attackBonus}
                        onChange={(event) =>
                          updateWeaponEntry(
                            entry.id,
                            "attackBonus",
                            event.target.value,
                          )
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                      />
                      <textarea
                        rows={1}
                        value={entry.damageType}
                        onChange={(event) =>
                          updateWeaponEntry(
                            entry.id,
                            "damageType",
                            event.target.value,
                          )
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                      />
                      <textarea
                        rows={1}
                        value={entry.notes}
                        onChange={(event) =>
                          updateWeaponEntry(entry.id, "notes", event.target.value)
                        }
                        ref={(element) => {
                          if (!element) return;
                          element.style.height = "auto";
                          element.style.height = `${element.scrollHeight}px`;
                        }}
                        onInput={(event) => {
                          const target = event.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="min-w-0 w-full resize-none overflow-hidden rounded-none bg-transparent px-2 py-1 text-sm leading-5 text-slate-100"
                      />
                      <div className="flex items-center justify-center bg-transparent">
                        <button
                          type="button"
                          onClick={() => removeWeaponEntry(entry.id)}
                          className="flex h-9 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                          aria-label="Remove weapon"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addWeaponEntry}
                    className="flex w-full items-center justify-center gap-2 bg-[#140d24] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:bg-[#1a1130]"
                    aria-label="Add weapon"
                  >
                    <span className="text-sm">+</span>
                    Add Weapon
                  </button>
                </div>
              </div>
            </div>

            <div className={`mt-4 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 ${activeTab === "info" || activeTab === "combat" ? "hidden lg:block" : "block"}`}>
              <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Class Features
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {["classFeaturesLeft", "classFeaturesRight"].map((side) => {
                  const entries = sheetData[
                    side as "classFeaturesLeft" | "classFeaturesRight"
                  ] as string[];
                  return (
                  <div
                    key={side}
                    className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                  >
                    <div className="space-y-2">
                      {entries.map((value: string, index: number) => (
                        <div
                          key={`${side}-${index}`}
                          className="flex items-start gap-2"
                        >
                          <textarea
                            rows={1}
                            value={value}
                            onChange={(event) =>
                              updateModularItem(
                                side as
                                  | "classFeaturesLeft"
                                  | "classFeaturesRight",
                                index,
                                event.target.value,
                              )
                            }
                            ref={(element) => {
                              if (!element) return;
                              element.style.height = "auto";
                              element.style.height = `${element.scrollHeight}px`;
                            }}
                            onInput={(event) => {
                              const target = event.currentTarget;
                              target.style.height = "auto";
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                            className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeModularItem(
                                side as
                                  | "classFeaturesLeft"
                                  | "classFeaturesRight",
                                index,
                              )
                            }
                            className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                            aria-label="Remove class feature"
                          >
                            −
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          addModularItem(
                            side as
                              | "classFeaturesLeft"
                              | "classFeaturesRight",
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                      >
                        <span className="text-sm">+</span>
                        Add Feature
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>

            <div className={`mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 ${activeTab === "info" || activeTab === "combat" ? "hidden lg:grid" : "grid"}`}>
              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Species Traits
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                  <div className="space-y-2">
                    {sheetData.speciesTraits.map((value: string, index: number) => (
                      <div
                        key={`speciesTraits-${index}`}
                        className="flex items-start gap-2"
                      >
                        <textarea
                          rows={1}
                          value={value}
                          onChange={(event) =>
                            updateModularItem(
                              "speciesTraits",
                              index,
                              event.target.value,
                            )
                          }
                          ref={(element) => {
                            if (!element) return;
                            element.style.height = "auto";
                            element.style.height = `${element.scrollHeight}px`;
                          }}
                          onInput={(event) => {
                            const target = event.currentTarget;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                          className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeModularItem("speciesTraits", index)}
                          className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                          aria-label="Remove species trait"
                        >
                          −
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addModularItem("speciesTraits")}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                    >
                      <span className="text-sm">+</span>
                      Add Trait
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Feats
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                  <div className="space-y-2">
                    {sheetData.feats.map((value: string, index: number) => (
                      <div key={`feats-${index}`} className="flex items-start gap-2">
                        <textarea
                          rows={1}
                          value={value}
                          onChange={(event) =>
                            updateModularItem(
                              "feats",
                              index,
                              event.target.value,
                            )
                          }
                          ref={(element) => {
                            if (!element) return;
                            element.style.height = "auto";
                            element.style.height = `${element.scrollHeight}px`;
                          }}
                          onInput={(event) => {
                            const target = event.currentTarget;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                          className="w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm leading-5 text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeModularItem("feats", index)}
                          className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                          aria-label="Remove feat"
                        >
                          −
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addModularItem("feats")}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
                    >
                      <span className="text-sm">+</span>
                      Add Feat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
      <footer className="mx-auto w-full max-w-6xl px-4 pb-6 text-center text-xs text-purple-200/70">
        Created by Elyeet · Inspired by the D&D 2024 Character Sheet ·{" "}
        <a
          href="https://github.com/Elyeet9"
          className="text-purple-200 underline decoration-purple-500/60 underline-offset-4 hover:text-purple-100"
        >
          https://github.com/Elyeet9
        </a>
      </footer>

      {/* Responsive Bookmark Tabs */}
      <div className="fixed bottom-6 right-0 z-50 flex flex-col gap-3 lg:hidden">
        <button
          onClick={() => setActiveTab("info")}
          className={`group relative flex h-12 w-16 items-center justify-center transition-all duration-300 border-l border-t border-b ${
            activeTab === "info"
              ? "bg-purple-600/40 text-white shadow-[-4px_0_12px_rgba(147,51,234,0.2)] border-purple-400/50"
              : "bg-[#1f1635]/20 text-purple-300 hover:bg-[#2d224d]/40 border-purple-900/30"
          }`}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 25% 50%)",
          }}
          title="Character Info"
        >
          <div className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span className="absolute right-full mr-3 hidden rounded-md bg-purple-900 px-2 py-1 text-xs whitespace-nowrap group-hover:block">Info</span>
        </button>

        <button
          onClick={() => setActiveTab("combat")}
          className={`group relative flex h-12 w-16 items-center justify-center transition-all duration-300 border-l border-t border-b ${
            activeTab === "combat"
              ? "bg-purple-600/40 text-white shadow-[-4px_0_12px_rgba(147,51,234,0.2)] border-purple-400/50"
              : "bg-[#1f1635]/20 text-purple-300 hover:bg-[#2d224d]/40 border-purple-900/30"
          }`}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 25% 50%)",
          }}
          title="Combat"
        >
          <div className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 8.5-8.5-1.5-1.5L11.5 17.5z"/><path d="m8 14 7-7"/><path d="m11 17 7-7"/></svg>
          </div>
          <span className="absolute right-full mr-3 hidden rounded-md bg-purple-900 px-2 py-1 text-xs whitespace-nowrap group-hover:block">Combat</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`group relative flex h-12 w-16 items-center justify-center transition-all duration-300 border-l border-t border-b ${
            activeTab === "features"
              ? "bg-purple-600/40 text-white shadow-[-4px_0_12px_rgba(147,51,234,0.2)] border-purple-400/50"
              : "bg-[#1f1635]/20 text-purple-300 hover:bg-[#2d224d]/40 border-purple-900/30"
          }`}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 25% 50%)",
          }}
          title="Features & Traits"
        >
          <div className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <span className="absolute right-full mr-3 hidden rounded-md bg-purple-900 px-2 py-1 text-xs whitespace-nowrap group-hover:block">Features</span>
        </button>
      </div>
    </div>
  );
}
