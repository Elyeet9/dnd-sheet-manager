"use client";

import { useEffect, useRef, useState } from "react";
import { motion, Reorder, useDragControls } from "motion/react";

type Row = { id: number; text: string };

// Fluid, symmetric motion for the live reorder + drop settle (position only).
const layoutTransition = {
  type: "spring" as const,
  stiffness: 650,
  damping: 38,
  mass: 0.6,
};

// Tactile, slightly bouncy motion for the pickup "pop" and the drop "click".
const snappyTransition = {
  type: "spring" as const,
  stiffness: 900,
  damping: 20,
};

// Same two-layer structure so the shadow interpolates cleanly in and out — the
// resting value is fully transparent so the drag outline never lingers.
const restingShadow =
  "0 0px 0px rgba(0,0,0,0), 0 0 0 0px rgba(192,132,252,0)";
const dragShadow =
  "0 12px 26px rgba(0,0,0,0.55), 0 0 0 1px rgba(192,132,252,0.7)";

function GripIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function SortableRow({
  row,
  animateIn,
  onTextChange,
  onRemove,
  onSettle,
  removeLabel,
}: {
  row: Row;
  animateIn: boolean;
  onTextChange: (id: number, text: string) => void;
  onRemove: (id: number) => void;
  onSettle: () => void;
  removeLabel: string;
}) {
  const controls = useDragControls();

  return (
    // The Reorder.Item owns layout + drag projection, so its box stays "clean"
    // (no scale transform) — scaling a projected element distorts sibling layout
    // math and makes them vanish on fast drags. The pop/shadow live on the inner
    // wrapper, driven by gesture-variant propagation (no React re-render).
    <Reorder.Item
      value={row.id}
      as="div"
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={{ layout: layoutTransition, default: layoutTransition }}
      initial={animateIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      whileDrag="dragging"
      onDragEnd={() => onSettle()}
      style={{ position: "relative" }}
      className="rounded-md"
    >
      <motion.div
        variants={{
          rest: { scale: 1, boxShadow: restingShadow, zIndex: 0 },
          dragging: { scale: 1.05, boxShadow: dragShadow, zIndex: 30 },
        }}
        initial="rest"
        animate="rest"
        transition={{ scale: snappyTransition, boxShadow: snappyTransition }}
        style={{ position: "relative" }}
        className="flex items-start gap-1.5 rounded-md"
      >
        <button
          type="button"
          onPointerDown={(event) => controls.start(event)}
          className="mt-0.5 flex h-6 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-purple-300/70 transition-colors hover:text-purple-200 active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripIcon />
        </button>
        <textarea
          rows={1}
          value={row.text}
          onChange={(event) => onTextChange(row.id, event.target.value)}
          className="w-full resize-none rounded-md border border-purple-900/60 bg-sheet-0 px-2 py-1.5 text-xs text-slate-100"
        />
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-xs font-semibold text-red-300 transition hover:border-red-300"
          aria-label={removeLabel}
        >
          −
        </button>
      </motion.div>
    </Reorder.Item>
  );
}

export default function SortableSpellList({
  values,
  onChange,
  addLabel = "Add Spell",
  removeLabel = "Remove entry",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  addLabel?: string;
  removeLabel?: string;
}) {
  const counter = useRef(0);
  const makeRows = (texts: string[]): Row[] =>
    texts.map((text) => ({ id: counter.current++, text }));

  const [rows, setRows] = useState<Row[]>(() => makeRows(values));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Skip the entrance animation on the very first render (avoids an SSR/hydration
  // flash); rows added later still pop in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resync when the parent replaces the list from outside (load JSON / reset).
  // Local edits/reorders keep parent and rows in step, so this is a no-op for them.
  useEffect(() => {
    const local = rowsRef.current.map((row) => row.text);
    const same =
      local.length === values.length &&
      local.every((text, index) => text === values[index]);
    if (!same) {
      setRows(makeRows(values));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const emit = (next: Row[]) => onChange(next.map((row) => row.text));

  const handleTextChange = (id: number, text: string) => {
    const next = rowsRef.current.map((row) =>
      row.id === id ? { ...row, text } : row,
    );
    setRows(next);
    emit(next);
  };

  const handleRemove = (id: number) => {
    const next = rowsRef.current.filter((row) => row.id !== id);
    setRows(next);
    emit(next);
  };

  const handleAdd = () => {
    const next = [...rowsRef.current, { id: counter.current++, text: "" }];
    setRows(next);
    emit(next);
  };

  // Reorder live for fluid preview; commit to the parent only once the drag
  // settles to avoid thrashing shared state mid-drag.
  const handleReorder = (newOrder: number[]) => {
    const byId = new Map(rowsRef.current.map((row) => [row.id, row]));
    const next = newOrder
      .map((id) => byId.get(id))
      .filter((row): row is Row => Boolean(row));
    setRows(next);
  };

  const handleSettle = () => emit(rowsRef.current);

  return (
    <div className="mt-2 space-y-2">
      <Reorder.Group
        as="div"
        axis="y"
        values={rows.map((row) => row.id)}
        onReorder={handleReorder}
        className="flex flex-col gap-2"
      >
        {rows.map((row) => (
          <SortableRow
            key={row.id}
            row={row}
            animateIn={mounted}
            onTextChange={handleTextChange}
            onRemove={handleRemove}
            onSettle={handleSettle}
            removeLabel={removeLabel}
          />
        ))}
      </Reorder.Group>
      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-purple-900/60 bg-sheet-0 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-400"
      >
        <span className="text-sm leading-none">+</span>
        {addLabel}
      </button>
    </div>
  );
}
