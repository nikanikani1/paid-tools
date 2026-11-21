import Link from "next/link";

export function MobileCta() {
  return (
    <div className="sans fixed inset-x-0 bottom-0 z-50 border-t border-stone-300 bg-[#f7f2ea]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(28,23,20,0.12)] backdrop-blur md:hidden">
      <Link
        href="#start"
        className="flex items-center justify-center rounded-full bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white"
      >
        Start with the $9 Sample Pack
      </Link>
      <p className="mt-1.5 text-center text-[10px] text-stone-500">5 headshots · one-time · free redo</p>
    </div>
  );
}
