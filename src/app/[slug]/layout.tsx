export default function HostedAppLayout({
  children,
}: LayoutProps<"/[slug]">) {
  return <div className="hosted-app-shell">{children}</div>;
}
