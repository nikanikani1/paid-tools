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
  title: "LinkedIn Headshot Generator — Stand Out to Recruiters",
  description:
    "Generate a LinkedIn headshot from your selfies: correct circular-crop framing, clean backdrop and a recruiter-friendly expression. Paid from a $9 Sample Pack (5 images); larger packages are coming soon.",
  path: "/linkedin-headshot",
  keywords: ["linkedin headshot", "linkedin profile photo", "linkedin headshot generator", "linkedin photo ai"],
});

const FAQ = [
  {
    q: "What size should a LinkedIn profile photo be?",
    a: "LinkedIn displays profile photos as a circle and recommends an image of at least 400×400 pixels. In practice a square 1024px export gives you plenty of headroom: LinkedIn downscales it, and you keep a high-resolution original for other channels.",
  },
  {
    q: "Should I use a plain background on LinkedIn?",
    a: "A plain or softly blurred background almost always outperforms a busy office shot, because the circular crop removes most of the context anyway and leaves only visual noise behind your head. Studio grey, warm neutral or a heavily blurred interior are the safest choices.",
  },
  {
    q: "Smile or not?",
    a: "For most roles a relaxed closed-mouth smile or a slight smile reads as approachable without looking staged. Creative and customer-facing roles can go warmer; finance, legal and medical profiles often look stronger with a neutral expression.",
  },
  {
    q: "Will an AI headshot be obvious to recruiters?",
    a: "A well-generated frame is not identifiable as AI at profile-photo size, which is roughly 96 to 400 pixels. What is obvious is a bad source photo — harsh shadows, a cropped group shot, sunglasses. The quality gate rejects those inputs before generation, which is why the first render usually looks natural.",
  },
  {
    q: "Can I use the same set for LinkedIn and my company page?",
    a: "Yes — both are your own channels and the commercial licence covers them. One caveat: there is no team flow yet, so a company page that needs matching tiles across several people cannot get a shared style guide. Each person orders their own individual pack instead.",
  },
  {
    q: "Do I need a professional photographer for a good LinkedIn photo?",
    a: "No, not for the size LinkedIn displays. A studio shoot is worth it if you also need large print or a brand campaign. For a profile photo, a cleanly generated corporate frame from good selfies is usually indistinguishable at the display size.",
  },
];

