"use client";

import { Character } from "@/types";
import { CHARACTER_PROFILES } from "@/data/characters";
import { getCharacterName } from "@/data/characters";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const profile = CHARACTER_PROFILES[character.id];
  const hasPartner = character.currentPartner;
  
  // Extract age and job from background
  const backgroundMatch = profile?.background.match(/A (\d+)-year-old ([^.]+)/);
  const age = backgroundMatch?.[1] || "26";
  const occupation = backgroundMatch?.[2]?.split(" from ")[0] || "Islander";

  // Get who they're most attracted to
  const topAttraction = Object.entries(character.emotionalState.attraction)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-[#104547]/20 hover:bg-[#104547]/30 border border-[#4B5358]/30 hover:border-[#4B5358]/50 rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-16 h-16 rounded-2xl bg-[#4B5358]/30 ring-1 ring-[#4B5358]/50"
          />
          {hasPartner && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#AF929D] ring-2 ring-[#0a0a0a] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name and age */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#D2D6EF] tracking-tight">
              {character.name}
            </h3>
            <span className="text-[#727072] text-sm font-light">{age}</span>
          </div>

          {/* Occupation */}
          <p className="text-sm text-[#AF929D] mt-0.5 font-light">
            {occupation}
          </p>

          {/* Tagline */}
          {profile?.tagline && (
            <p className="text-xs text-[#727072] mt-2 italic line-clamp-1">
              {profile.tagline}
            </p>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2">
            {hasPartner && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#AF929D]/10 text-[#AF929D] font-medium">
                with {getCharacterName(hasPartner)}
              </span>
            )}
            {topAttraction && topAttraction[1] > 55 && !hasPartner && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#104547]/30 text-[#D2D6EF]/70 font-medium">
                eyes on {getCharacterName(topAttraction[0])}
              </span>
            )}
          </div>
        </div>

        {/* Right side arrow */}
        <div className="shrink-0 flex items-center">
          <div className="text-[#4B5358] group-hover:text-[#727072] group-hover:translate-x-0.5 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
