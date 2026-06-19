import type { CapsuleSession } from "@/lib/types";

export type CapsuleNode = CapsuleSession & {
  theme: string;
  summary: string;
  cluster: string;
  x: number;
  y: number;
  links: string[];
};

export const seedCapsules: CapsuleNode[] = [
  {
    id: "sample-capsule",
    title: "Capsule - 2026-06-19",
    createdAt: "2026-06-19T12:00:00.000Z",
    durationSec: 420,
    theme: "Hopeful / reflective",
    summary: "Built during a hackathon with a focus on voice, memory, and family.",
    cluster: "founder",
    x: 22,
    y: 26,
    links: ["grandma-story", "future-self-note"]
  },
  {
    id: "grandma-story",
    title: "Grandma Story Session",
    createdAt: "2026-05-02T17:45:00.000Z",
    durationSec: 812,
    theme: "Family history",
    summary: "Stories about migration, food, and what should be remembered.",
    cluster: "family",
    x: 58,
    y: 22,
    links: ["sample-capsule", "kitchen-memory"]
  },
  {
    id: "future-self-note",
    title: "Future Self Note",
    createdAt: "2026-06-01T08:10:00.000Z",
    durationSec: 265,
    theme: "Ambition",
    summary: "A message to the version of you who makes it through the hard part.",
    cluster: "founder",
    x: 34,
    y: 62,
    links: ["sample-capsule", "voice-test"]
  },
  {
    id: "kitchen-memory",
    title: "Kitchen Memory",
    createdAt: "2026-04-14T18:20:00.000Z",
    durationSec: 501,
    theme: "Home / comfort",
    summary: "Small details about meals, rituals, and the feeling of being together.",
    cluster: "family",
    x: 72,
    y: 56,
    links: ["grandma-story"]
  },
  {
    id: "voice-test",
    title: "Voice Preservation Test",
    createdAt: "2026-06-10T15:30:00.000Z",
    durationSec: 184,
    theme: "Preservation",
    summary: "A shorter session focused on preserving tone, rhythm, and voice texture.",
    cluster: "lab",
    x: 86,
    y: 38,
    links: ["future-self-note"]
  }
];
