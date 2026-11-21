import type { BrandStyle } from "@/lib/brands";
import { BRAND, brandForKind } from "@/lib/brands";
import type { FaqItem } from "@/lib/seo";

/**
 * Landing-page content for the styles that have a dedicated SEO page.
 * Only the three styles listed per brand are generated; the remaining style
 * (modern / blonde) keeps the in-page picker on the home page.
 *
 * Copy rules: describe what the AI edit does and where it stops. No invented
 * reviews, ratings, customer counts or fake before/after claims.
 */
export type StyleLandingPage = {
  /** Route slug; also the style id used by the Studio picker. */
  id: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string[];
  sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
  beforeImage: string;
  beforeLabel: string;
  afterLabel: string;
  faqs: FaqItem[];
  style: BrandStyle;
};

type Draft = Omit<StyleLandingPage, "style"> & { styleId: string };

function withStyle(draft: Draft): StyleLandingPage {
  // Both sets of drafts are declared in this module, but a build only ships one brand.
  // Resolve the style from the draft's own sample path so the unused set still validates.
  const kind = draft.beforeImage.includes("/hair/") ? "haircolor" : "landscape";
  const style = brandForKind(kind).styles.find((entry) => entry.id === draft.styleId);
  if (!style) throw new Error(`[style-pages] unknown style ${kind}/${draft.styleId}`);
  return { ...draft, style };
}

