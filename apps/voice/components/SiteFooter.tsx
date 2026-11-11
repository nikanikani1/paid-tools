import Link from "next/link";

const TOOLS = [
  { href: "/ai-vocal-remover", label: "AI vocal remover" },
  { href: "/free-vocal-eliminator", label: "Free vocal eliminator" },
  { href: "/vocal-remover-online", label: "Vocal remover online" },
  { href: "/remove-vocals-from-song", label: "Remove vocals from a song" },
  { href: "/acapella-maker", label: "Acapella maker" },
  { href: "/karaoke-maker", label: "Karaoke maker" },
  { href: "/separate-stems", label: "Stem separation" },
];

const RESOURCES = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/terms#dmca", label: "DMCA" },
  { href: "/refund", label: "Refunds" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#080c19]/70">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Separate any song into vocals, drums, bass and other stems in minutes. Built for karaoke, acapella,
              remixes and practice — start with the $2.90 Trial Pack, 15 minutes one-time.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Only upload audio you own or have permission to process. We respond to takedown requests through our
              DMCA channel.
            </p>
          </div>

          <FooterColumn title="Tools" items={TOOLS} />
          <FooterColumn title="Resources" items={RESOURCES} />
          <FooterColumn title="Legal" items={LEGAL} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StemSplit.ai — AI vocal remover and stem separation.</p>
          <p>
            Payments handled by Waffo · <Link href="/refund" className="hover:text-slate-300">14-day refund policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-300">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="transition-colors hover:text-slate-100">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
