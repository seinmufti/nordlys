"use client";

import { useEffect } from "react";

export function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigation?.type === "reload";

    if (isReload) {
      window.scrollTo(0, 0);

      if (window.location.hash && window.location.hash !== "#top") {
        history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  return null;
}