const LANDSCAPE_PAGES: StyleLandingPage[] = [
  withStyle({
    id: "japanese",
    styleId: "japanese",
    title: "Japanese Garden Design from a Photo — YardCanvas",
    description:
      "See a Japanese garden direction for your own yard — maples, moss, gravel and stone — from one photo. Four AI concepts for $9, one-time; design reference, not construction plans.",
    h1: "Japanese Garden Design from a Photo",
    eyebrow: "Landscape style · Japanese garden",
    intro: [
      "A Japanese garden is built on restraint: a small set of plants, stone and gravel arranged so the eye moves slowly instead of taking everything in at once. This page shows what that direction looks like on your own yard before you commit to a contractor.",
      "Upload one daylight photo, select Japanese garden in the tool, and the AI returns four concept images that keep your house, fence and camera angle fixed while suggesting planting, gravel and stonework.",
    ],
    sections: [
      {
        heading: "What this direction usually includes",
        paragraphs: [
          "The render leans toward the visual cues most people associate with Japanese gardens: layered greens, a restrained palette, gravel or stone ground cover, and one or two focal elements rather than a busy border. Exact species are visual suggestions, not a plant schedule — your climate zone, soil and drainage decide what will actually thrive.",
        ],
        bullets: [
          "Japanese maple, clipped pine or cloud-pruned shrubs as focal points.",
          "Moss, low ground cover and ferns in shaded areas.",
          "Raked gravel, stepping stones or natural stone instead of a lawn strip.",
          "A quiet palette: two or three green tones plus stone grey. No flower-heavy borders.",
        ],
      },
      {
        heading: "What the AI edit will and will not change",
        paragraphs: [
          "The prompt instructs the model to keep the architecture, roof, windows, driveway, property boundaries and camera angle unchanged, and to redesign only the planting, lawn, hardscape and lighting. Results are still estimates: small details can move, and a render can invent a path or planter that is not practical on your site.",
          "The concept is a design reference for a conversation with a landscaper. It is not a construction drawing, planting plan, irrigation design, permit document or cost estimate. A local professional has to check grading, access and what will survive your winters or dry season.",
        ],
      },
      {
        heading: "How to get a useful concept from your photo",
        paragraphs: [
          "Use a wide, evenly lit photo that shows the house and the area you want to change. Remove cars and bins from the frame if you can, and avoid photos where the yard is mostly shadow. One pack covers one photo and one style; if you want to compare Japanese with a low-water direction, buy a second pack.",
        ],
      },
    ],
    beforeImage: "/samples/landscape/yard-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Japanese garden concept",
    faqs: [
      {
        q: "Can the AI design a Japanese garden for my yard?",
        a: "It produces a visual concept from your photo, not a horticultural design. It can show the mood, materials and planting density of the direction, but a local landscape professional should confirm species, drainage, irrigation and permits for your site.",
      },
      {
        q: "Will the render keep my house?",
        a: "The prompt keeps the architecture and camera angle fixed and changes the landscaping. AI editing is not perfect, so check each concept: if the building is altered or a structure is invented, request a re-run or use the refund policy if the delivery is unusable.",
      },
      {
        q: "What plants will the concepts show?",
        a: "Expect maples, clipped evergreens, moss and low ground cover as visual suggestions. The model does not know your hardiness zone or soil, so treat the planting as a starting point. A local nursery or landscaper can tell you what is appropriate.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "One pack is $9, one-time, for four concept images from one photo and one style. There is no free trial and no subscription; refunds or re-runs are available if the delivery fails or the images are unusable.",
      },
    ],
  }),
  withStyle({
    id: "cottage",
    styleId: "cottage",
    title: "Cottage Garden Design from a Photo — YardCanvas",
    description:
      "Preview a cottage garden direction on your own yard: layered perennials, soft curved beds and warm colour. Four AI concepts for $9, one-time; design reference, not a planting plan.",
    h1: "Cottage Garden Design from a Photo",
    eyebrow: "Landscape style · Cottage garden",
    intro: [
      "Cottage gardens are friendlier than they look: soft edges, layered perennials and colour packed into a small space, with a structure underneath so the bed does not collapse into a weedy mess. This page shows that direction on your own yard.",
      "Upload a daylight photo, pick Cottage garden, and the AI suggests four variations that keep your house and boundaries in place while changing beds, paths and planting.",
    ],
    sections: [
      {
        heading: "What this direction usually includes",
        paragraphs: [
          "The render aims for a layered, lived-in border rather than a formal grid: curved bed edges, a mix of heights and a warm colour range, with a path or seating area that makes the space usable. Plant names in the image are visual references, not a shopping list.",
        ],
        bullets: [
          "Layered perennials with summer colour: roses, lavender, salvia, daisies.",
          "Soft, curved bed edges instead of straight clipped lines.",
          "A gravel or flagstone path and a small seating spot.",
          "Warm, slightly loose planting rather than a minimalist palette.",
        ],
      },
      {
        heading: "The maintenance reality",
        paragraphs: [
          "Cottage planting is not low-maintenance: dense perennials need division, watering and deadheading to keep the shape you see in a render. If you want a garden that looks after itself, mention that to a designer or compare with the low-water direction.",
          "The AI image does not calculate watering, soil preparation, plant costs or seasonal timing. Use the concept to agree on a look with your landscaper, not as a maintenance-free promise.",
        ],
      },
      {
        heading: "What the AI edit can and cannot do",
        paragraphs: [
          "The edit keeps the architecture and camera angle fixed and changes planting, lawn, paths and lighting. It may add or move hardscape details; those are suggestions, and a contractor has to confirm levels, access and utility lines before work starts.",
          "One pack covers one photo and one style. If you want to compare a cottage direction with a modern or Japanese garden, use a second pack rather than trying to read four directions out of one render.",
        ],
      },
    ],
    beforeImage: "/samples/landscape/yard-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Cottage garden concept",
    faqs: [
      {
        q: "Will a cottage garden work on a small front garden?",
        a: "The concept can show dense planting in a small bed, but the output is a picture, not a layout. For a narrow front garden, ask a local designer to check sightlines, access paths and how much sun the bed actually receives.",
      },
      {
        q: "Does the AI know which plants survive in my climate?",
        a: "No. The model generates a plausible planting image; it does not check your hardiness zone, soil or rainfall. Treat species in the render as visual suggestions and confirm them with a nursery or landscape professional.",
      },
      {
        q: "Will it keep my house and path?",
        a: "The prompt keeps the architecture and camera angle fixed, but small hardscape details can shift. Check each result; if the house is altered in every image, request a re-run or use the refund policy.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "The cottage-garden style is included in the same $9 one-time pack: four concepts from one photo and one style. There is no free trial or subscription; failed or unusable deliveries are covered by the refund/re-run policy.",
      },
    ],
  }),
  withStyle({
    id: "lowwater",
    styleId: "lowwater",
    title: "Low-Water Native Landscape Design from a Photo — YardCanvas",
    description:
      "See a low-water, native-style landscape direction on your yard: drought-tolerant grasses, gravel and boulders. Four AI concepts for $9, one-time; a design reference, not an irrigation plan.",
    h1: "Low-Water Native Landscape Design from a Photo",
    eyebrow: "Landscape style · Low-water / native",
    intro: [
      "A low-water garden is not a gravel yard with three cacti. It is a planting strategy built around local rainfall, soil and drainage, with plants that survive dry spells without constant irrigation. This page previews that direction on your own photo.",
      "Upload a daylight photo, choose Low-water / native, and the AI returns four concepts that keep the house in place while replacing lawn and thirsty beds with drier planting and hardscape.",
    ],
    sections: [
      {
        heading: "What this direction usually includes",
        paragraphs: [
          "The visual language is dry-climate modern: grouped drought-tolerant grasses, succulents or natives, gravel mulch and boulders, with a clear path and fewer lawn areas. The image can help you decide whether that look suits the house, but it cannot tell you which species are native to your region.",
        ],
        bullets: [
          "Clumped ornamental grasses and drought-tolerant perennials.",
          "Gravel mulch or permeable paving instead of a large lawn.",
          "Boulders and sculptural plants as focal points.",
          "Drip irrigation or hand watering rather than sprinklers.",
        ],
      },
      {
        heading: "What the render cannot decide",
        paragraphs: [
          "The AI does not test your soil, slope or drainage, and it does not calculate water use. A low-water design can fail if the soil holds water or if the plants are not adapted to your region. A local landscape professional or native-plant nursery should check the plant list, grading and irrigation plan.",
          "The image is a mood and direction reference. It is not an irrigation design, a planting schedule, a rebate application or a construction document.",
        ],
      },
      {
        heading: "How to use this concept well",
        paragraphs: [
          "Compare the low-water direction with your current yard at the same camera angle, then use the render to explain what you want: less lawn, more gravel, grouped plants. One pack covers one photo and one style; buy a second pack if you also want to compare a cottage or Japanese direction.",
        ],
      },
    ],
    beforeImage: "/samples/landscape/yard-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Low-water concept",
    faqs: [
      {
        q: "Can this design a drought-tolerant garden for my area?",
        a: "It can show the visual direction from your photo, but it does not know your hardiness zone, rainfall or soil. Use the render as a briefing image and have a local native-plant specialist confirm the actual species and irrigation approach.",
      },
      {
        q: "Does low-water mean no maintenance?",
        a: "No. Low-water planting usually needs less irrigation once established, but it still needs weed control, pruning and seasonal checks. The render does not include a maintenance plan or water-use calculation.",
      },
      {
        q: "Are the plant species in the image accurate?",
        a: "They are visual suggestions, not a verified plant list. Treat them as references for shape and texture, and replace them with species that suit your climate and soil.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "The low-water style uses the same $9 one-time pack: four concepts from one photo and one style, no subscription and no free trial. Failed or unusable deliveries are covered by the refund/re-run policy.",
      },
    ],
  }),
];

