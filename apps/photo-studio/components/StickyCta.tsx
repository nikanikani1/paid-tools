import { BRAND } from "@/lib/brands";

export function StickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur md:hidden"
    >
      <a
        href="#studio"
        className="sans flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-white"
        style={{ backgroundColor: "var(--brand)" }}
      >
        Try your photo — {BRAND.price}
      </a>
    </div>
  );
}
