import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
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
  title: "Voto único · Encuesta",
  description:
    "Encuesta con código de invitación: una persona, un voto, resultados al instante.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[#f7f4ee] text-stone-900">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(15,118,110,0.12),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(217,119,6,0.10),transparent_30%)]"
        />
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-teal-800 text-white shadow-sm transition-transform group-hover:-rotate-6">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Voto único
            </span>
          </Link>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-stone-500 sm:block">
            Una persona · un voto
          </span>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="mx-auto w-full max-w-6xl px-5 py-8 text-xs text-stone-500 sm:px-8">
          Encuesta privada con código de invitación. Los resultados se
          muestran después de votar.
        </footer>
      </body>
    </html>
  );
}
