"use client";

import { useEffect, useRef } from "react";

type HostedAppFrameProps = {
  src: string;
  title: string;
  allow: string;
};

function postParentMetrics(data: Record<string, unknown>) {
  const body = JSON.stringify({
    sessionId: "ab1c2d",
    runId: "revert-h10",
    hypothesisId: "H10",
    location: "hosted-app-frame.tsx:measure",
    message: "parent vs iframe box after revert",
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

  useEffect(() => {
    const iframe = ref.current;
    const rect = iframe?.getBoundingClientRect();
    const vis = window.visualViewport;
    postParentMetrics({
      src,
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
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className="hosted-app-frame"
      allow={allow}
    />
  );
}
