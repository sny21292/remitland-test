/**
 * Root Layout - The outermost wrapper for every page in the app.
 *
 * In Laravel, this is like your main Blade layout (app.blade.php).
 * Every page is rendered inside {children} — similar to @yield('content').
 *
 * IMPORTANT: This is a Server Component (runs on the server by default).
 * That's why we wrap {children} with StoreProvider (a Client Component)
 * to give all pages access to Redux state.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "../store/StoreProvider";
import "./globals.css";

// Load Google Fonts — Next.js optimizes these automatically
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Page metadata (like <meta> tags in Blade's <head>)
export const metadata: Metadata = {
  title: "RemitLand - International Money Transfer",
  description: "Send money internationally with RemitLand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* StoreProvider wraps all pages with Redux context */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
