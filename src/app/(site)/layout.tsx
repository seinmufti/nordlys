import { PhoneShell } from "@/components/phone-shell";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <PhoneShell>{children}</PhoneShell>;
}
