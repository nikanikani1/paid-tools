import Link from "next/link";
import { FOOTER_LINKS, NAV_LINKS, SITE_NAME } from "../lib/site";

export function SiteHeader() {
  return (
    <header className="sans sticky top-0 z-20 border-b border-stone-300/70 bg-[var(--paper)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          Portrait<span className="text-orange-700">Lab</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-stone-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#generator"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Upload selfies
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="sans mx-auto mt-20 max-w-6xl border-t border-stone-300 px-6 py-10 text-xs text-stone-500">
      <div className="grid gap-8 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="font-serif text-base font-bold text-stone-800">
            Portrait<span className="text-orange-700">Lab</span>
          </p>
          <p className="mt-3 max-w-sm leading-relaxed">
            AI headshots for LinkedIn, résumés, team pages and clinic directories. One-time pricing, free redo,
            written refund policy.
          </p>
          <p className="mt-4 leading-relaxed">
            Upload only your own photos. No public figures, no minors.
            <br />
            Questions: <span className="text-stone-700">support@portraitlab.example</span>
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-orange-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-8 border-t border-stone-200 pt-6">
        © 2026 {SITE_NAME} — AI headshot generator. Images are AI-generated from photos you supply. You are responsible
        for having the rights to the photos you upload.
      </p>
    </footer>
  );
}
