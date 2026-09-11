"use client";

import { useEffect, type ReactNode } from "react";
import { scrollToHash } from "@/lib/in-app-scroll";

export function PhoneShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleClick = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const hash = link.getAttribute("href");
      if (!hash) return;

      event.preventDefault();
      scrollToHash(hash);
      history.pushState(null, "", hash);
    };

    const syncHashScroll = () => {
      scrollToHash(window.location.hash || "#top", "auto");
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      syncHashScroll();
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("hashchange", syncHashScroll);
    window.addEventListener("pageshow", handlePageShow);

    if (window.location.hash) {
      requestAnimationFrame(syncHashScroll);
    }

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", syncHashScroll);
      window.removeEventListener("pageshow", handlePageShow);
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
