"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PALETTES, type PaletteId } from "./palettes";

type ConfigTab = "appearance";

export default function ConfigMenu({
  open,
  onClose,
  palette,
  onPaletteChange,
}: {
  open: boolean;
  onClose: () => void;
  palette: PaletteId;
  onPaletteChange: (next: PaletteId) => void;
}) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("appearance");

  const tabs: { key: ConfigTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "appearance",
      label: "Appearance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-sheet-7/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-purple-900/60 bg-sheet-1 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-900/60 bg-sheet-2 px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
                Settings
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-purple-200 transition hover:border-purple-400 hover:text-purple-100"
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              {/* Tab rail */}
              <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-purple-900/40 bg-sheet-1 p-2 sm:w-44 sm:flex-col sm:overflow-x-visible sm:border-b-0 sm:border-r">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                        isActive
                          ? "bg-purple-500/15 text-purple-100 ring-1 ring-purple-500/40"
                          : "text-purple-300/80 hover:bg-sheet-2 hover:text-purple-100"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="shrink-0">{tab.icon}</span>
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Content */}
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {activeTab === "appearance" && (
                  <section>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-300/80">
                      Color
                    </h3>
                    <p className="mt-1 text-xs text-purple-200/70">
                      Choose a palette for your sheet. Saved with your character.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {PALETTES.map((option) => {
                        const isSelected = palette === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onPaletteChange(option.id)}
                            aria-pressed={isSelected}
                            className={`group relative flex flex-col gap-2 rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? "border-purple-400 bg-purple-500/10 ring-1 ring-purple-400/60"
                                : "border-purple-900/60 bg-sheet-0 hover:border-purple-500"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex overflow-hidden rounded-md border border-black/20 shadow-sm">
                                {option.swatches.map((color, index) => (
                                  <span
                                    key={index}
                                    className="h-6 w-6"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </span>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-400 text-slate-950">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-100">
                                {option.name}
                              </p>
                              <p className="mt-0.5 text-[11px] leading-snug text-purple-200/70">
                                {option.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
