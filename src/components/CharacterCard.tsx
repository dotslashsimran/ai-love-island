"use client";

import { Character } from "@/types";

interface CharacterCardProps {
  character: Character;
  allCharacters: Character[];
  onClick?: () => void;
}

export function CharacterCard({ character, allCharacters, onClick }: CharacterCardProps) {
  const partner = character.currentPartner
    ? allCharacters.find((c) => c.id === character.currentPartner)
    : null;

  // Calculate dominant emotion for subtle indicator
  const maxAttraction = Math.max(...Object.values(character.emotionalState.attraction));
  const maxJealousy = Math.max(...Object.values(character.emotionalState.jealousy));
  const avgTrust =
    Object.values(character.emotionalState.trust).reduce((a, b) => a + b, 0) /
    Object.values(character.emotionalState.trust).length;

  // Determine emotional indicator
  let indicator = "";
  let indicatorColor = "bg-zinc-600";

  if (maxJealousy > 60) {
    indicator = "unsettled";
    indicatorColor = "bg-amber-500/60";
  } else if (maxAttraction > 75) {
    indicator = "drawn";
    indicatorColor = "bg-rose-500/60";
  } else if (character.emotionalState.security > 70) {
    indicator = "secure";
    indicatorColor = "bg-emerald-500/60";
  } else if (avgTrust < 40) {
    indicator = "guarded";
    indicatorColor = "bg-zinc-500/60";
  }

  return (
    <div 
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-16 h-16 rounded-full bg-zinc-800 group-hover:ring-2 group-hover:ring-zinc-700 transition-all"
          />
          {indicator && (
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${indicatorColor} border-2 border-zinc-900`}
              title={indicator}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-zinc-100">{character.name}</h3>
            <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </span>
          </div>
          
          {partner ? (
            <p className="text-sm text-zinc-400 mt-1">
              with <span className="text-zinc-300">{partner.name}</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-500 mt-1">unattached</p>
          )}

          {/* Subtle emotional bars */}
          <div className="mt-3 space-y-1.5">
            <EmotionalBar
              label="security"
              value={character.emotionalState.security}
              color="bg-zinc-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmotionalBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-zinc-600 w-14">
        {label}
      </span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
