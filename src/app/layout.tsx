import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthInitializer } from "@/components/AuthInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodLens — Tap to Scan",
  description: "Scan food, get honest reviews. Good & Bad ingredients at a glance.",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192.png" },
  other: {
    "theme-color": "#10b981",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
