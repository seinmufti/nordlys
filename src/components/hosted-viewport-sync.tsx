"use client";

import { useLayoutEffect } from "react";

/** Keep the hosted-route layout viewport on the phone's screen width. */
export function HostedViewportSync() {
  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const width = Math.round(window.screen.width || 0);
    if (!meta || width <= 0) return;
    meta.setAttribute(
      "content",
      `width=${width}, initial-scale=1, maximum-scale=1, viewport-fit=cover`,
    );
  }, []);

  return null;
}
