import type { Metadata } from "next";
import Link from "next/link";
import GeneratorForm from "../components/generator-form";
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  JsonLd,
  KeyFacts,
  Prose,
  RelatedLinks,
  SampleGrid,
  Section,
  StyleTable,
} from "../components/ui";
import { EditorialByline, StudioComparisonSection } from "../components/editorial";
import { STYLE_DETAILS } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, productJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Professional Headshot — Business-Ready Portraits in Minutes",
  description:
    "Get a professional headshot without a studio booking. Upload 5 selfies, choose a corporate preset and download a paid set of business-ready portraits for LinkedIn, résumés and press pages.",
  path: "/ai-professional-headshot",
  keywords: [
    "ai professional headshot",
    "ai professional headshot generator",
    "professional headshots online",
    "business headshot",
  ],
});

const FAQ = [
  {
    q: "Is an AI professional headshot good enough for a company website?",
    a: "Yes for directory, team-page and profile use, which is where most business headshots are actually seen at 96 to 320 pixels. It is not a replacement for a studio shoot if you need large print, a magazine cover or a brand campaign with specific art direction.",
  },
  {
    q: "What should I wear in the source photos?",
    a: "Wear the collar you want in the result — a button-down, blazer or a clean knit. The preset can change the jacket colour and backdrop, but it cannot reliably invent a collar that is not there, so dress for the meeting you want to look ready for.",
  },
  {
    q: "Can I get the same look for a team?",
    a: "Yes. The team flow uses one shared style guide so every person ends up with the same backdrop, crop and lighting profile. Orders of ten or more are handled as a single invoice — see the team headshots page.",
  },
  {
    q: "How fast is delivery?",
    a: "The 5-image Sample Pack finishes in well under a minute of generation time. Larger packages will publish their delivery times when they open. The page shows live progress and you can download as soon as it is done.",
  },
  {
    q: "Do I own the images?",
    a: "You receive a commercial licence for every delivered image — website, ads, brochures, articles, speaker decks and print. You cannot resell them as stock photography or train a competing model on them.",
  },
  {
    q: "What if I need a specific backdrop, like an office or a plain white wall?",
    a: "Pick the corporate preset for a studio grey or soft office backdrop. If you need a strict plain white background — for visas, badges or some HR systems — say so in the order notes after purchase and the redo can be regenerated on white.",
  },
];

