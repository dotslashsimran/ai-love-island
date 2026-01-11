import { Character } from "@/types";

// The six fixed characters - never add or remove
export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "ayla",
    name: "Ayla",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=ayla&backgroundColor=ffd5dc",
    personality: {
      attachment: 85,
      novelty: 40,
      trustBias: 70,
      volatility: 55,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { miro: 45, sena: 30, ravi: 55, luna: 25, tariq: 40 },
      trust: { miro: 50, sena: 45, ravi: 60, luna: 40, tariq: 50 },
      jealousy: { miro: 10, sena: 15, ravi: 5, luna: 20, tariq: 10 },
      security: 50,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "miro",
    name: "Miro",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=miro&backgroundColor=c0d4e8",
    personality: {
      attachment: 35,
      novelty: 25,
      trustBias: 40,
      volatility: 20,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 50, sena: 35, ravi: 20, luna: 45, tariq: 25 },
      trust: { ayla: 55, sena: 40, ravi: 50, luna: 35, tariq: 55 },
      jealousy: { ayla: 5, sena: 10, ravi: 5, luna: 15, tariq: 5 },
      security: 65,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "sena",
    name: "Sena",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=sena&backgroundColor=ffe4c9",
    personality: {
      attachment: 45,
      novelty: 90,
      trustBias: 60,
      volatility: 50,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 55, miro: 40, ravi: 60, luna: 50, tariq: 65 },
      trust: { ayla: 50, miro: 45, ravi: 55, luna: 45, tariq: 40 },
      jealousy: { ayla: 10, miro: 5, ravi: 10, luna: 15, tariq: 5 },
      security: 55,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "ravi",
    name: "Ravi",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=ravi&backgroundColor=d4e8c0",
    personality: {
      attachment: 75,
      novelty: 20,
      trustBias: 80,
      volatility: 15,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 60, miro: 30, sena: 55, luna: 40, tariq: 25 },
      trust: { ayla: 65, miro: 55, sena: 50, luna: 45, tariq: 60 },
      jealousy: { ayla: 15, miro: 5, sena: 20, luna: 10, tariq: 5 },
      security: 70,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "luna",
    name: "Luna",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=luna&backgroundColor=e8c0e4",
    personality: {
      attachment: 70,
      novelty: 60,
      trustBias: 45,
      volatility: 90,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 35, miro: 70, sena: 45, ravi: 50, tariq: 55 },
      trust: { ayla: 40, miro: 50, sena: 35, ravi: 55, tariq: 45 },
      jealousy: { ayla: 25, miro: 30, sena: 35, ravi: 15, tariq: 20 },
      security: 35,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "tariq",
    name: "Tariq",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=tariq&backgroundColor=c9c9c9",
    personality: {
      attachment: 55,
      novelty: 30,
      trustBias: 55,
      volatility: 25,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 45, miro: 25, sena: 50, ravi: 30, luna: 60 },
      trust: { ayla: 50, miro: 55, sena: 45, ravi: 60, luna: 40 },
      jealousy: { ayla: 10, miro: 5, sena: 15, ravi: 5, luna: 25 },
      security: 60,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
];

export const CHARACTER_IDS = ["ayla", "miro", "sena", "ravi", "luna", "tariq"] as const;
export type CharacterId = typeof CHARACTER_IDS[number];

export function getCharacterName(id: string): string {
  const char = INITIAL_CHARACTERS.find(c => c.id === id);
  return char?.name ?? id;
}
