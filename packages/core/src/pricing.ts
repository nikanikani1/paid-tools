import type { HeadshotPlan, VoicePlan } from "./types";

export const VOICE_PLANS: VoicePlan[] = [
  {
    id: "voice-free",
    name: "Free",
    price: 0,
    minutes: 3,
    billing: "monthly",
    features: ["3 minutes total", "2 stems (vocals + instrumental)", "MP3 320kbps", "No signup"],
  },
  {
    id: "voice-starter",
    name: "Starter",
    price: 5,
    minutes: 90,
    billing: "monthly",
    features: ["90 minutes / month", "4 stems (vocals, drums, bass, other)", "WAV + MP3", "Batch upload", "No watermark"],
    popular: true,
  },
  {
    id: "voice-pro",
    name: "Pro",
    price: 9,
    minutes: 200,
    billing: "monthly",
    features: ["200 minutes / month", "4 + 6 stems", "High quality model", "Priority queue", "Commercial license"],
  },
  {
    id: "voice-annual",
    name: "Starter Annual",
    price: 39,
    minutes: 90,
    billing: "annual",
    features: ["90 minutes / month", "Billed $39/year", "Save 35%", "4 stems", "Priority support"],
  },
];

export const HEADSHOT_PLANS: HeadshotPlan[] = [
  {
    id: "headshot-40",
    name: "Starter",
    price: 35,
    images: 40,
    features: ["40 headshots", "2 outfits", "2 backgrounds", "1 free redo", "Commercial use"],
  },
  {
    id: "headshot-60",
    name: "Professional",
    price: 45,
    images: 60,
    features: ["60 headshots", "4 outfits", "4 backgrounds", "1 free redo", "Premium resolution"],
    popular: true,
  },
  {
    id: "headshot-100",
    name: "Executive",
    price: 75,
    images: 100,
    features: ["100 headshots", "All outfits", "All backgrounds", "Enhanced resolution", "Priority delivery"],
  },
];

export const FREE_VOICE_MINUTES = 3;
export const FREE_HEADSHOT_PREVIEWS = 1;