const HAIR_PAGES: StyleLandingPage[] = [
  withStyle({
    id: "copper",
    styleId: "copper",
    title: "Copper / Auburn Hair Colour Try-On — HueMirror",
    description:
      "Preview copper and auburn shades on your own selfie with a face-preserving AI edit. Four looks for $4.90, one-time; a salon reference, not a guarantee of the dye result.",
    h1: "Copper / Auburn Hair Colour Try-On",
    eyebrow: "Hair colour · Copper / auburn",
    intro: [
      "Copper is the easiest way to add warmth without going full red, but it is also unforgiving: the same shade reads orange in daylight and brown indoors, and the result depends heavily on your starting level. This page previews that shade family on your own selfie.",
      "Upload a front-facing photo, choose Copper / auburn, and the AI returns four looks that keep your face, expression, haircut and background fixed while changing the hair colour.",
    ],
    sections: [
      {
        heading: "What the copper / auburn family usually means",
        paragraphs: [
          "Copper sits between orange and red; auburn is the deeper, browner end of the same family. In a salon this often means a warm reflect on a brown base, or a full copper formula on lighter hair. The render shows the visual target, not the formula.",
        ],
        bullets: [
          "Warm copper, burnt orange or soft auburn tones.",
          "Natural dimension with a slightly darker root area.",
          "Four lighting variations so you can see warm and cooler reads.",
          "Face, haircut and background preserved by the edit instructions.",
        ],
      },
      {
        heading: "What the AI cannot tell you about the process",
        paragraphs: [
          "A photo edit does not lift your hair, test your porosity or know what colour is already on it. Copper usually needs a lift or a careful fill, especially on dark or previously coloured hair, and the final result depends on your stylist's formula and your aftercare.",
          "Use the preview as a reference in the salon chair. It shows the direction you like; your stylist decides what is achievable in one session without damaging the hair.",
        ],
      },
      {
        heading: "How to use the preview",
        paragraphs: [
          "Compare the four looks at realistic screen brightness, then pick the one that still feels right in the least flattering light. One pack covers one selfie and one shade family; if you want to compare copper with blue-black or pastel, use a second pack.",
        ],
      },
    ],
    beforeImage: "/samples/hair/selfie-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Copper look",
    faqs: [
      {
        q: "Will the copper preview look exactly like my salon result?",
        a: "No. The edit is a visual reference generated from one photo; the real result depends on your starting colour, hair history, formula and aftercare. It helps the conversation with your stylist, but it is not a guarantee.",
      },
      {
        q: "Does the AI keep my face the same?",
        a: "The prompt preserves the face, expression, haircut, clothing and background, and changes only the hair colour. Small artifacts can still happen; check each look and do not rely on it as a photo of a real salon service.",
      },
      {
        q: "Is copper a good colour for my skin tone?",
        a: "The tool does not do colour analysis. It shows one or more copper variants on your photo; whether a shade suits you is a judgement you and your stylist should make in person under your own lighting.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "One pack is $4.90, one-time, for four looks from one selfie and one shade family. There is no free trial or subscription, and failed or unusable deliveries are covered by the refund/re-run policy.",
      },
    ],
  }),
  withStyle({
    id: "black",
    styleId: "black",
    title: "Blue-Black Hair Colour Try-On — HueMirror",
    description:
      "Preview a cool blue-black shade on your own selfie with a face-preserving AI edit. Four looks for $4.90, one-time; a reference for your stylist, not a promise of the dye result.",
    h1: "Blue-Black Hair Colour Try-On",
    eyebrow: "Hair colour · Blue-black",
    intro: [
      "Blue-black is not just dark brown with a trendy name: it is a cool, deep black with a blue or violet reflect that reads almost glassy in the right light. This page previews that shade on your own face before you book a salon appointment.",
      "Upload a front-facing selfie, choose Blue-black, and the AI returns four looks while preserving your face, expression, haircut and background.",
    ],
    sections: [
      {
        heading: "What the blue-black family usually means",
        paragraphs: [
          "It is a black base with a cool reflect, often described as jet black, blue-black or soft black depending on how much blue is visible. On dark hair it can be a subtle depth change; on lighter hair it is a dramatic shift and may need a two-step process.",
        ],
        bullets: [
          "Deep black base with a cool blue or violet reflect.",
          "Soft shine and visible dimension rather than a flat matte black.",
          "Four lighting variants so you can see the reflect at different angles.",
          "Face, haircut and background preserved by the edit instructions.",
        ],
      },
      {
        heading: "What the edit cannot predict",
        paragraphs: [
          "The render cannot tell you how your hair will take a black dye, whether a blue reflect will show on your starting level, or how the colour will fade. Black is also hard to remove, so the decision is worth a real conversation with a stylist who can see your hair in person.",
          "Treat the four looks as a reference for depth and reflect. They are not a photo of a real service and not a guarantee of how the colour will process on your hair.",
        ],
      },
      {
        heading: "How to use the preview",
        paragraphs: [
          "Look at the least contrasty of the four images first — that is often closer to how a dark shade reads on an average day. One pack covers one selfie and one shade family; compare with copper or pastel using another pack.",
        ],
      },
    ],
    beforeImage: "/samples/hair/selfie-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Blue-black look",
    faqs: [
      {
        q: "Will blue-black look natural on me?",
        a: "It depends on your starting colour, skin tone and the light you are usually seen in. The preview shows one possible read; your stylist can compare it with your natural colour and recommend a softer or deeper black.",
      },
      {
        q: "Can I go from blonde to blue-black in one appointment?",
        a: "That is a colourist decision. A big jump in depth can usually be done in one session, but the condition of the hair and the desired reflect matter. Ask a professional rather than relying on the render.",
      },
      {
        q: "Will the AI keep my face and haircut?",
        a: "The prompt preserves the face, expression, haircut and background and changes only the hair colour. Small artifacts can still happen; if every output distorts the face, request a re-run or a refund under the delivery policy.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "One pack is $4.90, one-time, for four looks from one selfie and one shade family. There is no free trial or subscription; failed or unusable deliveries are covered by the refund/re-run policy.",
      },
    ],
  }),
  withStyle({
    id: "pastel",
    styleId: "pastel",
    title: "Pastel / Fashion Hair Colour Try-On — HueMirror",
    description:
      "Preview a pastel or fashion hair colour on your own selfie: rose, lilac or mint. Four face-preserving AI looks for $4.90, one-time; a mood reference, not a dye guarantee.",
    h1: "Pastel / Fashion Hair Colour Try-On",
    eyebrow: "Hair colour · Pastel / fashion",
    intro: [
      "Pastel hair is a look you usually see on a stage or a shoot, not in a salon mirror on a Tuesday. It is also the shade family that depends most on preparation: most pastel results need pre-lightened hair first. This page previews the direction on your own selfie.",
      "Upload a front-facing photo, choose Pastel / fashion, and the AI returns four looks with rose, lilac or mint tones while keeping your face, expression, haircut and background fixed.",
    ],
    sections: [
      {
        heading: "What the pastel / fashion family usually means",
        paragraphs: [
          "These are low-saturation fashion shades — rose, lilac, mint, soft blue — that read clearly as colour rather than a natural tone. The render shows the final direction; it does not show the lightening, toning and maintenance that usually sit behind it.",
        ],
        bullets: [
          "Soft rose, lilac, mint or blue pastel tones.",
          "Visible dimension rather than a flat block of colour.",
          "Four lighting variants so you can see how the shade shifts.",
          "Face, haircut and background preserved by the edit instructions.",
        ],
      },
      {
        heading: "The honest caveats",
        paragraphs: [
          "Most pastel colour needs pre-lightening, and the result depends on how light your hair is lifted, its condition and how the toner takes. Pastel also fades faster than natural shades and usually needs more frequent salon visits. None of that is visible in a photo render.",
          "This is a visual reference for a conversation with a colourist, not a promise that the shade is achievable in one session or that it will suit your hair's condition. The tool does not give colour or damage advice.",
        ],
      },
      {
        heading: "How to use the preview",
        paragraphs: [
          "Use the render to choose a direction — cool lilac versus warm rose, for example — and show it to a colourist who can tell you what your starting level allows. One pack covers one selfie and one shade family; compare with copper or blue-black using another pack.",
        ],
      },
    ],
    beforeImage: "/samples/hair/selfie-before.jpg",
    beforeLabel: "Before",
    afterLabel: "Pastel look",
    faqs: [
      {
        q: "Can I get a pastel result without bleaching?",
        a: "Usually not on dark hair. Pastel shades rely on a light base, so most colourists will need to pre-lighten first. The render shows the target colour, not the process or the condition of your hair afterwards.",
      },
      {
        q: "Will the pastel preview look like my final colour?",
        a: "It is a visual reference, not a guarantee. The real result depends on your starting level, the toner formula, your hair's porosity and how the colour fades. Ask your colourist what is realistic for your hair.",
      },
      {
        q: "Does the AI keep my face and haircut?",
        a: "The prompt preserves the face, expression, haircut and background and changes only the hair colour. Small artifacts can still happen; if the outputs distort your face, request a re-run or a refund under the delivery policy.",
      },
      {
        q: "How much does it cost and is there a trial?",
        a: "One pack is $4.90, one-time, for four looks from one selfie and one shade family. There is no free trial or subscription, and failed or unusable deliveries are covered by the refund/re-run policy.",
      },
    ],
  }),
];

export const STYLE_PAGES: StyleLandingPage[] = BRAND.kind === "haircolor" ? HAIR_PAGES : LANDSCAPE_PAGES;

export function getStylePage(slug: string): StyleLandingPage | undefined {
  return STYLE_PAGES.find((page) => page.id === slug);
}

export function hasStylePage(styleId: string): boolean {
  return STYLE_PAGES.some((page) => page.id === styleId);
}

/** Home-page style card href: landing page when one exists, in-page picker otherwise. */
export function stylePageHref(styleId: string): string {
  return hasStylePage(styleId) ? `/styles/${styleId}` : "#studio";
}
