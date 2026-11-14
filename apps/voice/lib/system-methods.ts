export type PlatformMethod = {
  name: string;
  builtIn: string;
  steps: string[];
  verdict: string;
};

/**
 * What the operating system or a stock DAW can really do about vocals.
 * The steps below are the documented center-channel (phase-cancellation) workflow —
 * the only built-in technique that exists on a normal desktop. Phone platforms cannot
 * do it at all, which is stated plainly rather than invented.
 */
export const PLATFORMS: PlatformMethod[] = [
  {
    name: "Windows 11 / 10",
    builtIn:
      "Windows has no built-in vocal remover. Voice Recorder and Clipchamp can record, trim or change volume, but they cannot separate or cancel a vocal.",
    steps: [
      "Install Audacity from the official site (audacityteam.org). It is free and open source, but it is not bundled with Windows.",
      "Open your song as a stereo track (File → Open). Mono files have no center channel to cancel.",
      "Select the whole track (Ctrl+A), then open Effect → Vocal Reduction and Isolation.",
      "Choose Action: Remove Vocals, keep the default settings and apply.",
      "Check the result on headphones: centered bass and kick are usually removed together with the vocal.",
      "Export with File → Export Audio and choose MP3.",
    ],
    verdict:
      "Good for a rehearsal backing track. It cannot keep the low end and it cannot produce an acapella or stems.",
  },
  {
    name: "macOS",
    builtIn:
      "macOS ships GarageBand, but GarageBand has no phase-invert plug-in — so the bundled app alone cannot cancel a centered vocal. QuickTime Player can trim and export audio, not separate it.",
    steps: [
      "Open the song in GarageBand (bundled) if you only need to trim, split or adjust level — that works.",
      "GarageBand's EQ can notch 1–4kHz to reduce vocal presence, but it also thins guitars, cymbals and snare.",
      "For actual center cancellation, use Audacity (free, cross-platform) and follow the Windows steps above.",
      "Logic Pro (paid, not bundled) includes the Gain plug-in with Phase Invert: split stereo, invert one side, then sum to mono.",
      "Listen in mono afterwards — phase tricks can sound different when a phone speaker folds the mix down.",
    ],
    verdict:
      "Honest answer: macOS has no bundled vocal remover. GarageBand EQ is a partial workaround, not a separator.",
  },
  {
    name: "iPhone & iPad",
    builtIn:
      "iOS and iPadOS have no built-in vocal remover for your own files. GarageBand for iOS can record and arrange, but it has no phase-invert control. Apple Music's Sing feature can lower vocals on supported catalog songs, but it streams only and cannot export a separate audio file.",
    steps: [
      "Apple Music Sing: play a supported song, open the lyrics view and use the vocal slider to lower the vocal (Apple Music subscription required).",
      "There is no export: Sing is a playback feature, not a file tool, so it cannot give you a downloadable MP3 of the song.",
      "GarageBand for iOS can trim and arrange audio you import, but it cannot cancel or remove a vocal.",
      "iMovie can lower a clip's volume, not isolate a source.",
      "For real separation, open this site in Safari on the phone, or move the file to a Mac/PC and use a desktop method.",
    ],
    verdict:
      "Phones are for listening and file handling. No iOS feature produces stems or downloadable separate files.",
  },
  {
    name: "Android",
    builtIn:
      "Android has no system vocal remover. Files by Google, Google Photos and Google Drive can move or trim media, but none of them separate audio sources.",
    steps: [
      "Google Files and Drive can move the audio between apps, but cannot edit or separate it.",
      "Third-party Android 'karaoke' or 'vocal remover' apps usually run the same center-channel math and damage the mix.",
      "If an app asks you to upload the track to its server, read its privacy policy first — many keep files far longer than they say.",
      "For AI separation, open this site in Chrome on Android; the upload and download flow works in the browser.",
      "For manual phase cancellation, move the file to a desktop with Audacity.",
    ],
    verdict:
      "Android's built-in apps do not separate stems. Treat app-store vocal removers as phase filters unless they clearly run an AI model.",
  },
  {
    name: "DAW (Audacity, GarageBand, Logic Pro, REAPER)",
    builtIn:
      "Every DAW can perform center-channel cancellation manually if it supports channel splitting and phase inversion. This is the real built-in technique — no plug-in purchase required.",
    steps: [
      "Import the song as a stereo track and split it into two mono channels.",
      "Invert the phase (polarity) of one channel only.",
      "Sum both channels down to mono. Anything centered — usually the lead vocal — cancels out.",
      "In REAPER, use the item phase (polarity) button before summing; in Logic Pro, use the Gain plug-in's Phase Invert.",
      "Audacity's Effect → Vocal Reduction and Isolation automates the same math.",
      "Check the result on headphones: if the bass and kick vanished, the method worked as designed — that is its limit.",
    ],
    verdict:
      "Instant and offline, but the output is a mono backing track, not stems. There is no acapella and no preserved low end.",
  },
];

