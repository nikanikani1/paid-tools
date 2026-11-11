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
  title: "Doctor & Clinic Headshots — Professional Medical Portraits",
  description:
    "AI headshots for doctors, dentists and clinic staff: white-coat or clean clinical presets, bright low-shadow lighting and directory-ready crops. 40–100 images from $35.",
  path: "/doctor-headshots",
  keywords: ["doctor headshots", "physician headshot", "clinic headshots", "medical professional headshot", "dentist headshot"],
});

const FAQ = [
  {
    q: "Can the preset add a white coat?",
    a: "The medical preset renders clinical attire — a white coat over a shirt or a clean clinical top — when the source photos show a collared shirt or coat. It cannot invent structure that is not there, so wear a collar and, if you have one, a white coat for the source photos.",
  },
  {
    q: "Is this appropriate for hospital directories and insurance listings?",
    a: "Yes. Directory and insurance-profile photos are displayed at 96 to 300 pixels, which is well within what a 1024px generated set handles. For those surfaces a plain, bright, low-shadow background is exactly right.",
  },
  {
    q: "Do you store patient information?",
    a: "No. We only process the practitioner portraits you upload. We do not ask for, collect or store patient data, appointment data or clinical records, and there is no EHR or scheduling integration. The order is a photo-processing job, not a clinical system.",
  },
  {
    q: "Can the whole clinic order together?",
    a: "Yes. Clinics and group practices with ten or more practitioners use the team flow: one style guide across every provider, one invoice, and a single turnaround. That keeps the clinic directory visually consistent, which matters more in healthcare than in most industries.",
  },
  {
    q: "Which expression works best for a medical headshot?",
    a: "A calm, warm expression reads as both competent and approachable, which is the combination patients respond to. Overly formal expressions can read as cold; a big grin can read as unserious. The medical preset defaults to a soft, closed-mouth smile.",
  },
  {
    q: "What about images for conferences and publications?",
    a: "Speaker bios and journal author photos are often printed larger than a directory tile, so pick a frame with a slightly warmer expression. The 100-image tier delivers enhanced resolution, which is the better choice if the image may be printed.",
  },
];

