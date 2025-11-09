import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

// ✅ Page metadata (edit as needed)
export const metadata: Metadata = {
  title: "Axiom Trade | Token Discovery Table",
  description:
    "Pixel-perfect token discovery dashboard built with Next.js 14, Tailwind, React Query, and Redux Toolkit.",
  icons: {
    icon: "/favicon.ico",
  },
};

// ✅ Root layout (wraps entire app)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body
        className="
          min-h-screen 
          bg-gray-50 
          text-gray-900 
          font-sans 
          flex flex-col 
          items-center
          transition-colors
          duration-300
        "
      >
        {/* 
          ✅ Providers:
          - Redux (for global UI/sort/modal states)
          - React Query (for async data & caching)
        */}
        <Providers>
          {/* 
            ✅ Main content area:
            - `max-w-7xl` keeps layout centered & responsive
            - Add a Navbar/Header here later if needed
          */}
          <main className="w-full max-w-7xl p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
