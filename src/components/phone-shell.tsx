import type { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="phone-stage">
      <div className="phone-device">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
