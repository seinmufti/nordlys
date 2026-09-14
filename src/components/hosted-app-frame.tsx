"use client";

import { useLayoutEffect, useRef, useState } from "react";

type HostedAppFrameProps = {
  src: string;
  title: string;
  allow: string;
};

function postParentMetrics(data: Record<string, unknown>) {
  const body = JSON.stringify({
    sessionId: "ab1c2d",
    runId: "post-fix-2",
    hypothesisId: "H10",
    location: "hosted-app-frame.tsx:measure",
    message: "iframe box from screen.width",
    data,
    timestamp: Date.now(),
  });
  const hosts = ["127.0.0.1"];
  if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
    hosts.push(window.location.hostname);
  }
  for (const host of hosts) {
    // #region agent log
    fetch(`http://${host}:7630/ingest/ae5d1050-abb6-4ada-8e3d-864185adc2a6`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ab1c2d",
      },
      body,
    }).catch(() => {});
    // #endregion
  }
}

export function HostedAppFrame({ src, title, allow }: HostedAppFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const sync = () => {
      const next = {
        width: Math.round(window.screen.width),
        height: Math.round(
          window.visualViewport?.height ?? window.innerHeight,
        ),
      };
      setBox(next);
      const iframe = ref.current;
      const rect = iframe?.getBoundingClientRect();
      const vis = window.visualViewport;
      postParentMetrics({
        src,
        box: `${next.width}x${next.height}`,
        parentInner: `${window.innerWidth}x${window.innerHeight}`,
        parentClient: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        parentVis: vis
          ? `${Math.round(vis.width)}x${Math.round(vis.height)} s=${vis.scale}`
          : null,
        screen: `${window.screen.width}x${window.screen.height}`,
        iframeRect: rect
          ? `${Math.round(rect.width)}x${Math.round(rect.height)}`
          : null,
      });
    };

    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, [src]);

  if (!box) {
    return <div className="hosted-app-frame" aria-hidden />;
  }

  return (
    <iframe
      ref={ref}
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
