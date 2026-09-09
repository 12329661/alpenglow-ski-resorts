"use client";

import { useEffect } from "react";

/**
 * Smoothly scrolls to in-page `#hash` targets on click. Done in JS with a
 * manual rAF tween because (a) a global CSS `scroll-behavior: smooth` stops the
 * Next App Router from scrolling to hash links at all, and (b) native
 * `behavior: "smooth"` is unreliable in some environments.
 */
export function SmoothHashScroll() {
  useEffect(() => {
    function targetTop(el: HTMLElement) {
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      return el.getBoundingClientRect().top + window.scrollY - margin;
    }

    function scrollToEl(el: HTMLElement) {
      const to = Math.max(
        0,
        Math.min(
          targetTop(el),
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      );
      const from = window.scrollY;
      const distance = to - from;
      if (Math.abs(distance) < 2) return;

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, to);
        return;
      }

      const duration = Math.min(650, Math.max(280, Math.abs(distance) * 0.35));
      const ease = (x: number) => 1 - Math.pow(1 - x, 3);
      let start: number | null = null;

      function step(now: number) {
        if (start === null) start = now;
        const p = Math.min(1, (now - start) / duration);
        window.scrollTo(0, from + distance * ease(p));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const raw = anchor.getAttribute("href")?.slice(1) ?? "";
      const id = decodeURIComponent(raw);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;

      event.preventDefault();
      scrollToEl(el);
      history.pushState(null, "", `#${id}`);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
