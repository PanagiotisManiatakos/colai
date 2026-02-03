import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

import { StoreProvider } from "@/store/StoreProvider";
import { BootstrapThemeSync } from "@/components/ui/BootstrapThemeSync";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Colai",
    template: "%s · Colai",
  },
  description: "Mobile-first PWA for orders and requests.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Colai",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <head>
        {/* This tag is updated at runtime when the user toggles Light/Dark */}
        <meta name="theme-color" content="#0b1220" />
      </head>
      <body>
        <StoreProvider>
          <BootstrapThemeSync />
          <ServiceWorkerRegister />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
