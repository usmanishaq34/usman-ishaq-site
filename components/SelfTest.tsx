"use client";

import { useEffect } from "react";

/* The self-check on a service page: a list of statements with checkboxes and
   a count. Ticking boxes updates the "N of M" figure and the line under it. */
export default function SelfTest() {
  useEffect(() => {
    const boxes = document.querySelectorAll<HTMLElement>(".selftest");
    const cleanups: Array<() => void> = [];
    boxes.forEach((box) => {
      const inputs = Array.from(box.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      const count = box.querySelector<HTMLElement>("[data-st-count]");
      const verdict = box.querySelector<HTMLElement>("[data-st-verdict]");
      const initial = verdict?.textContent ?? "";
      const update = () => {
        const n = inputs.filter((i) => i.checked).length;
        if (count) count.textContent = `${n} of ${inputs.length}`;
        if (verdict) {
          verdict.textContent =
            n === 0 ? initial : n <= 2 ? "One or two signs. Bring them to the call." : "Several structural signs. The audit goes through each one, page by page.";
        }
      };
      box.addEventListener("change", update);
      cleanups.push(() => box.removeEventListener("change", update));
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
