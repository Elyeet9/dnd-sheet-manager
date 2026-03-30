# DnD 2024 Sheet Manager

A modern, dark-themed D&D 2024 character sheet built in Next.js. It covers core character info, combat stats, skills, weapons, class features, species traits, feats, and equipment training/proficiencies. The sheet saves locally, exports to JSON, and can load JSON via file picker or drag-and-drop with confirmation and validation.

## Features

- Core info, level/XP, AC/shield, HP, hit dice, death saves
- Ability blocks with saving throws, skills, proficiency/expertise toggles
- Initiative, speed, size, passive perception
- Weapons & cantrips with modular rows
- Class features (two columns), species traits, feats (modular blocks)
- Equipment training & proficiencies
- Local cache + JSON export/import
- New character reset with confirmation

## Getting Started

```bash
npm run dev
```

Open http://localhost:3000

## Pending Work

- Spell sheet
- Additional info sheet

I believe the current spell block of the 2024 sheet is trash, and I'm trying to make something closer to the Roll20 sheet experience.
