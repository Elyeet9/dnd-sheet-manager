"use client";

import React, { useEffect, useRef, useState } from "react";
import { Cinzel_Decorative } from "next/font/google";
import { AnimatePresence } from "motion/react";
import Swal from "sweetalert2";
import LoadingScreen from "./LoadingScreen";
import SortableSpellList from "./SortableSpellList";
import SpellSlotTracker from "./SpellSlotTracker";
import SpellSlotHelper, {
  slotsForCaster,
  type CasterType,
} from "./SpellSlotHelper";
import AdditionalResources, {
  type ResourceEntry,
} from "./AdditionalResources";

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
  jackOfAllTrades: boolean;
  weaponProficiencies: string;
  toolProficiencies: string;
  spellcastingAbility: string;
  spellcastingModifier: string;
  spellSaveDc: string;
  spellAttackBonus: string;
  spellSaveDcAdjust: number;
  spellAttackBonusAdjust: number;
  appearanceImage: string;
  appearance: string;
  backstoryPersonality: string;
  alignment: string;
  languages: string;
  equipment: string;
  magicItemAttunement: string[];
  coinCp: string;
  coinSp: string;
  coinEp: string;
  coinGp: string;
  coinPp: string;
  cantrips: string[];
  spellsLevel1: string[];
  spellsLevel2: string[];
  spellsLevel3: string[];
  spellsLevel4: string[];
  spellsLevel5: string[];
  spellsLevel6: string[];
  spellsLevel7: string[];
  spellsLevel8: string[];
  spellsLevel9: string[];
  spellSlotsLevel1Expended: string;
  spellSlotsLevel2Expended: string;
  spellSlotsLevel3Expended: string;
  spellSlotsLevel4Expended: string;
  spellSlotsLevel5Expended: string;
  spellSlotsLevel6Expended: string;
  spellSlotsLevel7Expended: string;
  spellSlotsLevel8Expended: string;
  spellSlotsLevel9Expended: string;
  spellSlotsLevel1Max: string;
  spellSlotsLevel2Max: string;
  spellSlotsLevel3Max: string;
  spellSlotsLevel4Max: string;
  spellSlotsLevel5Max: string;
  spellSlotsLevel6Max: string;
  spellSlotsLevel7Max: string;
  spellSlotsLevel8Max: string;
  spellSlotsLevel9Max: string;
  additionalResources: ResourceEntry[];
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

type SpellListKey =
  | "cantrips"
  | "spellsLevel1"
  | "spellsLevel2"
  | "spellsLevel3"
  | "spellsLevel4"
  | "spellsLevel5"
  | "spellsLevel6"
  | "spellsLevel7"
  | "spellsLevel8"
  | "spellsLevel9";

type ModularFieldKey =
  | "classFeaturesLeft"
  | "classFeaturesRight"
  | "speciesTraits"
  | "feats"
  | "magicItemAttunement"
  | SpellListKey;

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

const abilityLabels: Record<AbilityKey, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

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
  jackOfAllTrades: false,
  weaponProficiencies: "",
  toolProficiencies: "",
  spellcastingAbility: "",
  spellcastingModifier: "",
  spellSaveDc: "",
  spellAttackBonus: "",
  spellSaveDcAdjust: 0,
  spellAttackBonusAdjust: 0,
  appearanceImage: "",
  appearance: "",
  backstoryPersonality: "",
  alignment: "",
  languages: "",
  equipment: "",
  magicItemAttunement: ["", "", ""],
  coinCp: "",
  coinSp: "",
  coinEp: "",
  coinGp: "",
  coinPp: "",
  cantrips: [],
  spellsLevel1: [],
  spellsLevel2: [],
  spellsLevel3: [],
  spellsLevel4: [],
  spellsLevel5: [],
  spellsLevel6: [],
  spellsLevel7: [],
  spellsLevel8: [],
  spellsLevel9: [],
  spellSlotsLevel1Expended: "",
  spellSlotsLevel2Expended: "",
  spellSlotsLevel3Expended: "",
  spellSlotsLevel4Expended: "",
  spellSlotsLevel5Expended: "",
  spellSlotsLevel6Expended: "",
  spellSlotsLevel7Expended: "",
  spellSlotsLevel8Expended: "",
  spellSlotsLevel9Expended: "",
  spellSlotsLevel1Max: "0",
  spellSlotsLevel2Max: "0",
  spellSlotsLevel3Max: "0",
  spellSlotsLevel4Max: "0",
  spellSlotsLevel5Max: "0",
  spellSlotsLevel6Max: "0",
  spellSlotsLevel7Max: "0",
  spellSlotsLevel8Max: "0",
  spellSlotsLevel9Max: "0",
  additionalResources: [],
};

