import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import ContractInfoBanner from "@/components/ContractInfoBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeadDrop | Decentralized Whistleblower Platform & AI Gatekeeper",
  description: "Censorship-resistant intelligence whistleblowing. Cryptographically protected, AI-verified, and permanently archived on the GenLayer blockchain.",
  metadataBase: new URL("https://deaddrop.platform"),
  openGraph: {
    title: "DeadDrop | Decentralized Whistleblower Platform & AI Gatekeeper",
    description: "Censorship-resistant intelligence whistleblowing. Cryptographically protected, AI-verified, and permanently archived on the GenLayer blockchain.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeadDrop | Decentralized Whistleblower Platform",
    description: "Submit. Verify. Publish. Cryptographically protected, AI-verified, and permanently archived on the GenLayer blockchain.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black select-none scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans bg-black text-fafafa antialiased min-h-screen relative overflow-x-hidden`}
      >
        {/* CRT Scanline Overlay Effect for espionage aesthetic */}
        <div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4))] opacity-40" />
        
        {/* Subtle red ambient background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyber/5 blur-[150px] pointer-events-none" />

        <main className="relative z-10">
          <ContractInfoBanner />
          {children}
        </main>
      </body>
    </html>
  );
}
