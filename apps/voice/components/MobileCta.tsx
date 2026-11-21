import Link from "next/link";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0e1426]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
      <Link
        href="/pricing#trial"
        className="flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
      >
        Get the $2.90 Trial Pack
      </Link>
      <p className="mt-1.5 text-center text-[10px] text-slate-400">15 minutes · 4 MP3 stems · one-time</p>
    </div>
  );
}
