"use client";

import { Character, Conversation } from "@/types";
import { INITIAL_CHARACTERS, CHARACTER_PROFILES } from "@/data/characters";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface CharacterModalProps {
  character: Character;
  allCharacters: Character[];
  onClose: () => void;
}

export function CharacterModal({ character, allCharacters, onClose }: CharacterModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const partner = character.currentPartner
    ? allCharacters.find((c) => c.id === character.currentPartner)
    : null;

  const profile = CHARACTER_PROFILES[character.id];

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch(`/api/conversations?characterId=${character.id}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [character.id]);

  // Sort other characters by attraction level
  const relationships = allCharacters
    .filter((c) => c.id !== character.id)
    .map((other) => ({
      character: other,
      attraction: character.emotionalState.attraction[other.id] ?? 50,
      trust: character.emotionalState.trust[other.id] ?? 50,
      jealousy: character.emotionalState.jealousy[other.id] ?? 0,
    }))
    .sort((a, b) => b.attraction - a.attraction);

  // Extract age and occupation from profile
  const backgroundMatch = profile?.background.match(/A (\d+)-year-old ([^.]+)/);
  const age = backgroundMatch?.[1] || "26";
  const occupation = backgroundMatch?.[2]?.split(" from ")[0] || "Islander";
  const location = profile?.background.match(/from ([^.]+)/)?.[1]?.split(".")[0] || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0a0a0a] border border-[#4B5358]/50 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-[#4B5358]/30">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#727072] hover:text-[#D2D6EF] transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-24 h-24 rounded-2xl bg-[#4B5358]/30 shrink-0"
            />
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-[#D2D6EF]">{character.name}</h2>
                <span className="text-[#727072] text-lg font-light">{age}</span>
              </div>
              <p className="text-sm text-[#AF929D] mt-0.5 font-medium">{occupation}</p>
              {location && (
                <p className="text-xs text-[#727072] mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {location}
                </p>
              )}
              {/* Tagline */}
              {profile?.tagline && (
                <p className="text-sm text-[#D2D6EF]/80 mt-3 italic">
                  &ldquo;{profile.tagline}&rdquo;
                </p>
              )}
              {partner && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF929D]/10 border border-[#AF929D]/20">
                  <svg className="w-3 h-3 text-[#AF929D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-[#AF929D]">Coupled with {partner.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* The Tea - Main description */}
          {profile?.description && (
            <div className="p-6 border-b border-[#4B5358]/30">
              <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#AF929D]"></span>
                The Tea
              </h3>
              <p className="text-sm text-[#D2D6EF]/90 leading-relaxed">
                {profile.description}
              </p>
            </div>
          )}

          {/* Red Flags & Green Flags */}
          {profile && (
            <div className="p-6 border-b border-[#4B5358]/30">
              <div className="grid grid-cols-2 gap-6">
                {/* Red Flags */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3 flex items-center gap-2">
                    <span className="text-base">🚩</span>
                    Red Flags
                  </h3>
                  <ul className="space-y-2">
                    {profile.redFlags?.map((flag, idx) => (
                      <li key={idx} className="text-xs text-[#AF929D] flex items-start gap-2">
                        <span className="text-[#AF929D]/50 mt-0.5">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Green Flags */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3 flex items-center gap-2">
                    <span className="text-base">💚</span>
                    Green Flags
                  </h3>
                  <ul className="space-y-2">
                    {profile.greenFlags?.map((flag, idx) => (
                      <li key={idx} className="text-xs text-[#104547] flex items-start gap-2">
                        <span className="text-[#104547]/50 mt-0.5">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* How They Flirt */}
          {profile?.flirtStyle && (
            <div className="p-6 border-b border-[#4B5358]/30">
              <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#AF929D]"></span>
                How They Flirt
              </h3>
              <p className="text-sm text-[#D2D6EF]/80">
                {profile.flirtStyle}
              </p>
            </div>
          )}

          {/* Personality Stats */}
          <div className="p-6 border-b border-[#4B5358]/30">
            <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3">Personality DNA</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBar label="Attachment" value={character.personality.attachment} description="How quickly they bond" />
              <StatBar label="Novelty" value={character.personality.novelty} description="Craving for new connections" />
              <StatBar label="Trust Bias" value={character.personality.trustBias} description="How easily they trust" />
              <StatBar label="Volatility" value={character.personality.volatility} description="Emotional unpredictability" />
            </div>
          </div>

          {/* Relationships */}
          <div className="p-6 border-b border-[#4B5358]/30">
            <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3">
              Current Dynamics
            </h3>
            <div className="space-y-3">
              {relationships.map(({ character: other, attraction, trust, jealousy }) => (
                <div key={other.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#104547]/10 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={other.avatarUrl}
                    alt={other.name}
                    className="w-10 h-10 rounded-xl bg-[#4B5358]/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#D2D6EF]">{other.name}</span>
                      {character.currentPartner === other.id && (
                        <span className="text-[10px] uppercase tracking-wider text-[#AF929D] bg-[#AF929D]/10 px-2 py-0.5 rounded">
                          Partner
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1">
                      <MiniStat label="attraction" value={attraction} color="text-[#AF929D]" />
                      <MiniStat label="trust" value={trust} color="text-[#D2D6EF]" />
                      {jealousy > 20 && (
                        <MiniStat label="jealousy" value={jealousy} color="text-[#727072]" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-[#727072] mb-3">
              Private Conversations
            </h3>
            {loading ? (
              <p className="text-sm text-[#4B5358]">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-[#4B5358]">No conversations yet.</p>
            ) : (
              <div className="space-y-4">
                {conversations.slice(0, 5).map((convo) => (
                  <ConversationCard 
                    key={convo.id} 
                    conversation={convo} 
                    currentCharacterId={character.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, description }: { label: string; value: number; description?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#727072]">{label}</span>
        <span className="text-[#D2D6EF]/70">{value}</span>
      </div>
      <div className="h-1.5 bg-[#4B5358]/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#104547] to-[#AF929D] transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      {description && (
        <p className="text-[9px] text-[#4B5358] mt-1">{description}</p>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="text-[10px] text-[#727072]">
      {label}: <span className={color}>{value}</span>
    </span>
  );
}

function ConversationCard({ 
  conversation, 
  currentCharacterId 
}: { 
  conversation: Conversation; 
  currentCharacterId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const otherParticipantId = conversation.participants.find(p => p !== currentCharacterId);
  const otherCharacter = INITIAL_CHARACTERS.find(c => c.id === otherParticipantId);
  
  const timeAgo = formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true });
  
  const contextLabels: Record<string, string> = {
    pursue: "Romantic intent",
    maintain: "Casual moment",
    tension: "Unresolved tension",
  };

  return (
    <div className="bg-[#104547]/20 border border-[#4B5358]/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-[#104547]/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {otherCharacter && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={otherCharacter.avatarUrl}
                alt={otherCharacter.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-[#D2D6EF]">with {otherCharacter.name}</span>
            </>
          )}
          <span className="text-[10px] text-[#727072] bg-[#4B5358]/30 px-2 py-0.5 rounded">
            {contextLabels[conversation.context] || conversation.context}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#4B5358]">{timeAgo}</span>
          <svg 
            className={`w-4 h-4 text-[#727072] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 space-y-2 border-t border-[#4B5358]/30">
          {conversation.messages.map((msg, idx) => {
            const speaker = INITIAL_CHARACTERS.find(c => c.name === msg.speaker);
            const isCurrentChar = speaker?.id === currentCharacterId;
            
            return (
              <div 
                key={idx} 
                className={`flex gap-2 ${isCurrentChar ? 'flex-row-reverse' : ''}`}
              >
                <div 
                  className={`max-w-[80%] p-2 rounded-xl text-sm ${
                    isCurrentChar 
                      ? 'bg-[#AF929D]/20 text-[#D2D6EF]' 
                      : 'bg-[#4B5358]/30 text-[#D2D6EF]'
                  }`}
                >
                  <p className="text-[10px] text-[#727072] mb-1">{msg.speaker}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          
          {/* Emotional outcome */}
          <div className="pt-2 mt-2 border-t border-[#4B5358]/30 flex gap-4 text-[10px] text-[#727072]">
            <span>
              Attraction: <span className={conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? 'text-[#104547]' : 'text-[#AF929D]'}>
                {conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.attractionDelta}
              </span>
            </span>
            <span>
              Trust: <span className={conversation.emotionalOutcome.initiator.trustDelta >= 0 ? 'text-[#104547]' : 'text-[#AF929D]'}>
                {conversation.emotionalOutcome.initiator.trustDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.trustDelta}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
