import { HostedViewportSync } from "@/components/hosted-viewport-sync";

export default function HostedAppLayout({
  children,
}: LayoutProps<"/[slug]">) {
  return (
    <div className="hosted-app-shell">
      <HostedViewportSync />
      {children}
    </div>
  );
}
