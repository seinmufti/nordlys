"use client";

import { useLayoutEffect, useState } from "react";

type HostedAppFrameProps = {
  src: string;
  title: string;
  allow: string;
};

export function HostedAppFrame({ src, title, allow }: HostedAppFrameProps) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const sync = () => {
      setBox({
        width: Math.round(document.documentElement.clientWidth),
        height: Math.round(document.documentElement.clientHeight),
      });
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  if (!box) {
    return <div className="hosted-app-frame" aria-hidden />;
  }

  return (
    <iframe
      src={src}
      title={title}
      className="hosted-app-frame"
      allow={allow}
      width={box.width}
      height={box.height}
      style={{ width: box.width, height: box.height }}
    />
  );
}
