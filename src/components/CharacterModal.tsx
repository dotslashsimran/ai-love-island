"use client";

import { Character, Conversation } from "@/types";
import { INITIAL_CHARACTERS } from "@/data/characters";
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

  const personalityDescriptions: Record<string, string> = {
    ayla: "Romantic and attachment-seeking. She falls fast and feels deeply.",
    miro: "Analytical and guarded. He processes before he acts.",
    sena: "Charming and novelty-seeking. Attention is her currency.",
    ravi: "Loyal and steady. Once committed, he doesn't waver easily.",
    luna: "Volatile and intuitive. Her moods shift like weather.",
    tariq: "Reserved and observant. He watches before he moves.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.avatarUrl}
            alt={character.name}
            className="w-20 h-20 rounded-full bg-zinc-800"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-light text-zinc-100">{character.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {personalityDescriptions[character.id]}
            </p>
            {partner && (
              <p className="text-sm text-zinc-400 mt-2">
                Currently with <span className="text-rose-400">{partner.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Personality Stats */}
          <div className="p-6 border-b border-zinc-800/50">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Personality</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBar label="Attachment" value={character.personality.attachment} />
              <StatBar label="Novelty" value={character.personality.novelty} />
              <StatBar label="Trust Bias" value={character.personality.trustBias} />
              <StatBar label="Volatility" value={character.personality.volatility} />
            </div>
          </div>

          {/* Relationships */}
          <div className="p-6 border-b border-zinc-800/50">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Connections
            </h3>
            <div className="space-y-3">
              {relationships.map(({ character: other, attraction, trust, jealousy }) => (
                <div key={other.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={other.avatarUrl}
                    alt={other.name}
                    className="w-10 h-10 rounded-full bg-zinc-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{other.name}</span>
                      {character.currentPartner === other.id && (
                        <span className="text-[10px] uppercase tracking-wider text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                          Partner
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1">
                      <MiniStat label="attraction" value={attraction} color="text-rose-400" />
                      <MiniStat label="trust" value={trust} color="text-emerald-400" />
                      {jealousy > 20 && (
                        <MiniStat label="jealousy" value={jealousy} color="text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Private Conversations
            </h3>
            {loading ? (
              <p className="text-sm text-zinc-600">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-zinc-600">No conversations yet.</p>
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

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-400">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="text-[10px] text-zinc-500">
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
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
              <span className="text-sm text-zinc-300">with {otherCharacter.name}</span>
            </>
          )}
          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">
            {contextLabels[conversation.context] || conversation.context}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600">{timeAgo}</span>
          <svg 
            className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 space-y-2 border-t border-zinc-800/50">
          {conversation.messages.map((msg, idx) => {
            const speaker = INITIAL_CHARACTERS.find(c => c.name === msg.speaker);
            const isCurrentChar = speaker?.id === currentCharacterId;
            
            return (
              <div 
                key={idx} 
                className={`flex gap-2 ${isCurrentChar ? 'flex-row-reverse' : ''}`}
              >
                <div 
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    isCurrentChar 
                      ? 'bg-rose-900/30 text-rose-100' 
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <p className="text-[10px] text-zinc-500 mb-1">{msg.speaker}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          
          {/* Emotional outcome */}
          <div className="pt-2 mt-2 border-t border-zinc-800/50 flex gap-4 text-[10px] text-zinc-500">
            <span>
              Attraction: <span className={conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.attractionDelta}
              </span>
            </span>
            <span>
              Trust: <span className={conversation.emotionalOutcome.initiator.trustDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {conversation.emotionalOutcome.initiator.trustDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.trustDelta}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