export default function LinkedinHeadshotPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab LinkedIn Headshot Generator",
          description:
            "Generate a LinkedIn-ready headshot from your selfies with correct circular-crop framing and a clean backdrop.",
          path: "/linkedin-headshot",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "LinkedIn headshot", path: "/linkedin-headshot" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "LinkedIn headshot", path: "/linkedin-headshot" },
        ]}
      />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            Built for the circular crop
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            LinkedIn Headshot Generator — Stand Out to Recruiters
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              Your LinkedIn photo is rendered at roughly the size of a thumbnail and is judged in a fraction of a
              second. That is not enough time for a beautiful photograph to do its work — but it is more than enough
              time for a bad crop, a harsh shadow or a busy background to undermine you.
            </p>
            <p>
              This page is the LinkedIn path through the generator. Every frame is framed for the circular crop:
              head-and-shoulders, eyes slightly above centre, a plain or softly blurred backdrop, and light from the
              front rather than from the ceiling.
            </p>
          </div>
          <div className="sans mt-6">
            <KeyFacts
              facts={[
                { label: "Export size", value: "1024px square" },
                { label: "Crop", value: "Head & shoulders" },
                { label: "Backdrop", value: "Plain / soft blur" },
                { label: "Turnaround", value: "~2 minutes" },
              ]}
            />
          </div>
        </div>
        <GeneratorForm defaultStyle="LinkedIn / Corporate" heading="Generate LinkedIn headshots" />
      </div>

      <Section
        eyebrow="Profile specs"
        title="What actually matters in a LinkedIn profile photo"
        intro={
          <p>
            Four variables decide whether a profile photo helps or hurts: crop, background, expression and consistency
            with the rest of your profile.
          </p>
        }
      >
        <Prose>
          <h3>Crop for a circle, not a rectangle</h3>
          <p>
            LinkedIn displays your photo as a circle and recommends at least 400×400 pixels. The circle cuts off the
            corners of a square image, so anything important near the edges — a shoulder, a hand, a logo — disappears.
            Generate a head-and-shoulders framing with the eyes slightly above the vertical middle and the head not
            touching the top edge. That is the composition our corporate preset produces by default.
          </p>
          <h3>Keep the background boring</h3>
          <p>
            At thumbnail size, a detailed background turns into visual noise behind your head. Studio grey, warm
            neutral and heavily blurred interiors all work; a full bookshelf, a window with a view or a bright outdoor
            scene usually do not. If you want context — say, a medical or real-estate setting — keep it soft and let it
            read as a tone rather than a scene.
          </p>
          <h3>Choose an expression that matches your role</h3>
          <p>
            A relaxed closed-mouth smile reads as approachable to most people, which is the right default for
            customer-facing, creative and commercial roles. Neutral expressions photograph as more authoritative and fit
            finance, legal and clinical profiles. What does not work is a staged grin or a very serious stare — both
            read as uncomfortable at small sizes.
          </p>
          <h3>Match your banner and headline</h3>
          <p>
            The photo is one third of your profile header. A formal portrait next to a playful banner looks
            inconsistent; a creative portrait next to a corporate banner does too. Choose the photo, then choose a
            banner with the same colour temperature — warm neutrals with warm portraits, cool greys with formal ones.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Examples" title="LinkedIn-oriented presets">
        <SampleGrid title="Corporate grey, soft office and warm-window variants, all framed for the LinkedIn circle." />
      </Section>

      <Section
        eyebrow="Checklist"
        title="What to check before you publish the new photo"
        intro={<p>Ten seconds of review prevents the most common profile-photo mistakes.</p>}
      >
        <div className="sans grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h3 className="font-serif text-lg font-bold text-stone-900">Do</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>· Check the circular crop preview before saving — LinkedIn shows it when you upload.</li>
              <li>· Export at 1024px square so the platform has room to downscale.</li>
              <li>· Keep your face occupying roughly half the frame height.</li>
              <li>· Use the same photo across LinkedIn, your CV and your company directory if you can.</li>
              <li>· Update it if your hairstyle or weight has changed noticeably.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h3 className="font-serif text-lg font-bold text-stone-900">Avoid</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>· Group photos or cropped-out friends showing at the edge of the circle.</li>
              <li>· Sunglasses, caps with brims, or hair covering an eye.</li>
              <li>· Heavy beauty filters, smoothing or HDR that read as fake at thumbnail size.</li>
              <li>· Photos where the background is brighter than your face.</li>
              <li>· Old photos that no longer match how you look in meetings.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Also useful"
        title="One set, several channels"
        intro={<p>Your LinkedIn photo also works in the other places a recruiter might find you.</p>}
      >
        <Prose>
          <p>
            Recruiters rarely look at one surface. A typical search sequence is LinkedIn profile, company site, a
            bylined article or conference page, then maybe a GitHub or a portfolio. If each of those shows a different
            version of your face — a selfie on LinkedIn, an old wedding crop on the company page, a conference badge
            photo from 2019 — the cumulative effect is sloppiness, even though each individual image is fine.
          </p>
          <p>
            That is the practical argument for ordering a set rather than a single image. The{" "}
            <Link href="/ai-professional-headshot" className="text-orange-700 underline underline-offset-2">
              professional headshot
            </Link>{" "}
            packages, when they open, will deliver up to 100 frames — enough to pick a formal version for LinkedIn, a warmer one for a speaker
            bio and a neutral one for a résumé or badge. The preset can be changed on the free redo, so a set you like
            can be re-run in a different style without paying twice.
          </p>
          <p>
            If you are buying for more than yourself: there is no team flow yet, so each person orders individually.
            That means backdrops are not coordinated across seats unless everyone happens to pick the same preset. The{" "}
            <Link href="/team-headshots" className="text-orange-700 underline underline-offset-2">
              team headshots page
            </Link>{" "}
            is a preview of the planned workflow, not a product on sale.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="LinkedIn headshot questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/ai-professional-headshot", label: "AI professional headshot", body: "Business presets and where they get used." },
          { href: "/free-ai-headshot-generator", label: "Free vs paid headshot tools", body: "What free generators actually deliver, and why ours starts at a $9 Sample Pack." },
          { href: "/team-headshots", label: "Team plans (preview)", body: "Not available yet — no shared team flow; individual packs only." },
          { href: "/pricing", label: "Pricing", body: "$9 Sample Pack on sale; larger packages coming soon." },
          { href: "/how-it-works", label: "How it works", body: "Quality gate, identity pass and delivery." },
          { href: "/", label: "Professional headshots", body: "The full pipeline and all style presets." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "What the generator does and how it keeps likeness." },
        ]}
      />

      <CtaBand title="Refresh the photo recruiters see first" body="The $9 Sample Pack (5 headshots) is the only package on sale today; larger packages are coming soon." cta="Generate my LinkedIn headshots" />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
