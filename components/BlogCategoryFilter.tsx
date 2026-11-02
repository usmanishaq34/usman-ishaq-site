"use client";

import { useEffect } from "react";

/* The blog index category pills: clicking a pill shows only the cards whose
   data-cat matches. */
export default function BlogCategoryFilter() {
  useEffect(() => {
    const pills = Array.from(document.querySelectorAll<HTMLButtonElement>(".dv-blog-cat-pill"));
    const cards = () => Array.from(document.querySelectorAll<HTMLElement>(".dv-blog-card"));
    const handlers = pills.map((btn) => {
      const onClick = () => {
        pills.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.getAttribute("data-cat");
        cards().forEach((card) => {
          card.style.display = cat === "all" || card.getAttribute("data-cat") === cat ? "" : "none";
        });
      };
      btn.addEventListener("click", onClick);
      return () => btn.removeEventListener("click", onClick);
    });
    return () => handlers.forEach((off) => off());
  }, []);
  return null;
}
