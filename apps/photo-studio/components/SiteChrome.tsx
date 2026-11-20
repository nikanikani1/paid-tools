import Link from "next/link";
import type { ReactNode } from "react";
import type { BrandConfig } from "@/lib/brands";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#styles", label: "Styles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/orders", label: "Find an order" },
];

export function SiteChrome({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return (
    <>
      <header className="sans sticky top-0 z-30 border-b border-black/10 bg-[var(--paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {brand.name}
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                style={{ color: "var(--ink)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: "var(--brand)", outlineColor: "var(--brand)" }}
          >
            Get the pack — {brand.price}
          </Link>
        </div>
        <nav
          aria-label="Main mobile"
          className="flex gap-5 overflow-x-auto border-t border-black/5 px-5 py-2 text-xs md:hidden"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap opacity-75 hover:opacity-100" style={{ color: "var(--ink)" }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}

      <footer className="sans mt-16 border-t border-black/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-base font-bold" style={{ color: "var(--ink)" }}>
              {brand.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
              {brand.kind === "landscape"
                ? "AI landscape concepts from one yard photo. Design reference, not construction drawings."
                : "AI hair-colour try-on from one selfie. A visual reference for your salon conversation."}
            </p>
            <p className="mt-3 text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
              Only upload photos you have the right to use. AI-generated results can contain artifacts.
            </p>
          </div>
          <FooterColumn title="Product" items={[{ href: "/", label: "Home" }, { href: "/#how", label: "How it works" }, { href: "/#styles", label: "Styles" }, { href: "/pricing", label: "Pricing" }]} />
          <FooterColumn title="Orders" items={[{ href: "/orders", label: "Find an order" }, { href: "/refund", label: "Refund policy" }, { href: "/pricing", label: "What is included" }]} />
          <FooterColumn title="Legal & contact" items={[{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/refund", label: "Refunds" }, { href: "/terms#dmca", label: "Copyright / DMCA" }]} />
        </div>
        <div className="mx-auto max-w-6xl border-t border-black/5 px-5 py-5 text-xs opacity-60" style={{ color: "var(--ink)" }}>
          <p>
            © 2026 {brand.legalName}. AI-generated images from photos you upload. Questions:{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline underline-offset-2">
              {brand.supportEmail}
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={`${title}-${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              style={{ color: "var(--ink)" }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