export default function AiProfessionalHeadshotPage() {
  return (
    <main>
      <JsonLd
        data={productJsonLd({
          name: "AI Professional Headshot packages",
          description:
            "Business-ready AI headshots from your selfies. The $9 five-image Sample Pack is the only package on sale today; larger packages are coming soon. Commercial licence and one free redo.",
          path: "/ai-professional-headshot",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI professional headshot", path: "/ai-professional-headshot" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "AI professional headshot", path: "/ai-professional-headshot" },
        ]}
      />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            Business-ready · 2–4 minutes
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            AI Professional Headshot — Business-Ready Portraits in Minutes
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              A professional headshot is not a nice-to-have. It is the image that appears next to your name in a
              recruiter&apos;s shortlist, a client&apos;s proposal deck, a conference programme and your company&apos;s
              About page — often all in the same week. Booking a studio for that is slow and expensive; using the cropped
              photo from a wedding is worse.
            </p>
            <p>
              This page is the business-use path through the generator: corporate presets, wardrobe guidance, delivery
              sizes that survive being shrunk into a directory listing, and a commercial licence that covers company
              websites and printed material.
            </p>
          </div>
          <div className="sans mt-6">
            <KeyFacts
              facts={[
                { label: "Best preset", value: "LinkedIn / Corporate" },
                { label: "Delivery", value: "1024px, JPG" },
                { label: "Turnaround", value: "2–4 minutes" },
                { label: "Licence", value: "Commercial" },
              ]}
            />
          </div>
        </div>
        <GeneratorForm defaultStyle="LinkedIn / Corporate" heading="Generate business headshots" />
      </div>

      <Section
        eyebrow="What makes it professional"
        title="Composition, light and wardrobe — the three things that read as “professional”"
        intro={
          <p>
            People judge a headshot in under a second, and the judgement is driven by pattern-matching rather than
            taste. Three signals carry almost all of the weight.
          </p>
        }
      >
        <Prose>
          <h3>1. Framing that matches the channel</h3>
          <p>
            Business headshots are usually cropped from mid-chest up, with the eyes on the upper third of the frame and a
            little headroom. Too wide and the face disappears inside a LinkedIn circle; too tight and the crop looks like
            a passport photo. Our corporate preset generates a head-and-shoulders framing by default because that is the
            crop that survives every downstream use: a 96-pixel directory avatar, a 400-pixel LinkedIn circle, a
            speaker card and a printed badge.
          </p>
          <h3>2. Light from the front and slightly above</h3>
          <p>
            A single soft light from slightly above the eye line, with no strong shadow under the nose and no blown
            highlights on the forehead, is the lighting pattern of nearly every corporate portrait you have seen. Phone
            selfies usually fail here: ceiling lights push shadows down, windows behind the subject blow out the
            background, and on-camera flash flattens everything. The preset rebuilds the light rather than trying to fix
            the original.
          </p>
          <h3>3. Wardrobe that reads as senior without being a costume</h3>
          <p>
            A dark blazer over a light shirt, or a clean knit in a muted tone, reads as competent in almost every
            industry. Loud patterns, logos and heavily textured fabrics distract at small sizes. If you do not own the
            right collar, wear the closest thing for the source photos — the preset can adjust colour and backdrop, but
            it cannot invent structure that is not in the photograph.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Presets"
        title="Business presets and who they are for"
        intro={<p>All five presets are available on the Sample Pack; pick one at order time, or regenerate with a different one on the free redo.</p>}
      >
        <StyleTable styles={STYLE_DETAILS} />
      </Section>

      <Section eyebrow="Examples" title="Corporate set preview">
        <SampleGrid title="Corporate and creative presets, plus the medical and real-estate variants of the same pipeline." />
      </Section>

      <Section
        eyebrow="Where it gets used"
        title="The channels a business headshot actually has to survive"
        intro={<p>One set usually covers all four of these; there is no need to book separate shoots.</p>}
      >
        <Prose>
          <h3>Recruiter-facing profiles</h3>
          <p>
            LinkedIn displays profile photos as a circle and recommends at least 400×400 pixels, which means the crop
            is decided for you: head and shoulders, centred, with the eyes near the vertical middle of the circle. A
            formal corporate frame with a plain backdrop works better than a busy office shot because the background
            does not fight the circular crop.
          </p>
          <h3>Company directory and About pages</h3>
          <p>
            Directory tiles are small and usually square. The failure mode here is inconsistency: eight people with
            eight different backgrounds look like a stock photo collage. If consistency matters more than individuality,
            use the{" "}
            <Link href="/team-headshots" className="text-orange-700 underline underline-offset-2">
              team headshots
            </Link>{" "}
            flow so every person gets the same backdrop and crop.
          </p>
          <h3>Press pages, speaker decks and bylined articles</h3>
          <p>
            These are often printed larger than a directory tile, so expression matters more than resolution. A
            relaxed, slightly warmer frame — the creative preset — usually reads better in a keynote deck or a podcast
            page than a formal one.
          </p>
          <h3>Résumés and applications</h3>
          <p>
            For CVs, immigration paperwork, badges and some HR systems, the requirement is a plain background and a
            neutral expression. Generate a formal frame, then use the plainest backdrop; if a specific system demands a
            white background, mention it when requesting a redo and we regenerate on white.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Comparison"
        title="AI professional headshot vs studio vs DIY selfie"
        intro={<p>Each option has a different cost profile and a different failure mode.</p>}
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Option
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Typical cost
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Time
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Main failure mode
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {[
                ["AI generated set (this page)", "From $9 one-time (Sample Pack)", "Under a minute for the Sample Pack", "Likeness drift; fixed by redo"],
                ["Studio photographer", "Studio day rates, multiple outfits extra", "1–3 weeks incl. retouching", "Scheduling and cost for one look"],
                ["DIY phone selfie", "$0", "5 minutes", "Light, crop and background look amateur"],
                ["Wedding or holiday crop", "$0", "Minutes", "Wrong crop, other people, dated styling"],
              ].map(([option, cost, time, risk]) => (
                <tr key={option}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {option}
                  </th>
                  <td className="px-5 py-3 text-stone-600">{cost}</td>
                  <td className="px-5 py-3 text-stone-600">{time}</td>
                  <td className="px-5 py-3 text-stone-600">{risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Professional headshot questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/linkedin-headshot", label: "LinkedIn headshot", body: "Profile sizing and recruiter-facing advice." },
          { href: "/team-headshots", label: "Team headshots", body: "One style guide across ten or more people." },
          { href: "/doctor-headshots", label: "Doctor headshots", body: "Clinical presets for medical directories." },
          { href: "/pricing", label: "Pricing", body: "$9 Sample Pack on sale; larger packages coming soon." },
          { href: "/how-it-works", label: "How it works", body: "The quality gate, identity pass and delivery." },
          { href: "/refund", label: "Redo & refund policy", body: "What happens if the set misses." },
        ]}
      />

      <CtaBand body="The $9 Sample Pack (5 headshots) is the only package on sale today; larger packages are coming soon. One-time payment, one free redo included." />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
