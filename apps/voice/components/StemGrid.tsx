const STEMS = [
  {
    name: "Vocals",
    tag: "acapella",
    description:
      "Lead and backing vocals, harmonies and ad-libs, isolated so you can re-sing them, sample them or build an acapella.",
  },
  {
    name: "Drums",
    tag: "groove",
    description:
      "Kick, snare, hats and percussion as one clean stem for remixes, drum practice and loop-based production.",
  },
  {
    name: "Bass",
    tag: "low end",
    description:
      "Bass guitar and sub-bass separated from the mix, ready for sampling, transcription or replacing the low end.",
  },
  {
    name: "Other",
    tag: "everything else",
    description:
      "Guitars, keys, strings, synths and background textures — every element that is not vocals, drums or bass.",
  },
];

export function StemGrid({ heading = "The four stems you get back" }: { heading?: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-100">{heading}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEMS.map((stem, index) => (
          <div
            key={stem.name}
            data-reveal
            style={{ transitionDelay: `${index * 80}ms` }}
            className="card-hover card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100">{stem.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-violet-300">{stem.tag}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{stem.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-400">
        The instrumental is simply your original track with the vocal stem removed — it is created in the same pass,
        so you get vocals, instrumental and the individual stems from a single upload.
      </p>
    </div>
  );
}
