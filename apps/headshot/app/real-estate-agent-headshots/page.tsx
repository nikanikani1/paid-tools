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
} from "../components/ui";
import { EditorialByline, StudioComparisonSection } from "../components/editorial";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, webApplicationJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Agent Headshots — Trust-Building Portraits",
  description:
    "AI headshots for real estate agents: portraits that stay sharp on MLS cards, yard signs, business cards and brokerage pages. Paid from a $9 Sample Pack (5 images); larger packages are coming soon.",
  path: "/real-estate-agent-headshots",
  keywords: [
    "real estate agent headshots",
    "realtor headshot",
    "real estate headshot generator",
    "agent profile photo",
  ],
});

const FAQ = [
  {
    q: "What photo size do real estate listings need?",
    a: "Listing cards and agent profiles usually display a square or circular crop at 96 to 400 pixels, while yard signs and business cards need a print-resolution original. A 1024px square export covers both: the platform downscales it, and you still have enough resolution for a card or a sign.",
  },
  {
    q: "Which backdrop works best for agents?",
    a: "A warm neutral or a softly blurred interior reads as local and approachable, which suits residential agents. A plain studio grey is safer for commercial and luxury listings where the portrait sits next to high-end property photos and should not compete with them.",
  },
  {
    q: "Should I smile in a real estate headshot?",
    a: "Yes, for most residential roles. Trust is the product, and a relaxed smile reads as someone a client can call. A neutral, more formal expression suits commercial, investment and luxury agents whose marketing leans on authority.",
  },
  {
    q: "Can I get a version that matches my brokerage's brand colours?",
    a: "The preset controls backdrop tone and wardrobe level; if your brokerage uses a specific colour, mention it in the order notes and the redo can be regenerated against a closer backdrop tone. We do not reproduce trademarked logos.",
  },
  {
    q: "Can my whole team order together?",
    a: "Yes. Brokerages and teams of ten or more go through the team flow, which keeps every agent on the same backdrop and crop so the brokerage website looks like one company rather than a collection of individual businesses.",
  },
  {
    q: "How fast do I get the images?",
    a: "The 5-image Sample Pack finishes in well under a minute of generation time; larger orders will publish their timings when they open. You download the full set immediately — no waiting for a retoucher or a gallery email.",
  },
];

export default function RealEstateAgentHeadshotsPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab Real Estate Agent Headshot Generator",
          description:
            "AI headshots for real estate agents, sized for MLS cards, business cards, yard signs and brokerage pages.",
          path: "/real-estate-agent-headshots",
          category: "BusinessApplication",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Real estate agent headshots", path: "/real-estate-agent-headshots" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Real estate agent headshots", path: "/real-estate-agent-headshots" },
        ]}
      />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            For agents & brokerages
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            Real Estate Agent Headshots — Trust-Building Portraits at Every Size
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              Real estate is one of the few industries where the headshot appears on almost every surface: listing
              cards, the brokerage site, business cards, open-house flyers, yard signs, bus benches and the little
              circular avatar on a review site. Most of those surfaces are viewed at a glance, from a phone, while
              somebody is deciding whether to call you.
            </p>
            <p>
              This preset is built for that reality. Confident posture, business casual or a blazer, a softly blurred
              interior or plain backdrop, and a crop that stays legible when it is shrunk to a 96-pixel listing card —
              and still holds up when it is printed at poster size for a sign.
            </p>
          </div>
          <div className="sans mt-6">
            <KeyFacts
              facts={[
                { label: "Export", value: "1024px square" },
                { label: "Best preset", value: "Real Estate" },
                { label: "Works at", value: "96px → print" },
                { label: "Turnaround", value: "~2 minutes" },
              ]}
            />
          </div>
        </div>
        <GeneratorForm defaultStyle="Real Estate" heading="Generate agent headshots" />
      </div>

      <Section
        eyebrow="Where it appears"
        title="One portrait, a dozen placements"
        intro={<p>Each placement has its own crop and resolution constraint. This is what to watch for in each.</p>}
      >
        <Prose>
          <h3>MLS and portal listing cards</h3>
          <p>
            Listing cards are the highest-volume placement and the smallest. A card usually shows a square or circular
            crop around 96 to 150 pixels next to the property photo, which means detail is lost entirely — only the
            silhouette, the light on the face and the overall tone survive. Busy backgrounds turn into grey noise;
            plain or soft backgrounds keep the face readable. This is why the real-estate preset defaults to a soft
            interior rather than a full room.
          </p>
          <h3>Brokerage and team pages</h3>
          <p>
            Brokerage directories are larger — typically 200 to 400 pixels — and are the place where consistency
            matters most. If every agent uploads their own photo, the page becomes a collage of backgrounds and eras.
            The{" "}
            <Link href="/team-headshots" className="text-orange-700 underline underline-offset-2">
              team flow
            </Link>{" "}
            exists for exactly this: one backdrop and crop across the whole brokerage.
          </p>
          <h3>Business cards and flyers</h3>
          <p>
            Print at 300dpi needs a real original. A 1024px square export gives you roughly 3.4 inches at 300dpi, which
            is enough for a card portrait and a flyer headshot. If you are printing a yard sign or a bus bench, you need
            a larger export — the enhanced-resolution set will be available when larger packages open.
          </p>
          <h3>Review sites and social avatars</h3>
          <p>
            Review profiles and social avatars are circular and tiny. The same crop that works for the MLS card works
            here, which is the argument for choosing one frame and using it everywhere rather than a different photo for
            every platform.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Examples" title="Agent-oriented previews">
        <SampleGrid title="Blurred interior, plain studio and warm-window variants — all readable at listing-card size." />
      </Section>

      <Section
        eyebrow="Photo guide"
        title="How agents should shoot the source selfies"
        intro={<p>You do not need a photographer. You do need five minutes and a window.</p>}
      >
        <Prose>
          <ul>
            <li>
              <strong>Face the window</strong>, do not put it behind you. Front light is what makes a face read clearly
              at thumbnail size.
            </li>
            <li>
              <strong>Stand at chest height</strong> and hold the phone slightly above eye level — the classic
              selfie-angle from below reads as an amateur photo.
            </li>
            <li>
              <strong>Wear what you wear to a listing appointment</strong>: a blazer, a button-down or a clean knit.
              Skip busy patterns and visible logos.
            </li>
            <li>
              <strong>Take five photos across two minutes</strong>: straight on, fifteen degrees left, fifteen right,
              one relaxed smile, one with different light on the other side.
            </li>
            <li>
              <strong>Remove sunglasses and hats</strong>, and make sure no second face is in the frame — the quality
              gate rejects both.
            </li>
          </ul>
          <p>
            If you have a professional photo from a previous shoot that you like, keep using it as your primary and use
            this set for the placements that need a different crop or a more current look. Nothing forces you to
            replace every image at once.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Real estate headshot questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/ai-professional-headshot", label: "AI professional headshot", body: "Formal business presets and licensing." },
          { href: "/team-headshots", label: "Team headshots", body: "Brokerage-wide consistency, invoicing, 10+ people." },
          { href: "/linkedin-headshot", label: "LinkedIn headshot", body: "Recruiter-facing profile framing." },
          { href: "/pricing", label: "Pricing", body: "$9 Sample Pack on sale; larger packages coming soon." },
          { href: "/how-it-works", label: "How it works", body: "The pipeline from selfie to download." },
          { href: "/", label: "Professional headshots", body: "All five style presets and paid package options." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "How the generator works and the $9 entry point." },
        ]}
      />

      <CtaBand title="Get a headshot that survives the listing card" body="The $9 Sample Pack (5 headshots) is the only package on sale today; larger packages are coming soon." cta="Generate my headshots" />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
