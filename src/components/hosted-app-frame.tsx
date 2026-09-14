"use client";

import { useEffect, useRef } from "react";

type HostedAppFrameProps = {
  src: string;
  title: string;
  allow: string;
};

export function HostedAppFrame({ src, title, allow }: HostedAppFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("hosted-route");
    document.body.classList.add("hosted-route");

    const syncFrameSize = () => {
      const frame = frameRef.current;
      if (!frame) return;

      const viewport = window.visualViewport;
      const width = Math.round(viewport?.width ?? window.innerWidth);
      const height = Math.round(viewport?.height ?? window.innerHeight);
      const offsetTop = Math.round(viewport?.offsetTop ?? 0);
      const offsetLeft = Math.round(viewport?.offsetLeft ?? 0);

      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
      frame.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    };

    syncFrameSize();

    window.visualViewport?.addEventListener("resize", syncFrameSize);
    window.visualViewport?.addEventListener("scroll", syncFrameSize);
    window.addEventListener("resize", syncFrameSize);
    window.addEventListener("orientationchange", syncFrameSize);

    return () => {
      document.documentElement.classList.remove("hosted-route");
      document.body.classList.remove("hosted-route");
      window.visualViewport?.removeEventListener("resize", syncFrameSize);
      window.visualViewport?.removeEventListener("scroll", syncFrameSize);
      window.removeEventListener("resize", syncFrameSize);
      window.removeEventListener("orientationchange", syncFrameSize);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={src}
      title={title}
      className="hosted-app-frame"
      allow={allow}
    />
  );
}
