import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";
import { PhoneShell } from "@/components/phone-shell";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteDescription =
  "Nordlys Solutions builds fast, polished web apps and landing pages — from CAD tools and booking apps to invoicing and clinic sites.";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "Nordlys Solutions",
  description: siteDescription,
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Nordlys Solutions",
    title: "Nordlys Solutions",
    description: siteDescription,
    images: [{ url: "/aurora-cover.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nordlys Solutions",
    description: siteDescription,
    images: ["/aurora-cover.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030308",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${instrument.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="bg-background text-foreground">
        <PhoneShell>{children}</PhoneShell>
      </body>
    </html>
  );
}
