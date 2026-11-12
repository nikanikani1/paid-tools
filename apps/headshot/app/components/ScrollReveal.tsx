"use client";

import { useEffect } from "react";

/**
 * Adds `.is-visible` to `[data-reveal]` elements.
 *
 * The observer alone is not enough: a fast scroll / anchor jump / restored scroll
 * position can skip a whole element past the viewport, leaving it invisible forever.
 * A passive scroll/resize fallback reveals anything at or above the viewport.
 */
export function ScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const revealPassed = () => {
      const limit = window.innerHeight * 0.95;
      for (const node of nodes) {
        if (node.classList.contains("is-visible")) continue;
        const rect = node.getBoundingClientRect();
        // Anything already at/above the viewport (including sections skipped by a jump).
        if (rect.top < limit) node.classList.add("is-visible");
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    nodes.forEach((n) => io.observe(n));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        revealPassed();
      });
    };
    revealPassed();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pageshow", revealPassed);
    return () => {
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pageshow", revealPassed);
    };
  }, []);
  return null;
}