const storageKey = "dnd-sheet-2024-v1";

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetData>(defaultSheetData);
  const [activeTab, setActiveTab] = useState<
    "info" | "combat" | "features" | "lore"
  >("info");
  const [desktopPageTab, setDesktopPageTab] = useState<"I" | "II">("I");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState("Searching for an existing character…");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);
  const loadInputRef = useRef<HTMLInputElement | null>(null);
  const appearanceImageInputRef = useRef<HTMLInputElement | null>(null);
  const mobileAppearanceImageInputRef = useRef<HTMLInputElement | null>(null);
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
    jackOfAllTrades: partial.jackOfAllTrades ?? false,
    weaponProficiencies: partial.weaponProficiencies ?? "",
    toolProficiencies: partial.toolProficiencies ?? "",
    spellcastingAbility: abilityKeys.includes(
      (partial.spellcastingAbility ?? "").toLowerCase() as AbilityKey,
    )
      ? (partial.spellcastingAbility ?? "").toLowerCase()
      : "",
    spellcastingModifier: partial.spellcastingModifier ?? "",
    spellSaveDc: partial.spellSaveDc ?? "",
    spellAttackBonus: partial.spellAttackBonus ?? "",
    spellSaveDcAdjust: partial.spellSaveDcAdjust ?? 0,
    spellAttackBonusAdjust: partial.spellAttackBonusAdjust ?? 0,
    appearanceImage: partial.appearanceImage ?? "",
    appearance: partial.appearance ?? "",
    backstoryPersonality: partial.backstoryPersonality ?? "",
    alignment: partial.alignment ?? "",
    languages: partial.languages ?? "",
    equipment: partial.equipment ?? "",
    magicItemAttunement: partial.magicItemAttunement ?? ["", "", ""],
    coinCp: partial.coinCp ?? "",
    coinSp: partial.coinSp ?? "",
    coinEp: partial.coinEp ?? "",
    coinGp: partial.coinGp ?? "",
    coinPp: partial.coinPp ?? "",
    cantrips: partial.cantrips ?? [""],
    spellsLevel1: partial.spellsLevel1 ?? [""],
    spellsLevel2: partial.spellsLevel2 ?? [""],
    spellsLevel3: partial.spellsLevel3 ?? [""],
    spellsLevel4: partial.spellsLevel4 ?? [""],
    spellsLevel5: partial.spellsLevel5 ?? [""],
    spellsLevel6: partial.spellsLevel6 ?? [""],
    spellsLevel7: partial.spellsLevel7 ?? [""],
    spellsLevel8: partial.spellsLevel8 ?? [""],
    spellsLevel9: partial.spellsLevel9 ?? [""],
    spellSlotsLevel1Expended: partial.spellSlotsLevel1Expended ?? "",
    spellSlotsLevel2Expended: partial.spellSlotsLevel2Expended ?? "",
    spellSlotsLevel3Expended: partial.spellSlotsLevel3Expended ?? "",
    spellSlotsLevel4Expended: partial.spellSlotsLevel4Expended ?? "",
    spellSlotsLevel5Expended: partial.spellSlotsLevel5Expended ?? "",
    spellSlotsLevel6Expended: partial.spellSlotsLevel6Expended ?? "",
    spellSlotsLevel7Expended: partial.spellSlotsLevel7Expended ?? "",
    spellSlotsLevel8Expended: partial.spellSlotsLevel8Expended ?? "",
    spellSlotsLevel9Expended: partial.spellSlotsLevel9Expended ?? "",
    spellSlotsLevel1Max: partial.spellSlotsLevel1Max ?? "0",
    spellSlotsLevel2Max: partial.spellSlotsLevel2Max ?? "0",
    spellSlotsLevel3Max: partial.spellSlotsLevel3Max ?? "0",
    spellSlotsLevel4Max: partial.spellSlotsLevel4Max ?? "0",
    spellSlotsLevel5Max: partial.spellSlotsLevel5Max ?? "0",
    spellSlotsLevel6Max: partial.spellSlotsLevel6Max ?? "0",
    spellSlotsLevel7Max: partial.spellSlotsLevel7Max ?? "0",
    spellSlotsLevel8Max: partial.spellSlotsLevel8Max ?? "0",
    spellSlotsLevel9Max: partial.spellSlotsLevel9Max ?? "0",
    additionalResources: (partial.additionalResources ?? []).map((entry) => ({
      id: entry?.id ?? crypto.randomUUID(),
      name: entry?.name ?? "",
      maxMode: entry?.maxMode ?? "fixed",
      maxFixed: entry?.maxFixed ?? "",
      maxAbility: entry?.maxAbility ?? "",
      recharge: entry?.recharge ?? "short",
      rechargeOther: entry?.rechargeOther ?? "",
      used: entry?.used ?? "0",
    })),
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      // Phase 1: look for a saved character.
      setLoadStatus("Searching for an existing character…");
      await wait(750);
      if (cancelled) return;

      const cached = window.localStorage.getItem(storageKey);
      let foundCharacter = false;
      let characterName = "";
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Partial<SheetData>;
          const normalized = normalizeSheetData(parsed);
          setSheetData(normalized);
          foundCharacter = true;
          characterName = normalized.characterName.trim();
        } catch {
          setSheetData(defaultSheetData);
        }
      }
      setHasHydrated(true);

      // Phase 2: report what was found.
      if (foundCharacter) {
        setLoadStatus(
          characterName
            ? `Loading ${characterName}…`
            : "Loading your character…",
        );
      } else {
        setLoadStatus("No saved character found — preparing a fresh page…");
      }
      await wait(950);
      if (cancelled) return;

      // Let the page paint before revealing it.
      setLoadStatus("Unfurling the sheet…");
      await wait(400);
      if (cancelled) return;

      setIsLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Prevent background scroll while the loading screen is showing.
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(sheetData));
  }, [hasHydrated, sheetData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 240);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isTabMenuOpen) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTabMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isTabMenuOpen]);

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

  const handleAppearanceImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });

      setSheetData((prev) => ({
        ...prev,
        appearanceImage: imageDataUrl,
      }));
    } catch {
      await Swal.fire({
        title: "Invalid image",
        text: "We couldn't load that image. Try another file.",
        icon: "error",
        background: "#140d24",
        color: "#e2e8f0",
        confirmButtonColor: "#a855f7",
      });
    } finally {
      event.target.value = "";
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

  const handleShortRest = async () => {
    const result = await Swal.fire({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <div style="text-align:left;font-size:0.9rem;line-height:1.5;">
            <p style="margin:0 0 6px;">A breather of about an hour. This will:</p>
            <ul style="margin:0;padding-left:1.1rem;">
              <li>Restore resources that recharge on a <b style="color:#c4b5fd">Short Rest</b></li>
            </ul>
            <p style="margin:8px 0 0;font-size:0.78rem;color:#a5a1b8;">You may also spend Hit Dice to heal &mdash; adjust those manually.</p>
          </div>
        </div>`,
      title: "Take a Short Rest?",
      showCancelButton: true,
      confirmButtonText: "Rest",
      cancelButtonText: "Cancel",
      background: "#140d24",
      color: "#e2e8f0",
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
    });

    if (!result.isConfirmed) return;

    setSheetData((prev) => ({
      ...prev,
      additionalResources: prev.additionalResources.map((entry) =>
        entry.recharge === "short" ? { ...entry, used: "0" } : entry,
      ),
    }));
  };

  const handleLongRest = async () => {
    const result = await Swal.fire({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <div style="text-align:left;font-size:0.9rem;line-height:1.5;">
            <p style="margin:0 0 6px;">A full night's rest. This will:</p>
            <ul style="margin:0;padding-left:1.1rem;">
              <li>Restore <b style="color:#c4b5fd">current HP</b> to your maximum</li>
              <li>Recover all expended <b style="color:#c4b5fd">spell slots</b></li>
              <li>Regain spent <b style="color:#c4b5fd">Hit Dice</b> (up to half your total)</li>
              <li>Restore resources that recharge on a <b style="color:#c4b5fd">Short or Long Rest</b></li>
              <li>Reset your <b style="color:#c4b5fd">death saves</b> and clear temporary HP</li>
            </ul>
          </div>
        </div>`,
      title: "Take a Long Rest?",
      showCancelButton: true,
      confirmButtonText: "Rest",
      cancelButtonText: "Cancel",
      background: "#140d24",
      color: "#e2e8f0",
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
    });

    if (!result.isConfirmed) return;

    setSheetData((prev) => {
      const updates: Record<string, string> = {};
      // Recover all expended spell slots.
      for (let lvl = 1; lvl <= 9; lvl++) {
        updates[`spellSlotsLevel${lvl}Expended`] = "0";
      }
      // Heal to full and clear temporary HP.
      updates.hpCurrent = prev.hpMax;
      updates.hpTemp = "";
      // Regain spent Hit Dice, up to half the total (minimum 1).
      const totalHitDice = Math.max(0, toNumber(prev.hitDiceMax));
      const spentHitDice = Math.max(0, toNumber(prev.hitDiceSpent));
      const recovered = Math.min(
        spentHitDice,
        Math.max(1, Math.floor(totalHitDice / 2)),
      );
      updates.hitDiceSpent = String(spentHitDice - recovered);

      return {
        ...prev,
        ...updates,
        // Regaining HP resets death saves.
        deathSuccesses: 0,
        deathFailures: 0,
        // Long rests recover both short- and long-rest resources.
        additionalResources: prev.additionalResources.map((entry) =>
          entry.recharge === "short" || entry.recharge === "long"
            ? { ...entry, used: "0" }
            : entry,
        ),
      };
    });
  };

  const handleChange = (field: keyof SheetData) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
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
    const getsJackOfAllTrades = !isProficient && !isExpert;
    return (
      getAbilityMod(abilityKey) +
      (isProficient ? proficiencyBonus : 0) +
      (isExpert ? proficiencyBonus : 0) +
      (getsJackOfAllTrades ? jackOfAllTradesBonus : 0)
    );
  };

  const getSavingThrowTotal = (abilityKey: AbilityKey) => {
    const isProficient = sheetData.savingThrowProficiencies[abilityKey];
    return (
      getAbilityMod(abilityKey) +
      (isProficient ? proficiencyBonus : jackOfAllTradesBonus)
    );
  };

  const adjustNumeric = (
    field:
      | "initiativeAdjust"
      | "passivePerceptionAdjust"
      | "spellSaveDcAdjust"
      | "spellAttackBonusAdjust",
    delta: number,
  ) => {
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

  // Grow a textarea to fit its content (used by the auto-sizing weapon fields).
  const fitTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const addResource = () => {
    const newResource: ResourceEntry = {
      id: crypto.randomUUID(),
      name: "",
      maxMode: "fixed",
      maxFixed: "",
      maxAbility: "",
      recharge: "short",
      rechargeOther: "",
      used: "0",
    };
    setSheetData((prev) => ({
      ...prev,
      additionalResources: [...prev.additionalResources, newResource],
    }));
  };

  const updateResource = (id: string, patch: Partial<ResourceEntry>) => {
    setSheetData((prev) => ({
      ...prev,
      additionalResources: prev.additionalResources.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  };

  const removeResource = (id: string) => {
    setSheetData((prev) => ({
      ...prev,
      additionalResources: prev.additionalResources.filter(
        (entry) => entry.id !== id,
      ),
    }));
  };

  const addModularItem = (side: ModularFieldKey) => {
    setSheetData((prev) => ({
      ...prev,
      [side]: [...prev[side], ""],
    }));
  };

  const updateModularItem = (
    side: ModularFieldKey,
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
    side: ModularFieldKey,
    index: number,
  ) => {
    setSheetData((prev) => ({
      ...prev,
      [side]: prev[side].filter((_: string, idx: number) => idx !== index),
    }));
  };

  const spellLevelSections: Array<{
    key: SpellListKey;
    label: string;
    slotLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;
  }> = [
    { key: "cantrips", label: "Cantrips", slotLevel: null },
    { key: "spellsLevel1", label: "Level 1", slotLevel: 1 },
    { key: "spellsLevel2", label: "Level 2", slotLevel: 2 },
    { key: "spellsLevel3", label: "Level 3", slotLevel: 3 },
    { key: "spellsLevel4", label: "Level 4", slotLevel: 4 },
    { key: "spellsLevel5", label: "Level 5", slotLevel: 5 },
    { key: "spellsLevel6", label: "Level 6", slotLevel: 6 },
    { key: "spellsLevel7", label: "Level 7", slotLevel: 7 },
    { key: "spellsLevel8", label: "Level 8", slotLevel: 8 },
    { key: "spellsLevel9", label: "Level 9", slotLevel: 9 },
  ];

  const spellLevelColumns: SpellListKey[][] = [
    ["cantrips", "spellsLevel1", "spellsLevel2"],
    ["spellsLevel3", "spellsLevel4", "spellsLevel5"],
    ["spellsLevel6", "spellsLevel7", "spellsLevel8", "spellsLevel9"],
  ];

  const levelValue = Math.max(1, toNumber(sheetData.level));

  const allSpellSlotsEmpty = [1, 2, 3, 4, 5, 6, 7, 8, 9].every((lvl) => {
    const raw = sheetData[`spellSlotsLevel${lvl}Max` as keyof SheetData];
    return (Number.parseInt(String(raw ?? "0"), 10) || 0) === 0;
  });

  const applyCasterSlots = (type: CasterType, casterLevel: number) => {
    const slots = slotsForCaster(type, casterLevel);
    setSheetData((prev) => {
      const updates: Record<string, string> = {};
      for (let lvl = 1; lvl <= 9; lvl++) {
        const max = slots[lvl - 1];
        const expKey = `spellSlotsLevel${lvl}Expended` as keyof SheetData;
        const curExp =
          Number.parseInt(String(prev[expKey] ?? "0"), 10) || 0;
        updates[`spellSlotsLevel${lvl}Max`] = String(max);
        updates[`spellSlotsLevel${lvl}Expended`] = String(
          Math.min(curExp, max),
        );
      }
      return { ...prev, ...updates };
    });
  };

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
  const resourceAbilities = abilityKeys.map((key) => ({
    key,
    label: abilityLabels[key],
    mod: getAbilityMod(key),
  }));
  const jackOfAllTradesBonus = sheetData.jackOfAllTrades
    ? Math.floor(proficiencyBonus / 2)
    : 0;

  const spellcastingAbilityKey = abilityKeys.includes(
    sheetData.spellcastingAbility as AbilityKey,
  )
    ? (sheetData.spellcastingAbility as AbilityKey)
    : null;
  const spellcastingAbilityMod = spellcastingAbilityKey
    ? getAbilityMod(spellcastingAbilityKey)
    : 0;
  const spellcastingModifierDisplay = spellcastingAbilityKey
    ? `${spellcastingAbilityMod >= 0 ? "+" : ""}${spellcastingAbilityMod}`
    : "—";
  const spellSaveDcBase = spellcastingAbilityKey
    ? 8 + proficiencyBonus + spellcastingAbilityMod
    : null;
  const spellAttackBonusBase = spellcastingAbilityKey
    ? spellcastingAbilityMod + proficiencyBonus
    : null;
  const spellSaveDcTotal = spellSaveDcBase !== null
    ? spellSaveDcBase + sheetData.spellSaveDcAdjust
    : null;
  const spellAttackBonusTotal = spellAttackBonusBase !== null
    ? spellAttackBonusBase + sheetData.spellAttackBonusAdjust
    : null;

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

  const autoSizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const mobileTabs: {
    key: "info" | "combat" | "features" | "lore";
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "info",
      label: "Info",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ),
    },
    {
      key: "combat",
      label: "Combat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 8.5-8.5-1.5-1.5L11.5 17.5z"/><path d="m8 14 7-7"/><path d="m11 17 7-7"/></svg>
      ),
    },
    {
      key: "features",
      label: "Features",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      ),
    },
    {
      key: "lore",
      label: "Details",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      ),
    },
  ];

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
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen
            key="loading-screen"
            status={loadStatus}
            fontClassName={titleFont.className}
          />
        )}
      </AnimatePresence>
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
              Dungeon Sheets
            </h1>
            <p className="text-sm text-slate-300">
              A D&D 2024 modular character sheet.
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
              suppressHydrationWarning
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
              suppressHydrationWarning
            >
              Save JSON
            </button>
            </div>
            <p className="text-xs text-purple-200/70">
              Data is saved in your browser cache. Still save JSON to prevent data loss.
            </p>
          </div>
        </div>

        <div className="relative hidden lg:flex lg:items-center lg:justify-center">
          <div className="inline-flex overflow-hidden rounded-lg border border-purple-900/60 bg-[#1f1635] p-1">
            <button
              type="button"
              onClick={() => setDesktopPageTab("I")}
              className={`min-w-16 rounded-md px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                desktopPageTab === "I"
                  ? "bg-purple-500 text-slate-950"
                  : "text-purple-200 hover:bg-[#2d224d]"
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => setDesktopPageTab("II")}
              className={`min-w-16 rounded-md px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                desktopPageTab === "II"
                  ? "bg-purple-500 text-slate-950"
                  : "text-purple-200 hover:bg-[#2d224d]"
              }`}
            >
              II
            </button>
          </div>
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <button
              type="button"
              onClick={handleShortRest}
              className="flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-[#1f1635] px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:border-amber-400 hover:text-amber-100"
              title="Restore short-rest resources"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              Short Rest
            </button>
            <button
              type="button"
              onClick={handleLongRest}
              className="flex items-center gap-1.5 rounded-md border border-indigo-400/50 bg-[#1f1635] px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-indigo-100"
              title="Full recovery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              Long Rest
            </button>
          </div>
        </div>

        <div
          className={`space-y-3 ${
            desktopPageTab === "I" ? "block" : "block lg:hidden"
          }`}
        >
          <section className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-3">
          <div className={`flex flex-col gap-3 md:flex-row md:items-stretch lg:contents ${activeTab === "info" ? "flex" : "hidden lg:contents"}`}>
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
          <div className={`h-40 rounded-xl border border-purple-900/60 bg-[#1f1635] p-1.5 shadow-sm md:col-span-12 lg:col-span-6 ${activeTab === "combat" ? "block" : "hidden lg:block"}`}>
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

            <div className="mt-3 space-y-2">
              {sheetData.weapons.length === 0 && (
                <div className="rounded-lg border border-dashed border-purple-900/60 bg-[#140d24] px-3 py-6 text-center text-xs text-purple-200">
                  Add entries to track weapons and cantrips.
                </div>
              )}

              {sheetData.weapons.map((entry) => (
                <div
                  key={`mobile-${entry.id}`}
                  className="rounded-lg border border-purple-900/60 bg-[#0f0a1c]"
                >
                  {/* Name + remove */}
                  <div className="flex items-start gap-1 border-b border-purple-900/60 px-2.5 py-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                        Name
                      </span>
                      <textarea
                        rows={1}
                        value={entry.name}
                        onChange={(event) =>
                          updateWeaponEntry(entry.id, "name", event.target.value)
                        }
                        ref={(element) => fitTextareaHeight(element)}
                        onInput={(event) => fitTextareaHeight(event.currentTarget)}
                        className="mt-0.5 min-w-0 w-full resize-none overflow-hidden bg-transparent text-sm font-semibold leading-5 text-slate-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWeaponEntry(entry.id)}
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-purple-900/60 bg-[#140d24] text-sm font-semibold text-red-300 transition hover:border-red-300"
                      aria-label="Remove weapon"
                    >
                      −
                    </button>
                  </div>

                  {/* Atk/DC + Damage & Type */}
                  <div className="grid grid-cols-2 divide-x divide-purple-900/60 border-b border-purple-900/60">
                    <div className="min-w-0 px-2.5 py-1.5">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                        Atk / DC
                      </span>
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
                        ref={(element) => fitTextareaHeight(element)}
                        onInput={(event) => fitTextareaHeight(event.currentTarget)}
                        className="mt-0.5 min-w-0 w-full resize-none overflow-hidden bg-transparent text-sm leading-5 text-slate-100"
                      />
                    </div>
                    <div className="min-w-0 px-2.5 py-1.5">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                        Damage & Type
                      </span>
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
                        ref={(element) => fitTextareaHeight(element)}
                        onInput={(event) => fitTextareaHeight(event.currentTarget)}
                        className="mt-0.5 min-w-0 w-full resize-none overflow-hidden bg-transparent text-sm leading-5 text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="px-2.5 py-1.5">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                      Notes
                    </span>
                    <textarea
                      rows={1}
                      value={entry.notes}
                      onChange={(event) =>
                        updateWeaponEntry(entry.id, "notes", event.target.value)
                      }
                      ref={(element) => fitTextareaHeight(element)}
                      onInput={(event) => fitTextareaHeight(event.currentTarget)}
                      className="mt-0.5 min-w-0 w-full resize-none overflow-hidden bg-transparent text-sm leading-5 text-slate-100"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addWeaponEntry}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400 hover:bg-[#1a1130]"
                aria-label="Add weapon"
              >
                <span className="text-sm">+</span>
                Add Weapon
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <AdditionalResources
              resources={sheetData.additionalResources}
              abilities={resourceAbilities}
              proficiencyBonus={proficiencyBonus}
              onAdd={addResource}
              onUpdate={updateResource}
              onRemove={removeResource}
            />
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Spellcasting
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Spellcasting Ability
                </div>
                <select
                  value={sheetData.spellcastingAbility}
                  onChange={handleChange("spellcastingAbility")}
                  className="mt-2 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                >
                  <option value="">Select ability</option>
                  {abilityKeys.map((abilityKey) => (
                    <option key={abilityKey} value={abilityKey}>
                      {abilityLabels[abilityKey]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Spellcasting Modifier
                </div>
                <input
                  value={spellcastingModifierDisplay}
                  readOnly
                  className="mt-2 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                />
              </div>
              <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Spell Save DC
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-2">
                  <div className="text-2xl font-semibold text-slate-100">
                    {spellSaveDcTotal !== null ? `${spellSaveDcTotal}` : "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustNumeric("spellSaveDcAdjust", -1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                      aria-label="Decrease spell save DC bonus"
                    >
                      −
                    </button>
                    <span
                      className={`text-sm font-semibold ${
                        sheetData.spellSaveDcAdjust >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {sheetData.spellSaveDcAdjust >= 0
                        ? `+${sheetData.spellSaveDcAdjust}`
                        : `${sheetData.spellSaveDcAdjust}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustNumeric("spellSaveDcAdjust", 1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                      aria-label="Increase spell save DC bonus"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Spell Attack Bonus
                </div>
                <div className="mt-2 flex flex-col items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-2">
                  <div className="text-2xl font-semibold text-slate-100">
                    {spellAttackBonusTotal !== null
                      ? `${spellAttackBonusTotal >= 0 ? "+" : ""}${spellAttackBonusTotal}`
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustNumeric("spellAttackBonusAdjust", -1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                      aria-label="Decrease spell attack bonus"
                    >
                      −
                    </button>
                    <span
                      className={`text-sm font-semibold ${
                        sheetData.spellAttackBonusAdjust >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {sheetData.spellAttackBonusAdjust >= 0
                        ? `+${sheetData.spellAttackBonusAdjust}`
                        : `${sheetData.spellAttackBonusAdjust}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustNumeric("spellAttackBonusAdjust", 1)}
                      className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                      aria-label="Increase spell attack bonus"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Cantrips & Prepared Spells (By Level)
              </div>
            </div>
            {allSpellSlotsEmpty && (
              <SpellSlotHelper defaultLevel={levelValue} onApply={applyCasterSlots} />
            )}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {spellLevelSections.map((section) => {
                const slotLevel = section.slotLevel;
                const maxKey = slotLevel
                  ? (`spellSlotsLevel${slotLevel}Max` as keyof SheetData)
                  : null;
                const expendedKey = slotLevel
                  ? (`spellSlotsLevel${slotLevel}Expended` as keyof SheetData)
                  : null;
                const maxSlots = maxKey
                  ? Math.max(
                      0,
                      Math.min(
                        9,
                        Number.parseInt(String(sheetData[maxKey] ?? "0"), 10) ||
                          0,
                      ),
                    )
                  : 0;
                const currentExpended = expendedKey
                  ? Math.max(
                      0,
                      Math.min(
                        maxSlots,
                        Number.parseInt(
                          String(sheetData[expendedKey] ?? "0"),
                          10,
                        ) || 0,
                      ),
                    )
                  : 0;

                return (
                  <div
                    key={`mobile-${section.key}`}
                    className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                  >
                    <div className="rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200">
                          {section.label}
                        </span>
                        {slotLevel ? (
                          <SpellSlotTracker
                            max={maxSlots}
                            expended={currentExpended}
                            label={section.label}
                            onChangeMax={(nextMax) =>
                              setSheetData((prev) => {
                                const clampedMax = Math.max(
                                  0,
                                  Math.min(9, nextMax),
                                );
                                const curExp =
                                  Number.parseInt(
                                    String(prev[expendedKey!] ?? "0"),
                                    10,
                                  ) || 0;
                                return {
                                  ...prev,
                                  [maxKey!]: String(clampedMax),
                                  [expendedKey!]: String(
                                    Math.min(curExp, clampedMax),
                                  ),
                                };
                              })
                            }
                            onChangeExpended={(nextExpended) =>
                              setSheetData((prev) => ({
                                ...prev,
                                [expendedKey!]: String(nextExpended),
                              }))
                            }
                          />
                        ) : null}
                      </div>
                    </div>

                    <SortableSpellList
                      values={sheetData[section.key] as string[]}
                      onChange={(next) =>
                        setSheetData((prev) => ({ ...prev, [section.key]: next }))
                      }
                      removeLabel={`Remove ${section.label} entry`}
                    />
                  </div>
                );
              })}
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

        <section className={`lg:hidden ${activeTab === "lore" ? "block" : "hidden"}`}>
          <div className="mt-1 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Appearance
              </div>
            </div>
            <input
              ref={mobileAppearanceImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleAppearanceImageChange}
              className="hidden"
            />
            <div className="mt-3 rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
              {sheetData.appearanceImage ? (
                <img
                  src={sheetData.appearanceImage}
                  alt="Character appearance"
                  className="block h-auto w-full rounded-md border border-purple-900/60"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-purple-900/60 text-xs uppercase tracking-[0.14em] text-purple-300/80">
                  No image selected
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => mobileAppearanceImageInputRef.current?.click()}
                  className="flex-1 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-400"
                >
                  {sheetData.appearanceImage ? "Change Image" : "Add Image"}
                </button>
                {sheetData.appearanceImage ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSheetData((prev) => ({
                        ...prev,
                        appearanceImage: "",
                      }))
                    }
                    className="rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:border-red-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <textarea
              rows={6}
              ref={(element) => autoSizeTextarea(element)}
              onInput={(event) => autoSizeTextarea(event.currentTarget)}
              value={sheetData.appearance}
              onChange={(event) =>
                setSheetData((prev) => ({ ...prev, appearance: event.target.value }))
              }
              placeholder="Height, build, distinguishing features…"
              className="mt-3 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Backstory & Personality
              </div>
            </div>
            <textarea
              rows={8}
              ref={(element) => autoSizeTextarea(element)}
              onInput={(event) => autoSizeTextarea(event.currentTarget)}
              value={sheetData.backstoryPersonality}
              onChange={(event) =>
                setSheetData((prev) => ({
                  ...prev,
                  backstoryPersonality: event.target.value,
                }))
              }
              placeholder="History, personality traits, ideals, bonds, flaws…"
              className="mt-3 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
            />
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                Alignment
              </div>
              <input
                value={sheetData.alignment}
                onChange={handleChange("alignment")}
                className="mt-1 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Languages
              </div>
            </div>
            <textarea
              rows={3}
              ref={(element) => autoSizeTextarea(element)}
              onInput={(event) => autoSizeTextarea(event.currentTarget)}
              value={sheetData.languages}
              onChange={(event) =>
                setSheetData((prev) => ({ ...prev, languages: event.target.value }))
              }
              className="mt-3 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Equipment & Attunement
              </div>
            </div>
            <textarea
              rows={6}
              ref={(element) => autoSizeTextarea(element)}
              onInput={(event) => autoSizeTextarea(event.currentTarget)}
              value={sheetData.equipment}
              onChange={(event) =>
                setSheetData((prev) => ({ ...prev, equipment: event.target.value }))
              }
              placeholder="Gear, tools, and carried items…"
              className="mt-3 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
            />
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                Magic Item Attunement
              </div>
              <div className="mt-2 space-y-2">
                {sheetData.magicItemAttunement.map((value: string, index: number) => (
                  <div key={`mobile-attune-${index}`} className="flex items-start gap-2">
                    <input
                      value={value}
                      onChange={(event) =>
                        updateModularItem("magicItemAttunement", index, event.target.value)
                      }
                      className="w-full rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeModularItem("magicItemAttunement", index)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                      aria-label="Remove attunement slot"
                    >
                      −
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addModularItem("magicItemAttunement")}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-400"
                >
                  <span className="text-sm">+</span>
                  Add Attunement Slot
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
            <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Coins
              </div>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[
                { key: "coinCp", label: "CP" },
                { key: "coinSp", label: "SP" },
                { key: "coinEp", label: "EP" },
                { key: "coinGp", label: "GP" },
                { key: "coinPp", label: "PP" },
              ].map((coin) => (
                <div key={`mobile-${coin.key}`}>
                  <div className="text-center text-[9px] font-semibold uppercase tracking-wide text-purple-300/80">
                    {coin.label}
                  </div>
                  <input
                    value={sheetData[coin.key as keyof SheetData] as string}
                    onChange={(event) =>
                      setSheetData((prev) => ({
                        ...prev,
                        [coin.key]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-1 text-center text-xs text-slate-100"
                  />
                </div>
              ))}
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
                                                const total = getSavingThrowTotal(
                                                  ability.key,
                                                );
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
                                            (isExpert ? proficiencyBonus : 0) +
                                            (!isProficient && !isExpert
                                              ? jackOfAllTradesBonus
                                              : 0);
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
                                    const total = getSavingThrowTotal(
                                      ability.key,
                                    );
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
                                (isExpert ? proficiencyBonus : 0) +
                                (!isProficient && !isExpert
                                  ? jackOfAllTradesBonus
                                  : 0);
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

                <div className="col-span-2 flex items-center justify-center gap-3 rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Jack of All Trades
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSheetData((prev) => ({
                        ...prev,
                        jackOfAllTrades: !prev.jackOfAllTrades,
                      }))
                    }
                    className={`h-4 w-4 rotate-45 border-2 transition-all ${
                      sheetData.jackOfAllTrades
                        ? "border-none bg-purple-400 [box-shadow:0_0_8px_rgba(168,85,247,0.5)]"
                        : "border-purple-500/40 bg-transparent"
                    }`}
                    aria-label="Toggle Jack of All Trades"
                  />
                </div>
              </div>
            </div>

            <div className={`rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm ${activeTab === "info" ? "block" : "hidden lg:block"}`}>
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
            <div className={`rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 shadow-sm ${activeTab === "info" ? "block" : "hidden lg:block"}`}>
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

            <div className={`mt-3 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 ${activeTab === "combat" ? "block" : "hidden lg:block"}`}>
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
                      <span className="sm:hidden">Atk / DC</span>
                      <span className="hidden sm:inline">Atk Bonus / DC</span>
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

            <div className="mt-3 hidden rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 lg:block">
              <AdditionalResources
                resources={sheetData.additionalResources}
                abilities={resourceAbilities}
                proficiencyBonus={proficiencyBonus}
                onAdd={addResource}
                onUpdate={updateResource}
                onRemove={removeResource}
              />
            </div>

            <div className={`mt-4 rounded-xl border border-purple-900/60 bg-[#1f1635] p-2 ${activeTab === "features" ? "block" : "hidden lg:block"}`}>
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

            <div className={`mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 ${activeTab === "features" ? "grid" : "hidden lg:grid"}`}>
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
        </div>

        <div
          className={`space-y-3 ${
            desktopPageTab === "II" ? "hidden lg:block" : "hidden"
          }`}
        >
          <section className="grid items-start gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Spellcasting Ability
                    </div>
                    <select
                      value={sheetData.spellcastingAbility}
                      onChange={handleChange("spellcastingAbility")}
                      className="mt-2 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                    >
                      <option value="">Select ability</option>
                      {abilityKeys.map((abilityKey) => (
                        <option key={abilityKey} value={abilityKey}>
                          {abilityLabels[abilityKey]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Spellcasting Modifier
                    </div>
                    <input
                      value={spellcastingModifierDisplay}
                      readOnly
                      className="mt-2 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                    />
                  </div>
                  <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Spell Save DC
                    </div>
                    <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-2">
                      <div className="text-2xl font-semibold text-slate-100">
                        {spellSaveDcTotal !== null ? `${spellSaveDcTotal}` : "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustNumeric("spellSaveDcAdjust", -1)}
                          className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                          aria-label="Decrease spell save DC bonus"
                        >
                          −
                        </button>
                        <span
                          className={`text-sm font-semibold ${
                            sheetData.spellSaveDcAdjust >= 0
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {sheetData.spellSaveDcAdjust >= 0
                            ? `+${sheetData.spellSaveDcAdjust}`
                            : `${sheetData.spellSaveDcAdjust}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustNumeric("spellSaveDcAdjust", 1)}
                          className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                          aria-label="Increase spell save DC bonus"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                      Spell Attack Bonus
                    </div>
                    <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-2">
                      <div className="text-2xl font-semibold text-slate-100">
                        {spellAttackBonusTotal !== null
                          ? `${spellAttackBonusTotal >= 0 ? "+" : ""}${spellAttackBonusTotal}`
                          : "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustNumeric("spellAttackBonusAdjust", -1)}
                          className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-purple-400"
                          aria-label="Decrease spell attack bonus"
                        >
                          −
                        </button>
                        <span
                          className={`text-sm font-semibold ${
                            sheetData.spellAttackBonusAdjust >= 0
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {sheetData.spellAttackBonusAdjust >= 0
                            ? `+${sheetData.spellAttackBonusAdjust}`
                            : `${sheetData.spellAttackBonusAdjust}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustNumeric("spellAttackBonusAdjust", 1)}
                          className="h-7 w-7 rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-emerald-300 transition hover:border-purple-400"
                          aria-label="Increase spell attack bonus"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-[#140d24] px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Cantrips & Prepared Spells (By Level)
                  </div>
                </div>
                {allSpellSlotsEmpty && (
                  <SpellSlotHelper defaultLevel={levelValue} onApply={applyCasterSlots} />
                )}
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {spellLevelColumns.map((column, columnIndex) => (
                    <div key={`spell-column-${columnIndex}`} className="space-y-3">
                      {column.map((sectionKey) => {
                        const section = spellLevelSections.find((entry) => entry.key === sectionKey);
                        if (!section) return null;

                        const slotLevel = section.slotLevel;
                        const maxKey = slotLevel
                          ? (`spellSlotsLevel${slotLevel}Max` as keyof SheetData)
                          : null;
                        const expendedKey = slotLevel
                          ? (`spellSlotsLevel${slotLevel}Expended` as keyof SheetData)
                          : null;
                        const maxSlots = maxKey
                          ? Math.max(
                              0,
                              Math.min(
                                9,
                                Number.parseInt(
                                  String(sheetData[maxKey] ?? "0"),
                                  10,
                                ) || 0,
                              ),
                            )
                          : 0;
                        const currentExpended = expendedKey
                          ? Math.max(
                              0,
                              Math.min(
                                maxSlots,
                                Number.parseInt(
                                  String(sheetData[expendedKey] ?? "0"),
                                  10,
                                ) || 0,
                              ),
                            )
                          : 0;

                        return (
                          <div
                            key={section.key}
                            className="rounded-lg border border-purple-900/60 bg-[#140d24] p-2"
                          >
                            <div className="rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200">
                                  {section.label}
                                </span>
                                {slotLevel ? (
                                  <SpellSlotTracker
                                    max={maxSlots}
                                    expended={currentExpended}
                                    label={section.label}
                                    onChangeMax={(nextMax) =>
                                      setSheetData((prev) => {
                                        const clampedMax = Math.max(
                                          0,
                                          Math.min(9, nextMax),
                                        );
                                        const curExp =
                                          Number.parseInt(
                                            String(prev[expendedKey!] ?? "0"),
                                            10,
                                          ) || 0;
                                        return {
                                          ...prev,
                                          [maxKey!]: String(clampedMax),
                                          [expendedKey!]: String(
                                            Math.min(curExp, clampedMax),
                                          ),
                                        };
                                      })
                                    }
                                    onChangeExpended={(nextExpended) =>
                                      setSheetData((prev) => ({
                                        ...prev,
                                        [expendedKey!]: String(nextExpended),
                                      }))
                                    }
                                  />
                                ) : null}
                              </div>
                            </div>

                            <SortableSpellList
                              values={sheetData[section.key] as string[]}
                              onChange={(next) =>
                                setSheetData((prev) => ({
                                  ...prev,
                                  [section.key]: next,
                                }))
                              }
                              removeLabel={`Remove ${section.label} entry`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-3 lg:col-span-4">
              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Appearance
                </div>
                <input
                  ref={appearanceImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAppearanceImageChange}
                  className="hidden"
                />
                <div className="mt-2 rounded-lg border border-purple-900/60 bg-[#0f0a1c] p-2">
                  {sheetData.appearanceImage ? (
                    <img
                      src={sheetData.appearanceImage}
                      alt="Character appearance"
                      className="block h-auto w-full rounded-md border border-purple-900/60"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-purple-900/60 text-xs uppercase tracking-[0.14em] text-purple-300/80">
                      No image selected
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => appearanceImageInputRef.current?.click()}
                      className="flex-1 rounded-md border border-purple-900/60 bg-[#140d24] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-400"
                    >
                      {sheetData.appearanceImage ? "Change Image" : "Add Image"}
                    </button>
                    {sheetData.appearanceImage ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSheetData((prev) => ({
                            ...prev,
                            appearanceImage: "",
                          }))
                        }
                        className="rounded-md border border-purple-900/60 bg-[#140d24] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:border-red-300"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
                <textarea
                  rows={6}
                  ref={(element) => autoSizeTextarea(element)}
                  onInput={(event) => autoSizeTextarea(event.currentTarget)}
                  value={sheetData.appearance}
                  onChange={(event) =>
                    setSheetData((prev) => ({ ...prev, appearance: event.target.value }))
                  }
                  className="mt-2 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Backstory & Personality
                </div>
                <textarea
                  rows={8}
                  ref={(element) => autoSizeTextarea(element)}
                  onInput={(event) => autoSizeTextarea(event.currentTarget)}
                  value={sheetData.backstoryPersonality}
                  onChange={(event) =>
                    setSheetData((prev) => ({
                      ...prev,
                      backstoryPersonality: event.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
                />
                <div className="mt-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                    Alignment
                  </div>
                  <input
                    value={sheetData.alignment}
                    onChange={handleChange("alignment")}
                    className="mt-1 w-full rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Languages
                </div>
                <textarea
                  rows={3}
                  ref={(element) => autoSizeTextarea(element)}
                  onInput={(event) => autoSizeTextarea(event.currentTarget)}
                  value={sheetData.languages}
                  onChange={(event) =>
                    setSheetData((prev) => ({ ...prev, languages: event.target.value }))
                  }
                  className="mt-2 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Equipment
                </div>
                <textarea
                  rows={6}
                  ref={(element) => autoSizeTextarea(element)}
                  onInput={(event) => autoSizeTextarea(event.currentTarget)}
                  value={sheetData.equipment}
                  onChange={(event) =>
                    setSheetData((prev) => ({ ...prev, equipment: event.target.value }))
                  }
                  className="mt-2 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-sm text-slate-100"
                />
                <div className="mt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-200">
                    Magic Item Attunement
                  </div>
                  <div className="mt-2 space-y-2">
                    {sheetData.magicItemAttunement.map((value: string, index: number) => (
                      <div key={`attune-${index}`} className="flex items-start gap-2">
                        <input
                          value={value}
                          onChange={(event) =>
                            updateModularItem("magicItemAttunement", index, event.target.value)
                          }
                          className="w-full rounded-md border border-purple-900/60 bg-[#0f0a1c] px-2 py-1.5 text-sm text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeModularItem("magicItemAttunement", index)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-900/60 bg-[#0f0a1c] text-sm font-semibold text-red-300 transition hover:border-red-300"
                          aria-label="Remove attunement slot"
                        >
                          −
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addModularItem("magicItemAttunement")}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-[#0f0a1c] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-400"
                    >
                      <span className="text-sm">+</span>
                      Add Attunement Slot
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/60 bg-[#1f1635] p-2">
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                  Coins
                </div>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {[
                    { key: "coinCp", label: "CP" },
                    { key: "coinSp", label: "SP" },
                    { key: "coinEp", label: "EP" },
                    { key: "coinGp", label: "GP" },
                    { key: "coinPp", label: "PP" },
                  ].map((coin) => (
                    <div key={coin.key}>
                      <div className="text-center text-[9px] font-semibold uppercase tracking-wide text-purple-300/80">
                        {coin.label}
                      </div>
                      <input
                        value={sheetData[coin.key as keyof SheetData] as string}
                        onChange={(event) =>
                          setSheetData((prev) => ({
                            ...prev,
                            [coin.key]: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-purple-900/60 bg-[#0f0a1c] px-1.5 py-1 text-center text-xs text-slate-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
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

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 hidden h-12 w-12 items-center justify-center rounded-full border border-purple-400/60 bg-[#1f1635]/90 text-xl text-purple-100 shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition hover:border-purple-300 hover:bg-[#2d224d] lg:flex"
          aria-label="Back to top"
          title="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}

      {/* Mobile Tab Menu */}
      <div className="lg:hidden">
        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setIsTabMenuOpen((open) => !open)}
          aria-label={isTabMenuOpen ? "Close section menu" : "Open section menu"}
          aria-expanded={isTabMenuOpen}
          className={`fixed top-4 right-4 z-70 flex h-12 w-12 items-center justify-center rounded-full border bg-[#1f1635]/90 text-purple-100 shadow-[0_8px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors ${
            isTabMenuOpen
              ? "border-purple-400/80"
              : "border-purple-900/60 hover:border-purple-300 hover:bg-[#2d224d]"
          }`}
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isTabMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
                isTabMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                isTabMenuOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        {/* Backdrop */}
        <div
          onClick={() => setIsTabMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-60 bg-[#0a0612]/70 backdrop-blur-sm transition-opacity duration-300 ${
            isTabMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* Sliding panel */}
        <div
          className={`fixed right-0 top-0 z-65 h-full w-72 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTabMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="relative h-full border-l border-purple-900/60 bg-linear-to-b from-[#161029] to-[#0f0a1c] px-5 pt-20 shadow-[-14px_0_36px_rgba(0,0,0,0.5)]">
            <p
              className={`mb-7 text-center text-xs uppercase tracking-[0.3em] text-purple-300/80 ${titleFont.className}`}
            >
              Sections
            </p>
            <div className="relative mx-auto w-full max-w-[16rem]">
              {/* Hanging rod */}
              <div className="absolute -top-1.5 left-0 right-0 h-1.5 rounded-full bg-linear-to-r from-purple-900 via-purple-400 to-purple-900 shadow-[0_2px_8px_rgba(0,0,0,0.55)]" />
              <div className="absolute -top-2 -left-1 h-3.5 w-3.5 rounded-full border border-purple-700 bg-[#0f0a1c]" />
              <div className="absolute -top-2 -right-1 h-3.5 w-3.5 rounded-full border border-purple-700 bg-[#0f0a1c]" />
              {/* Hanging flags */}
              <div className="flex items-start justify-between gap-1.5 pt-1">
                {mobileTabs.map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        setIsTabMenuOpen(false);
                      }}
                      style={{
                        clipPath:
                          "polygon(0% 0%, 100% 0%, 100% 86%, 50% 100%, 0% 86%)",
                        animationDelay: `${index * 90 + 140}ms`,
                      }}
                      className={`group relative flex h-40 flex-1 flex-col items-center gap-2 border pt-4 transition-colors duration-300 ${
                        isTabMenuOpen ? "flag-hang" : "opacity-0"
                      } ${
                        isActive
                          ? "border-purple-400/80 bg-linear-to-b from-purple-600/55 to-purple-800/30 text-white shadow-[0_6px_20px_rgba(147,51,234,0.35)]"
                          : "border-purple-900/70 bg-linear-to-b from-[#1f1635] to-[#160f29] text-purple-300 hover:from-[#2d224d] hover:text-purple-100"
                      }`}
                      title={tab.label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Ring fastening the flag to the rod */}
                      <span
                        className={`absolute -top-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border bg-[#0f0a1c] ${
                          isActive ? "border-purple-300" : "border-purple-600"
                        }`}
                      />
                      <span className="[&_svg]:h-5 [&_svg]:w-5">{tab.icon}</span>
                      <span className="text-center text-[0.55rem] font-semibold uppercase tracking-[0.08em]">
                        {tab.label}
                      </span>
                      {isActive && (
                        <span className="mt-auto mb-3 h-1.5 w-1.5 rounded-full bg-purple-200 shadow-[0_0_8px_rgba(216,180,254,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mx-auto mt-8 flex w-full max-w-[16rem] flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTabMenuOpen(false);
                  handleShortRest();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-linear-to-b from-[#1f1635] to-[#160f29] px-3 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-400 hover:text-amber-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                Short Rest
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTabMenuOpen(false);
                  handleLongRest();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-indigo-400/50 bg-linear-to-b from-[#1f1635] to-[#160f29] px-3 py-2.5 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-indigo-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                Long Rest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