export default function DoctorHeadshotsPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab Doctor & Clinic Headshot Generator",
          description:
            "AI headshots for physicians, dentists and clinic staff with clinical presets and directory-ready crops.",
          path: "/doctor-headshots",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Doctor headshots", path: "/doctor-headshots" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Doctor headshots", path: "/doctor-headshots" },
        ]}
      />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            For physicians, dentists & clinic staff
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            Doctor &amp; Clinic Headshots — Professional Medical Portraits
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              A patient choosing a physician is making a judgement about competence and warmth from a thumbnail photo in
              a directory. That is an uncomfortable amount of weight on a 96-pixel image, but it is the reality of
              hospital directories, insurance finders and clinic websites.
            </p>
            <p>
              The medical preset is built for that context: bright, low-shadow lighting; a clean clinical or white-coat
              look; a calm, approachable expression; and a plain bright background that keeps the portrait readable when
              it is shrunk to a listing tile.
            </p>
          </div>
          <div className="sans mt-6">
            <KeyFacts
              facts={[
                { label: "Best preset", value: "Medical / Clinic" },
                { label: "Export", value: "1024px square" },
                { label: "Directory use", value: "96–300px" },
                { label: "Turnaround", value: "~2 minutes" },
              ]}
            />
          </div>
        </div>
        <GeneratorForm defaultStyle="Medical / Clinic" heading="Generate clinical headshots" />
      </div>

      <Section
        eyebrow="Where it appears"
        title="The four places a medical headshot has to work"
        intro={<p>Each has a different viewer and a different constraint, and they are rarely the same photo.</p>}
      >
        <Prose>
          <h3>Hospital and health-system directories</h3>
          <p>
            Directory tiles are small, square and often cropped harder than the original. A plain, bright background
            with the head centred and the eyes near the middle is the safest composition, because it survives whatever
            crop the directory applies. Clinical attire — a white coat or a clean professional top — helps a patient
            recognise the role at a glance.
          </p>
          <h3>Insurance and booking profiles</h3>
          <p>
            Insurance finders and online booking profiles compete with hundreds of other providers in a list. The photo
            is doing one job: making a patient stop scrolling. Warmth matters more here than formality, which is why the
            medical preset defaults to a soft closed-mouth smile rather than a neutral clinical stare.
          </p>
          <h3>Clinic website and About pages</h3>
          <p>
            On a practice website the portrait sits next to a biography, credentials and sometimes a location. This is
            the one place where a slightly tighter crop and a warmer background can work well, and where consistency
            across practitioners is most visible. Group practices with several providers should standardise the whole
            set — the{" "}
            <Link href="/team-headshots" className="text-orange-700 underline underline-offset-2">
              team flow
            </Link>{" "}
            runs one style guide across every provider.
          </p>
          <h3>Conference bios and publications</h3>
          <p>
            Speaker bios, journal author photos and grand-rounds announcements are often printed larger than a
            directory tile. For these, choose the enhanced resolution tier and a frame with more expression — the formal
            directory frame can look stiff at 500 pixels.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Examples" title="Clinical preset previews">
        <SampleGrid title="White-coat, clean clinic and neutral studio variants, all on bright low-shadow backgrounds." />
      </Section>

      <Section
        eyebrow="Photo guide"
        title="Shooting source photos in a clinical setting"
        intro={<p>You do not need a studio. A corridor with window light and five minutes is enough.</p>}
      >
        <Prose>
          <ul>
            <li>
              <strong>Wear the coat or collar</strong> you want in the result. The preset can adjust tone and backdrop,
              but it cannot add a collar that is not in the photograph.
            </li>
            <li>
              <strong>Use window light, not ceiling light</strong> — overhead lighting puts shadows under the eyes and
              nose, which is the single most common reason a clinical portrait looks tired.
            </li>
            <li>
              <strong>Use a plain wall or a blurred corridor background</strong> in the source photos; the preset
              replaces it, but a simpler original gives a cleaner result.
            </li>
            <li>
              <strong>Take five frames</strong>: straight on, two slight turns, one soft smile, one with light from the
              other side.
            </li>
            <li>
              <strong>No patients or colleagues in frame</strong>, and no visible badges, lanyards with names, or
              identifying documents on a desk behind you.
            </li>
          </ul>
          <p>
            If you are ordering for a department, collect the photos in one batch and use one style guide. Mixed
            lighting across a team directory is more noticeable than any single imperfect portrait.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Compliance"
        title="What this service is, and what it is not"
        intro={
          <p>
            Healthcare buyers reasonably ask about data handling, so here is the boundary in plain language.
          </p>
        }
      >
        <Prose>
          <p>
            This is a photo-processing service for practitioner portraits. You upload portrait photos of consenting
            adults, we render headshots and deliver files. We do not collect patient information, do not integrate with
            an EHR, scheduling or billing system, and do not store clinical records of any kind. There is no patient
            data in the pipeline, which is why the order does not create a HIPAA business-associate relationship for
            patient records.
          </p>
          <p>
            You are responsible for having the rights to the photos you upload — your own portrait in almost every case —
            and for how the resulting images are used in your marketing. If your institution requires an approved vendor
            review before using a third-party design tool, ask us for the data-handling summary and provider list; the{" "}
            <Link href="/privacy" className="text-orange-700 underline underline-offset-2">
              privacy page
            </Link>{" "}
            documents the processors we use and the retention window.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Medical headshot questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/team-headshots", label: "Team headshots", body: "One style guide for a whole clinic, invoicing included." },
          { href: "/ai-professional-headshot", label: "AI professional headshot", body: "Formal business presets and licensing." },
          { href: "/privacy", label: "Privacy", body: "Processors, retention and deletion." },
          { href: "/pricing", label: "Pricing", body: "$9 sample, then $35 / $45 / $75 one-time packages." },
          { href: "/how-it-works", label: "How it works", body: "Quality gate, identity pass and delivery." },
          { href: "/", label: "Professional headshots", body: "All style presets and paid package options." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "How the generator pipeline works and what it costs." },
        ]}
      />

      <CtaBand title="Give patients a portrait they can trust" cta="Generate my headshots" />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