export type SystemMethodCopy = {
  intro: string;
  caveat: string;
};

const DEFAULT_COPY: SystemMethodCopy = {
  intro:
    "Before you compare AI separation with anything else, it helps to know exactly what your operating system and DAW can already do. Every platform below is limited to one real technique — center-channel cancellation — and phones cannot do even that.",
  caveat:
    "The built-in method is instant and offline, but it discards centered drums and bass and cannot produce stems or an acapella. AI separation reconstructs each instrument separately instead; the one-time $2.90 Trial Pack covers 15 minutes of that.",
};

const SYSTEM_METHOD_COPY: Record<string, SystemMethodCopy> = {
  "/ai-vocal-remover": {
    intro:
      "Your OS and DAW can already perform one kind of vocal removal: center-channel cancellation. Knowing what that built-in method actually does is the fairest way to judge what an AI model adds — and where it still fails.",
    caveat:
      "Built-in cancellation throws away centered drums and bass along with the vocal, and it cannot return an acapella or separate stems. The AI model estimates each source across the frequency range instead; the one-time $2.90 Trial Pack includes 15 minutes to compare on your own track.",
  },
  "/free-vocal-eliminator": {
    intro:
      "Most free vocal eliminators are built on this exact built-in method: phase-cancel the center of a stereo mix. Here are the real steps per platform, so you can see what a zero-cost result actually sounds like before deciding whether it is enough.",
    caveat:
      "This built-in method is genuinely useful for rehearsal, but it damages the music: centered bass and kick disappear and the output is mono. If you need a release-quality backing track, acapella or stems, AI separation is the step up — the $2.90 Trial Pack is the smallest paid way to test it.",
  },
  "/vocal-remover-online": {
    intro:
      "Before installing anything, it is worth knowing what your device already includes. No desktop OS ships a true vocal separator, and no phone OS ships one at all — here is the honest breakdown by platform.",
    caveat:
      "Desktop operating systems can only host the center-channel trick through an audio editor; phones cannot do it at all. A browser-based AI separator avoids installs entirely, and the $2.90 Trial Pack covers 15 minutes so you can test the result on your own file.",
  },
  "/remove-vocals-from-song": {
    intro:
      "Method 2 in this guide is the built-in method: center-channel cancellation. These are the real, documented steps for Windows, macOS, phones and DAWs — including where each platform simply does not offer the feature.",
    caveat:
      "The built-in method is fast, offline and free-of-charge, but it is not a separator: you get one mono vocal-free mix with the centered low end removed. For a mix that keeps the band intact — or an acapella on the side — use AI separation; the one-time $2.90 Trial Pack covers 15 minutes.",
  },
  "/acapella-maker": {
    intro:
      "This is the important limitation to understand before trying any built-in method: center-channel cancellation produces a vocal-free mix, not the acapella. It removes the vocal from the mix — there is no stock Windows, macOS, iOS, Android or DAW feature that extracts a vocal as its own file.",
    caveat:
      "Built-in tools cannot give you an acapella. The only way to get the vocal as a separate file is a stem-separation model; the $2.90 Trial Pack returns all four stems — vocals, drums, bass and other — in one run.",
  },
  "/karaoke-maker": {
    intro:
      "For a quick rehearsal backing track, the built-in center-channel method can be enough — and it is already on your desktop if you have any audio editor or DAW. Here is what each platform actually offers, with the real steps.",
    caveat:
      "A built-in karaoke attempt is mono, hollow and missing its centered bass and kick. AI separation keeps the full band across four stems and returns the vocals stem as an acapella for harmony practice; the one-time $2.90 Trial Pack covers 15 minutes — about five songs.",
  },
  "/separate-stems": {
    intro:
      "Built-in tools cannot produce stems. Windows, macOS, iOS, Android and every stock DAW offer at most a center-channel cancel — one mono vocal-free mix, not four separated files. Here is the honest platform-by-platform picture.",
    caveat:
      "If your goal is vocals, drums, bass and other as separate, time-aligned files, no built-in OS or DAW feature can do it. AI stem separation is what returns those four stems; the $2.90 Trial Pack includes 15 minutes and MP3 320 downloads.",
  },
};

export function getSystemMethodCopy(slug: string): SystemMethodCopy {
  return SYSTEM_METHOD_COPY[slug] ?? DEFAULT_COPY;
}

export const METHOD_SOURCES = [
  { label: "Audacity manual", href: "https://manual.audacityteam.org/" },
  { label: "Apple GarageBand", href: "https://www.apple.com/mac/garageband/" },
  { label: "Apple Logic Pro", href: "https://www.apple.com/logic-pro/" },
  { label: "REAPER", href: "https://www.reaper.fm/" },
  { label: "Demucs (Meta AI) on GitHub", href: "https://github.com/facebookresearch/demucs" },
  { label: "Replicate: cjwbw/demucs", href: "https://replicate.com/cjwbw/demucs" },
];
