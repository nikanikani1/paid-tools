import Link from "next/link";

const NAV = [
  { href: "/ai-vocal-remover", label: "AI vocal remover" },
  { href: "/remove-vocals-from-song", label: "Remove vocals" },
  { href: "/karaoke-maker", label: "Karaoke maker" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-[#0b1020]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex flex-none items-center gap-2.5 text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12v3M8 8v10M12 4.5v15M16 8v10M20 11v5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            StemSplit<span className="text-cyan-300">.ai</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 text-sm text-slate-300 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-3">
          <Link href="/pricing#trial" className="btn btn-primary btn-sm">
            Start trial — $2.90
          </Link>
        </div>
      </div>

      <nav
        aria-label="Main mobile"
        className="flex gap-5 overflow-x-auto border-t border-slate-800/60 px-6 py-2 text-xs text-slate-400 lg:hidden"
      >
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap transition-colors hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
