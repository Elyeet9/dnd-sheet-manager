"use client";

import { useEffect, useRef } from "react";

export type NotePage = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

// Duration of the horizontal scroll between pages. The wrapper height eases
// over the same window so a taller/shorter page settles with the slide — and
// only then, never while the user is typing into the active page.
const SLIDE_MS = 420;

// Timestamps only ever render on the client (the sheet hydrates from
// localStorage after mount), so locale-dependent formatting is safe here.
const formatFull = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCompact = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

// Grow the box to fit its text, with no ceiling. A hidden textarea reports a
// scrollHeight of 0, so leave it on `auto` and re-measure once it is on screen.
const autoSize = (element: HTMLTextAreaElement | null) => {
  if (!element) return;
  element.style.height = "auto";
  if (element.scrollHeight === 0) return;
  // scrollHeight leaves the border out while a border-box height counts it in,
  // so without this the last line stays clipped by the border width.
  const style = window.getComputedStyle(element);
  const borders =
    Number.parseFloat(style.borderTopWidth) +
    Number.parseFloat(style.borderBottomWidth);
  element.style.height = `${element.scrollHeight + borders}px`;
};

export default function NotesTab({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onUpdatePage,
  onRemovePage,
}: {
  pages: NotePage[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onUpdatePage: (id: string, patch: { title?: string; content?: string }) => void;
  onRemovePage: (id: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());
  const slideRefs = useRef(new Map<string, HTMLDivElement>());
  const textareaRefs = useRef(new Map<string, HTMLTextAreaElement>());
  const activeIdRef = useRef(activePageId);
  const isSlidingRef = useRef(false);
  const settleRef = useRef<number | null>(null);
  const scrollerWidthRef = useRef(0);

  const activeIndex = pages.findIndex((page) => page.id === activePageId);
  const pageCount = pages.length;
  const hasPages = pageCount > 0;

  useEffect(() => {
    activeIdRef.current = activePageId;
  }, [activePageId]);

  // Jump (no animation) to the active page whenever the carousel gains or
  // changes width: opening the tab reveals it from `display: none`, where every
  // measurement was still zero, and a window resize invalidates the offsets.
  // Re-runs when the first page is created, since the carousel replaces the
  // empty state and there was no element to observe before that.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scrollerWidthRef.current = 0;
    let frame: number | undefined;

    const jumpToActive = () => {
      const slide = slideRefs.current.get(activeIdRef.current);
      if (!slide) {
        return;
      }
      scroller.style.transition = "none";
      scroller.style.height = `${slide.offsetHeight}px`;
      scroller.scrollLeft = slide.offsetLeft;
    };

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width === scrollerWidthRef.current) {
        return;
      }
      scrollerWidthRef.current = width;
      if (width === 0) {
        return;
      }
      // Textareas measure as zero-height while the tab is closed, so this is
      // the first chance to size them to their text.
      textareaRefs.current.forEach(autoSize);
      jumpToActive();
      // Snap alignment can re-target the first slide once that reflow lands;
      // re-assert the position on the next frame.
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        jumpToActive();
      });
    });
    observer.observe(scroller);
    return () => {
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
      observer.disconnect();
    };
  }, [hasPages]);

  // Scroll to the selected page, and keep the viewport exactly as tall as it is
  // — so a short page doesn't leave the empty space of a long one below it, and
  // a growing textarea pushes the bottom of the sheet down with it.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const slide = slideRefs.current.get(activePageId);
    if (!scroller || !slide) {
      return;
    }

    const syncHeight = () => {
      scroller.style.height = `${slide.offsetHeight}px`;
      // A grown textarea may have nudged the clipped viewport off the top.
      if (scroller.scrollTop !== 0) {
        scroller.scrollTop = 0;
      }
    };

    let timer: number | undefined;
    // Nothing to animate while the tab is closed: it is `display: none`, so
    // every measurement is zero and the scroll position cannot be set.
    if (scroller.clientWidth > 0) {
      isSlidingRef.current = true;
      scroller.style.transition = `height ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      scroller.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      timer = window.setTimeout(() => {
        isSlidingRef.current = false;
        // Typing must resize the viewport instantly, never on a lagging tween.
        scroller.style.transition = "none";
      }, SLIDE_MS);
    }
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(slide);
    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      observer.disconnect();
    };
  }, [activePageId, pageCount]);

  // On mobile the page list is a horizontal strip that can outrun the screen;
  // bring the selected chip along. On desktop it is a column that never
  // overflows sideways, so this does nothing there.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = chipRefs.current.get(activePageId);
    if (!strip || !chip || strip.scrollWidth <= strip.clientWidth) {
      return;
    }
    strip.scrollTo({
      left: Math.max(0, chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2),
      behavior: "smooth",
    });
  }, [activePageId, pageCount]);

  useEffect(() => {
    return () => {
      if (settleRef.current !== null) {
        window.clearTimeout(settleRef.current);
      }
    };
  }, []);

  // Swiping (touch) or trackpad-scrolling the carousel selects the page it
  // lands on. Ignored while we are the ones doing the scrolling.
  const handleScroll = () => {
    if (isSlidingRef.current) {
      return;
    }
    if (settleRef.current !== null) {
      window.clearTimeout(settleRef.current);
    }
    settleRef.current = window.setTimeout(() => {
      const scroller = scrollerRef.current;
      if (!scroller || scroller.clientWidth === 0) {
        return;
      }
      const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
      const landed = pages[Math.min(Math.max(index, 0), pages.length - 1)];
      if (landed && landed.id !== activePageId) {
        onSelectPage(landed.id);
      }
    }, 120);
  };

  const step = (delta: number) => {
    const next = pages[activeIndex + delta];
    if (next) {
      onSelectPage(next.id);
    }
  };

  return (
    <section className="grid items-start gap-3 lg:grid-cols-12">
      <aside className="min-w-0 rounded-xl border border-purple-900/60 bg-sheet-2 p-2 lg:col-span-3">
        <div className="flex items-center justify-center rounded-lg border border-purple-900/60 bg-sheet-1 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200">
            Notes
          </div>
        </div>

        {pageCount > 0 && (
          <div
            ref={stripRef}
            className="scrollbar-none relative mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-3 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {pages.map((page, index) => {
              const isActive = page.id === activePageId;
              return (
                <button
                  key={page.id}
                  ref={(element) => {
                    if (element) {
                      chipRefs.current.set(page.id, element);
                    } else {
                      chipRefs.current.delete(page.id);
                    }
                  }}
                  type="button"
                  onClick={() => onSelectPage(page.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-40 shrink-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition lg:w-full ${
                    isActive
                      ? "border-purple-400/80 bg-linear-to-b from-purple-600/45 to-purple-800/20 text-purple-100"
                      : "border-purple-900/60 bg-sheet-1 text-purple-200/80 hover:border-purple-400 hover:text-purple-100"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold ${
                      isActive
                        ? "border-purple-300 bg-sheet-0 text-purple-100"
                        : "border-purple-900/60 bg-sheet-0 text-purple-300/80"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-semibold">
                      {page.title.trim() || "Untitled page"}
                    </span>
                    <span className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-purple-300/70">
                      {formatCompact(page.updatedAt)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onAddPage}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-purple-900/60 bg-sheet-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:bg-sheet-4 lg:mt-3"
        >
          <span className="text-sm">+</span>
          Add Page
        </button>
      </aside>

      <div className="min-w-0 lg:col-span-9">
        {pageCount === 0 ? (
          <div className="rounded-xl border border-dashed border-purple-900/60 bg-sheet-2 px-4 py-10 text-center">
            <p className="text-xs text-purple-200/70">
              No pages yet. Keep session logs, NPC names, or anything else your
              character learns along the way.
            </p>
            <button
              type="button"
              onClick={onAddPage}
              className="mt-4 rounded-md border border-purple-900/60 bg-sheet-1 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200 transition hover:border-purple-400"
            >
              Create the first page
            </button>
          </div>
        ) : (
          <>
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="scrollbar-none relative snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
            >
              <div className="flex items-start">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    ref={(element) => {
                      if (element) {
                        slideRefs.current.set(page.id, element);
                      } else {
                        slideRefs.current.delete(page.id);
                      }
                    }}
                    className="w-full shrink-0 snap-start px-1"
                    aria-hidden={page.id !== activePageId}
                  >
                    <article className="rounded-xl border border-purple-900/60 bg-sheet-2 p-3 shadow-sm">
                      <div className="flex items-start gap-2">
                        <input
                          value={page.title}
                          onChange={(event) =>
                            onUpdatePage(page.id, { title: event.target.value })
                          }
                          placeholder="Untitled page"
                          className="min-w-0 flex-1 rounded-none border-b border-purple-500/60 bg-transparent px-2 py-1 text-base font-semibold text-slate-100 outline-none placeholder:text-slate-500"
                          aria-label="Page title"
                        />
                        <button
                          type="button"
                          onClick={() => onRemovePage(page.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-purple-900/60 bg-sheet-0 text-xs font-semibold text-red-300 transition hover:border-red-300"
                          aria-label={`Delete ${page.title.trim() || "untitled page"}`}
                          title="Delete page"
                        >
                          −
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-purple-300/70">
                        <span>Created {formatFull(page.createdAt)}</span>
                        <span>Edited {formatFull(page.updatedAt)}</span>
                      </div>

                      <textarea
                        ref={(element) => {
                          if (element) {
                            textareaRefs.current.set(page.id, element);
                            autoSize(element);
                          } else {
                            textareaRefs.current.delete(page.id);
                          }
                        }}
                        value={page.content}
                        onInput={(event) => autoSize(event.currentTarget)}
                        onChange={(event) =>
                          onUpdatePage(page.id, { content: event.target.value })
                        }
                        placeholder="Write anything…"
                        className="mt-3 min-h-64 w-full resize-none overflow-hidden rounded-lg border border-purple-900/60 bg-sheet-0 px-3 py-2 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500"
                      />
                    </article>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={activeIndex <= 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-purple-900/60 bg-sheet-2 text-purple-200 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                Page {Math.max(activeIndex + 1, 1)} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={activeIndex < 0 || activeIndex >= pageCount - 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-purple-900/60 bg-sheet-2 text-purple-200 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
