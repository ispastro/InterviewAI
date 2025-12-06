import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Interview Simulator | Practice Makes Perfect",
  description: "Practice your interview skills with our AI-powered mock interview simulator. Get real-time feedback, improve your communication, and land your dream job.",
  keywords: ["interview practice", "mock interview", "AI interview", "job preparation", "career development"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ background: 'var(--background)', color: 'var(--text-primary)' }}
      >
        {children}
      </body>
    </html>
  );
}
