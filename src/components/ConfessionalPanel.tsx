"use client";

import { Confessional } from "@/types";
import { INITIAL_CHARACTERS } from "@/data/characters";
import { formatDistanceToNow } from "date-fns";

interface ConfessionalPanelProps {
  confessionals: Confessional[];
}

export function ConfessionalPanel({ confessionals }: ConfessionalPanelProps) {
  if (confessionals.length === 0) {
    return null;
  }

  // Only show most recent confessional
  const latest = confessionals[0];
  const character = INITIAL_CHARACTERS.find((c) => c.id === latest.characterId);

  if (!character) return null;

  const timeAgo = formatDistanceToNow(new Date(latest.timestamp), {
    addSuffix: false,
  });

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="w-10 h-10 rounded-full bg-zinc-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">
              {character.name}
            </span>
            <span className="text-[10px] text-zinc-600">•</span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-zinc-300 mt-1 italic leading-relaxed">
            &ldquo;{latest.content}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
