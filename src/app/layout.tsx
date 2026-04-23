import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AssistantWidget from "@/components/assistant/AssistantWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "College Freecycling Market - RKNEC",
  description: "A sustainable marketplace for RKNEC students to buy, sell, and donate items within the college community.",
  keywords: ["freecycling", "marketplace", "RKNEC", "college", "sustainable", "reuse"],
  authors: [{ name: "RKNEC Freecycling Team" }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: "College Freecycling Market",
    description: "Buy, sell, and donate items within your college community",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <AssistantWidget />
        <Toaster />
      </body>
    </html>
  );
}
