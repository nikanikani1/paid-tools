"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds `.is-visible` to `[data-reveal]` elements, including after client-side
 * navigation. The layout persists across route changes, so a one-shot query on
 * mount leaves the next page's cards unobserved (they stay opacity:0). We re-run
 * on pathname changes and watch for streamed/late-mounted nodes.
 *
 * A passive scroll/resize fallback also reveals anything at/above the viewport,
 * so fast scrolls and restored positions cannot leave a blank section.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const seen = new WeakSet<HTMLElement>();
    let nodes: HTMLElement[] = [];

    const collect = () => {
      nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      return nodes;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      collect().forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const revealPassed = () => {
      const limit = window.innerHeight * 0.95;
      for (const node of nodes) {
        if (node.classList.contains("is-visible")) continue;
        const rect = node.getBoundingClientRect();
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

    const observe = (node: HTMLElement) => {
      if (seen.has(node)) return;
      seen.add(node);
      io.observe(node);
    };

    collect().forEach(observe);

    const mo = new MutationObserver(() => {
      const fresh = collect().filter((n) => !seen.has(n));
      if (fresh.length) {
        fresh.forEach(observe);
        revealPassed();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

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
      mo.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pageshow", revealPassed);
    };
  }, [pathname]);

  return null;
}
