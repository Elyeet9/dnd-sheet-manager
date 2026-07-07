// Color palettes for the sheet. Each `id` matches a `[data-palette="…"]` scope
// in globals.css that retints the Tailwind color variables. `amethyst` is the
// default and carries no CSS overrides. `swatches` are representative colors
// (accent, card, deep background, muted) used only to preview the palette in the
// appearance settings — the real theming lives in the stylesheet.

export type PaletteId = "amethyst" | "nature" | "parchment" | "dragon";

export type Palette = {
  id: PaletteId;
  name: string;
  description: string;
  swatches: [string, string, string, string];
};

export const PALETTES: Palette[] = [
  {
    id: "amethyst",
    name: "Amethyst Night",
    description: "Arcane violet on deep midnight — the original look.",
    swatches: ["#c084fc", "#1f1635", "#0f0a1c", "#7e22ce"],
  },
  {
    id: "nature",
    name: "Nature Green",
    description: "Pastel greens over a deep forest ground.",
    swatches: ["#4ade80", "#17281c", "#0b130d", "#166534"],
  },
  {
    id: "parchment",
    name: "Scholar Parchment",
    description: "Earthy inks on aged paper. A light palette.",
    swatches: ["#8a5a2c", "#f4ead2", "#e7d9b8", "#5a4527"],
  },
  {
    id: "dragon",
    name: "Dragon Executive",
    description: "Monochromatic graphite and brushed steel.",
    swatches: ["#c4c4cc", "#1d1d20", "#0c0c0e", "#5b5b64"],
  },
];

export const DEFAULT_PALETTE: PaletteId = "amethyst";

export function isPaletteId(value: unknown): value is PaletteId {
  return (
    typeof value === "string" &&
    PALETTES.some((palette) => palette.id === value)
  );
}
