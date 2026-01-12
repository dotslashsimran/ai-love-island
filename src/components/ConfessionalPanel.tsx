"use client";

import { Confessional } from "@/types";
import { INITIAL_CHARACTERS } from "@/data/characters";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface ConfessionalPanelProps {
  confessionals: Confessional[];
}

export function ConfessionalPanel({ confessionals }: ConfessionalPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-cycle through confessionals every 8 seconds
  useEffect(() => {
    if (confessionals.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(confessionals.length, 5));
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [confessionals.length]);

  if (confessionals.length === 0) {
    return (
      <div className="bg-[#104547]/20 border border-[#4B5358]/30 border-dashed rounded-xl p-6 text-center">
        <div className="text-[#727072] text-sm">The confessional booth awaits its first visitor.</div>
      </div>
    );
  }

  const current = confessionals[currentIndex];
  const character = INITIAL_CHARACTERS.find((c) => c.id === current?.characterId);

  if (!character || !current) return null;

  const timeAgo = formatDistanceToNow(new Date(current.timestamp), {
    addSuffix: false,
  });

  return (
    <div className="bg-gradient-to-r from-[#104547]/30 via-[#104547]/20 to-[#104547]/30 border border-[#4B5358]/30 rounded-xl p-4 relative overflow-hidden">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#AF929D]/10 to-transparent" />
      
      {/* Confessional label */}
      <div className="absolute top-2 right-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#AF929D] animate-pulse" />
        <span className="text-[9px] uppercase tracking-widest text-[#727072]">Confessional</span>
      </div>

      <div className={`flex items-start gap-3 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="w-12 h-12 rounded-xl bg-[#4B5358]/30 shrink-0 ring-2 ring-[#4B5358]/30"
        />
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#D2D6EF]">
              {character.name}
            </span>
            <span className="text-[10px] text-[#4B5358] uppercase tracking-wider">
              {timeAgo} ago
            </span>
          </div>
          <p className="text-sm text-[#AF929D] mt-2 italic leading-relaxed">
            &ldquo;{current.content}&rdquo;
          </p>
        </div>
      </div>

      {/* Pagination dots */}
      {confessionals.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {confessionals.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-[#AF929D]' : 'bg-[#4B5358] hover:bg-[#727072]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
