"use client";

import { useEffect, type ReactNode } from "react";
import { scrollToHash } from "@/lib/in-app-scroll";

export function PhoneShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const container = document.querySelector(".phone-screen");
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const hash = link.getAttribute("href");
      if (!hash) return;

      event.preventDefault();
      scrollToHash(hash);
      history.pushState(null, "", hash);
    };

    const handleHashChange = () => {
      scrollToHash(window.location.hash || "#top", "auto");
    };

    container.addEventListener("click", handleClick);
    window.addEventListener("hashchange", handleHashChange);

    if (window.location.hash) {
      requestAnimationFrame(() => {
        scrollToHash(window.location.hash, "auto");
      });
    }

    return () => {
      container.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="phone-stage">
      <div className="phone-device">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
