"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Character, TimelineEvent, Confessional, Interaction, Conversation } from "@/types";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterModal } from "@/components/CharacterModal";
import { TimelineSidebar } from "@/components/TimelineSidebar";
import { ConfessionalPanel } from "@/components/ConfessionalPanel";
import { ConversationModal } from "@/components/ConversationModal";
import { INITIAL_CHARACTERS } from "@/data/characters";

const SIMULATION_INTERVAL = 20000; // Run simulation every 20 seconds
const POLL_INTERVAL = 3000; // Poll for updates every 3 seconds

export default function Dashboard() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [confessionals, setConfessionals] = useState<Confessional[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConfessionalBooth, setShowConfessionalBooth] = useState(false);
  const [showMobileTimeline, setShowMobileTimeline] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [nextSimIn, setNextSimIn] = useState(SIMULATION_INTERVAL / 1000);
  const hasFetched = useRef(false);
  const simRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return null;
    return characters.find(c => c.id === selectedCharacterId) ?? null;
  }, [selectedCharacterId, characters]);

  const fetchData = useCallback(async () => {
    try {
      const [charsRes, eventsRes, confRes, interactionsRes, convosRes] = await Promise.all([
        fetch("/api/characters"),
        fetch("/api/timeline"),
        fetch("/api/confessionals"),
        fetch("/api/interactions"),
        fetch("/api/conversations"),
      ]);

      if (charsRes.ok) {
        const chars = await charsRes.json();
        if (chars.length > 0) setCharacters(chars);
      }

      if (eventsRes.ok) {
        const evts = await eventsRes.json();
        setEvents(evts);
      }

      if (confRes.ok) {
        const confs = await confRes.json();
        setConfessionals(confs);
      }

      if (interactionsRes.ok) {
        const ints = await interactionsRes.json();
        setInteractions(ints);
      }

      if (convosRes.ok) {
        const convos = await convosRes.json();
        setConversations(convos);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  const triggerSimulation = useCallback(async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "my-secret-cron-key-12345"}`,
        },
      });
      
      if (res.ok) {
        await fetchData();
      } else {
        console.error("Simulation failed:", await res.text());
      }
    } catch (error) {
      console.error("Failed to trigger simulation:", error);
    } finally {
      setIsSimulating(false);
      setNextSimIn(SIMULATION_INTERVAL / 1000);
    }
  }, [isSimulating, fetchData]);

  // Initial fetch and auto-simulation setup
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
      
      // Start first simulation after 3 seconds
      setTimeout(() => {
        triggerSimulation();
      }, 3000);
    }

    // Auto-run simulation every SIMULATION_INTERVAL
    simRef.current = setInterval(() => {
      triggerSimulation();
    }, SIMULATION_INTERVAL);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setNextSimIn(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (simRef.current) clearInterval(simRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchData, triggerSimulation]);

  // Poll for data updates more frequently
  useEffect(() => {
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-dark text-[#D2D6EF] noise-overlay">
      <div className="flex h-screen">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <header className="mb-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-light tracking-tight gradient-text">
                    Love Island
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AF929D] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AF929D]"></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[#AF929D]/80">Live</span>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#727072] mt-2">
                  {isSimulating ? (
                    <span className="text-[#AF929D] animate-pulse">Processing interactions...</span>
                  ) : (
                    <span className="text-[#727072]">Next cycle in <span className="text-[#D2D6EF]/70 font-mono">{nextSimIn}s</span></span>
                  )}
                </p>
              </div>
              {/* Desktop buttons - hidden on mobile (bottom bar handles this) */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => setShowConfessionalBooth(!showConfessionalBooth)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-wider rounded-lg transition-all duration-300 ${
                    showConfessionalBooth 
                      ? "bg-[#AF929D]/10 border border-[#AF929D]/30 text-[#AF929D]" 
                      : "bg-[#104547]/30 border border-[#4B5358]/50 text-[#727072] hover:border-[#4B5358] hover:text-[#D2D6EF]"
                  }`}
                >
                  Confessionals
                </button>
                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="group px-4 py-2 text-[10px] uppercase tracking-wider bg-[#104547]/30 border border-[#4B5358]/50 text-[#727072] rounded-lg hover:border-[#AF929D]/30 hover:bg-[#AF929D]/5 hover:text-[#D2D6EF] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    {isSimulating ? (
                      <>
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Simulating
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Advance
                      </>
                    )}
                  </span>
                </button>
              </div>
            </header>

            {/* Latest confessional */}
            {showConfessionalBooth && confessionals.length > 0 && (
              <div className="mb-8 fade-in">
                <ConfessionalPanel confessionals={confessionals} />
              </div>
            )}

            {/* Character grid */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => setSelectedCharacterId(character.id)}
                  />
                ))}
              </div>
            </section>

            {/* Coupling overview */}
            <section className="mt-10">
              <CouplingStatus characters={characters} />
            </section>

            {/* Footer timestamp */}
            <footer className="mt-12 pt-4 border-t border-[#4B5358]/20">
              <p className="text-[10px] text-[#727072] uppercase tracking-wider flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#104547]"></span>
                Last sync: {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </footer>
          </div>
        </main>

        {/* Timeline sidebar - sticky right */}
        <aside className="w-80 border-l border-[#4B5358]/30 bg-[#104547]/10 backdrop-blur-sm shrink-0 hidden lg:block">
          <div className="sticky top-0 h-screen overflow-hidden">
            <TimelineSidebar 
              events={events} 
              interactions={interactions}
              conversations={conversations}
              onConversationClick={setSelectedConversation}
            />
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar - visible only on smaller screens */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#4B5358]/30 z-40">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={() => { setShowMobileTimeline(false); setShowConfessionalBooth(!showConfessionalBooth); }}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all ${
              showConfessionalBooth ? "text-[#AF929D]" : "text-[#727072]"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider">Confessionals</span>
          </button>
          
          <button
            onClick={() => { setShowConfessionalBooth(false); setShowMobileTimeline(!showMobileTimeline); }}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all relative ${
              showMobileTimeline ? "text-[#AF929D]" : "text-[#727072]"
            }`}
          >
            {events.length > 0 && (
              <span className="absolute -top-1 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AF929D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AF929D]"></span>
              </span>
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider">Live Feed</span>
          </button>

          <button
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all text-[#727072] disabled:opacity-50"
          >
            {isSimulating ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
            <span className="text-[9px] uppercase tracking-wider">
              {isSimulating ? "Running" : `${nextSimIn}s`}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Timeline slide-up panel */}
      {showMobileTimeline && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileTimeline(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-[#0a0a0a] border-t border-[#4B5358]/30 rounded-t-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#4B5358]/30">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AF929D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AF929D]"></span>
                </span>
                <span className="text-xs uppercase tracking-widest text-[#727072]">Live Observations</span>
                <span className="text-[10px] text-[#4B5358]">
                  {events.length + conversations.length} events
                </span>
              </div>
              <button 
                onClick={() => setShowMobileTimeline(false)}
                className="p-2 text-[#727072] hover:text-[#D2D6EF] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(70vh-52px)] overflow-y-auto">
              <TimelineSidebar 
                events={events} 
                interactions={interactions}
                conversations={conversations}
                onConversationClick={(conv) => {
                  setSelectedConversation(conv);
                  setShowMobileTimeline(false);
                }}
                hideHeader={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Confessionals slide-up panel */}
      {showConfessionalBooth && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfessionalBooth(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-[#0a0a0a] border-t border-[#4B5358]/30 rounded-t-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#4B5358]/30">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#AF929D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs uppercase tracking-widest text-[#727072]">Confessionals</span>
                <span className="text-[10px] text-[#4B5358]">
                  {confessionals.length} entries
                </span>
              </div>
              <button 
                onClick={() => setShowConfessionalBooth(false)}
                className="p-2 text-[#727072] hover:text-[#D2D6EF] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(70vh-52px)] overflow-y-auto p-4">
              {confessionals.length > 0 ? (
                <ConfessionalPanel confessionals={confessionals} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#727072] text-sm">No confessionals yet</p>
                  <p className="text-[#4B5358] text-xs mt-2">The islanders are keeping their thoughts to themselves.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          allCharacters={characters}
          onClose={() => setSelectedCharacterId(null)}
        />
      )}

      {/* Conversation Modal */}
      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}

function CouplingStatus({ characters }: { characters: Character[] }) {
  const couples: { char1: Character; char2: Character }[] = [];
  const singles: Character[] = [];
  const seen = new Set<string>();

  for (const char of characters) {
    if (char.currentPartner && !seen.has(char.id)) {
      const partner = characters.find((c) => c.id === char.currentPartner);
      if (partner) {
        couples.push({ char1: char, char2: partner });
        seen.add(char.id);
        seen.add(partner.id);
      }
    } else if (!char.currentPartner && !seen.has(char.id)) {
      singles.push(char);
    }
  }

  if (couples.length === 0 && singles.length === characters.length) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#104547]/20 border border-[#4B5358]/30">
          <span className="text-[#727072] text-xs">All islanders currently single</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] uppercase tracking-widest text-[#727072]">Current Couples</h3>
      {couples.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {couples.map(({ char1, char2 }) => (
            <div
              key={`${char1.id}-${char2.id}`}
              className="group flex items-center gap-2 bg-[#104547]/20 border border-[#4B5358]/30 rounded-full px-4 py-2 hover:border-[#AF929D]/30 hover:bg-[#AF929D]/5 transition-all duration-300"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char1.avatarUrl}
                  alt={char1.name}
                  className="w-7 h-7 rounded-full ring-2 ring-[#0a0a0a]"
                />
              </div>
              <span className="text-[#AF929D]/60 text-xs group-hover:text-[#AF929D] transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char2.avatarUrl}
                  alt={char2.name}
                  className="w-7 h-7 rounded-full ring-2 ring-[#0a0a0a]"
                />
              </div>
              <span className="text-xs text-[#727072] ml-1 group-hover:text-[#D2D6EF] transition-colors">
                {char1.name} & {char2.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
