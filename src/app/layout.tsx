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

export const metadata: Metadata = {
  title: "Substrata",
  description: "Explore the hidden layers of the world.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Substrata",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icons/icon-180.png", sizes: "180x180" },
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