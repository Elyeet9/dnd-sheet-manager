"use client";

import { AnimatePresence, motion } from "motion/react";

// Deterministic ember field — fixed values so the server and client render the
// same markup (no hydration mismatch from Math.random()).
const EMBERS = [
  { left: 8, size: 3, delay: 0, duration: 6.5 },
  { left: 18, size: 2, delay: 1.4, duration: 7.8 },
  { left: 27, size: 4, delay: 0.6, duration: 6.0 },
  { left: 36, size: 2, delay: 2.2, duration: 8.4 },
  { left: 45, size: 3, delay: 1.0, duration: 7.0 },
  { left: 54, size: 2, delay: 3.0, duration: 6.8 },
  { left: 62, size: 4, delay: 0.3, duration: 8.0 },
  { left: 71, size: 3, delay: 2.6, duration: 6.3 },
  { left: 80, size: 2, delay: 1.8, duration: 7.5 },
  { left: 88, size: 3, delay: 0.9, duration: 6.9 },
  { left: 94, size: 2, delay: 2.9, duration: 8.2 },
  { left: 13, size: 2, delay: 3.4, duration: 7.2 },
];

const RUNE_DIAMONDS = Array.from({ length: 8 });

export default function LoadingScreen({
  status,
  fontClassName = "",
}: {
  status: string;
  fontClassName?: string;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-120 flex flex-col items-center justify-center overflow-hidden bg-[#140d24]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Arcane vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(126,34,206,0.28),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(30,64,175,0.18),transparent_55%)]" />

      {/* Drifting embers */}
      <div className="pointer-events-none absolute inset-0">
        {EMBERS.map((ember, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-amber-300/70 [box-shadow:0_0_8px_rgba(251,191,36,0.7)]"
            style={{
              left: `${ember.left}%`,
              bottom: "-6%",
              width: ember.size,
              height: ember.size,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: ["0vh", "-108vh"],
              opacity: [0, 0.9, 0.9, 0],
              x: [0, index % 2 === 0 ? 18 : -18, 0],
            }}
            transition={{
              duration: ember.duration,
              delay: ember.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Emblem: a rotating rune circle around a pulsing arcane gem */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* soft core glow */}
        <motion.div
          className="absolute h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* outer runic ring */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute h-44 w-44"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1.5"
            strokeDasharray="2 10"
          />
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="rgba(216,180,254,0.55)"
            strokeWidth="2"
            strokeDasharray="26 18"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* inner counter-rotating ring */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute h-32 w-32"
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="rgba(129,140,248,0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 14"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* orbiting rune diamonds */}
        <motion.div
          className="absolute h-44 w-44"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {RUNE_DIAMONDS.map((_, index) => (
            <motion.span
              key={index}
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border border-purple-300/70 bg-purple-400/40"
              style={{
                transform: `rotate(${index * 45}deg) translateY(-84px) rotate(45deg)`,
                transformOrigin: "center",
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: index * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* central pulsing gem */}
        <motion.div
          className="relative h-12 w-12 rotate-45 rounded-md border border-purple-200/70 bg-linear-to-br from-purple-300 via-purple-500 to-indigo-700"
          animate={{
            scale: [1, 1.12, 1],
            boxShadow: [
              "0 0 12px rgba(168,85,247,0.5)",
              "0 0 26px rgba(192,132,252,0.85)",
              "0 0 12px rgba(168,85,247,0.5)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="absolute inset-1 rounded-sm bg-linear-to-tl from-white/50 to-transparent" />
        </motion.div>
      </div>

      {/* Title */}
      <h1
        className={`mt-9 text-center text-2xl font-semibold tracking-[0.14em] text-purple-100 sm:text-3xl ${fontClassName}`}
      >
        DnD 2024 Sheet
      </h1>
      <div className="mt-2 h-px w-40 bg-linear-to-r from-transparent via-purple-400/70 to-transparent" />

      {/* Status line (crossfades between phases) */}
      <div className="mt-4 flex h-6 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            className="text-center text-sm text-purple-200/85"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Shimmering progress bar */}
      <div className="mt-5 h-1 w-52 overflow-hidden rounded-full bg-purple-950/70">
        <motion.div
          className="h-full w-1/3 rounded-full bg-linear-to-r from-transparent via-purple-400 to-transparent"
          animate={{ x: ["-140%", "440%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
