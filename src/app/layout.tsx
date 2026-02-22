import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import SwUpdateToast from "@/components/pwa/SwUpdateToast";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const BASE_URL = "https://substrata.world";
const DESCRIPTION =
  "Substrata lets you explore Earth across deep geological time and human history. Drag the map, travel millions of years into the past, and discover paleogeography, ancient civilisations, and hidden layers of the world.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Substrata — Explore the Hidden Layers of the World",
    template: "%s | Substrata",
  },
  description: DESCRIPTION,
  keywords: [
    "deep time",
    "paleogeography",
    "geological map",
    "ancient history",
    "earth history",
    "interactive map",
    "prehistoric",
    "geology",
    "time travel map",
  ],
  authors: [{ name: "Substrata" }],
  creator: "Substrata",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Substrata",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Substrata",
    title: "Substrata — Explore the Hidden Layers of the World",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Substrata — geological strata layers with the wordmark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Substrata — Explore the Hidden Layers of the World",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/icons/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg",           type: "image/svg+xml" },
    ],
    apple: { url: "/icons/icon-180.png", sizes: "180x180" },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // Matches manifest theme_color; tints the iOS status bar + Android task switcher
  themeColor: "#1F5A5C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased">
        {children}
        <ServiceWorkerRegistrar />
        <SwUpdateToast />
      </body>
    </html>
  );
}
