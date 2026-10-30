import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import Tracker from "@/components/analytics/Tracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ShiftLab", template: "%s · ShiftLab" },
  description:
    "Practise the SOC Level 1 analyst job on fictional alerts: investigate, triage, report, and get coached.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        {/* reads the current path, so it waits inside Suspense like the sidebar does */}
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
      </body>
    </html>
  );
}
