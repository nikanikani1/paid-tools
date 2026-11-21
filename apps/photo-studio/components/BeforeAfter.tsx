"use client";

import { useId, useState } from "react";

type Props = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  frameClassName?: string;
};

export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  frameClassName = "aspect-[3/2]",
}: Props) {
  const [position, setPosition] = useState(52);
  const id = useId();

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/10 bg-white ${frameClassName}`}>
      <img src={before} alt={beforeAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <img src={after} alt={afterAlt} className="h-full w-full object-cover" />
      </div>

      <span className="sans absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        {beforeLabel}
      </span>
      <span
        className="sans absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: "var(--brand)" }}
      >
        {afterLabel}
      </span>

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-bold shadow-lg" style={{ color: "var(--brand)" }}>
          ↔
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Drag to compare the original photo with the AI result"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <span className="sans pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium text-white/90">
        Drag to compare
      </span>
    </div>
  );
}
