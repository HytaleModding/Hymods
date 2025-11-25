// src/data/tags.ts
import {
  BookOpen, // Library
  Zap, // Optimization
  Palette, // Decoration
  Wrench, // Utility
  Settings2, // Management
  Compass, // Adventure
  Route, // Transportation
  PawPrint, // Mobs
  Apple, // Food
  Gamepad2, // Game Mechanics / Gameplay
  Cpu, // Technology
  Mountain, // World Generation / Worldgen
  Skull, // Cursed
  Swords, // Equipment / Combat
  Medal, // Minigame
  DollarSign, // Economy
  Archive, // Storage
  Wand2, // Magic
  LayoutGrid, // UI
  Brain, // AI
  Sparkles, // Graphics / Animation
  Gauge, // Performance
  Network, // Systems
  Leaf, // Environment
  Users, // Social
  ShieldCheck, // Moderation
  ScrollText, // RPG
  Shield, // Protection
  Footprints, // Movement
  Hammer, // Tools
  Music2, // Audio
  Server, // Server (used in your JSON)
} from "lucide-vue-next";

export const TAGS = {
  Adventure: { label: "Adventure", icon: Compass },
  Cursed: { label: "Cursed", icon: Skull },
  Decoration: { label: "Decoration", icon: Palette },
  Food: { label: "Food", icon: Apple },
  "Game Mechanics": { label: "Game Mechanics", icon: Gamepad2 },
  Library: { label: "Library", icon: BookOpen },
  Management: { label: "Management", icon: Settings2 },
  Mobs: { label: "Mobs", icon: PawPrint },
  Optimization: { label: "Optimization", icon: Zap },
  Technology: { label: "Technology", icon: Cpu },
  Transportation: { label: "Transportation", icon: Route },
  Utility: { label: "Utility", icon: Wrench },
  "World Generation": { label: "World Generation", icon: Mountain },
  Equipment: { label: "Equipment", icon: Swords },
  Minigame: { label: "Minigame", icon: Medal },
  Economy: { label: "Economy", icon: DollarSign },
  Storage: { label: "Storage", icon: Archive },
  Magic: { label: "Magic", icon: Wand2 },
  Gameplay: { label: "Gameplay", icon: Gamepad2 },
  UI: { label: "UI", icon: LayoutGrid },
  Combat: { label: "Combat", icon: Swords },
  AI: { label: "AI", icon: Brain },
  Graphics: { label: "Graphics", icon: Sparkles },
  Performance: { label: "Performance", icon: Gauge },
  Systems: { label: "Systems", icon: Network },
  Environment: { label: "Environment", icon: Leaf },
  Social: { label: "Social", icon: Users },
  Moderation: { label: "Moderation", icon: ShieldCheck },
  RPG: { label: "RPG", icon: ScrollText },
  Protection: { label: "Protection", icon: Shield },
  Animation: { label: "Animation", icon: Sparkles },
  Movement: { label: "Movement", icon: Footprints },
  Tools: { label: "Tools", icon: Hammer },
  Audio: { label: "Audio", icon: Music2 },
  Server: { label: "Server", icon: Server },
  Worldgen: { label: "Worldgen", icon: Mountain },
  Utilities: { label: "Utilities", icon: Wrench },
} as const;

// tag key type (union of all keys in TAGS)
export type TagKey = keyof typeof TAGS;

// common shape for a tag
export type TagInfo = {
  label: string;
  icon: any | null;
};

// provides a safe fallback so UI never breaks
const DEFAULT_TAG: TagInfo = {
  label: "Tag",
  icon: null,
};

/**
 * Get full tag info (label + icon). Falls back to {label, null} if missing.
 */
export function getTagInfo(tag: string): TagInfo {
  const key = tag as TagKey;
  const info = (TAGS as Record<string, TagInfo>)[key];
  if (info) return info;

  // if tag isn't registered yet, still show its text
  return { ...DEFAULT_TAG, label: tag, icon: null };
}

/**
 * Get only the icon component (or null if missing).
 */
export function getTagIcon(tag: string): any | null {
  return getTagInfo(tag).icon;
}

/**
 * Get a sorted list of all known tag labels.
 * Useful for suggestions/autocomplete.
 */
export function getAllTagLabels(): string[] {
  return Object.keys(TAGS).sort();
}
