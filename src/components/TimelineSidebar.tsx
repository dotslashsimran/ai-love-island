"use client";

import { TimelineEvent, Interaction, Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { INITIAL_CHARACTERS } from "@/data/characters";

interface TimelineSidebarProps {
  events: TimelineEvent[];
  interactions?: Interaction[];
  conversations?: Conversation[];
  onConversationClick?: (conversation: Conversation) => void;
}

export function TimelineSidebar({ 
  events, 
  interactions = [],
  conversations = [],
  onConversationClick,
}: TimelineSidebarProps) {
  // Create conversation events from conversations
  const conversationEvents: (TimelineEvent & { conversation?: Conversation })[] = conversations.map(convo => {
    const char1 = INITIAL_CHARACTERS.find(c => c.id === convo.participants[0]);
    const char2 = INITIAL_CHARACTERS.find(c => c.id === convo.participants[1]);
    
    const contextLabels: Record<string, string> = {
      pursue: "had a private moment",
      maintain: "caught up",
      tension: "had words",
    };
    
    return {
      id: `convo-${convo.id}`,
      timestamp: new Date(convo.timestamp),
      category: "conversation" as const,
      actors: convo.participants,
      description: `${char1?.name || "Someone"} and ${char2?.name || "someone"} ${contextLabels[convo.context] || "talked"}.`,
      conversation: convo,
    };
  });

  // Merge events with conversations and leaked excerpts
  const allEvents = [...events, ...conversationEvents].map(event => {
    const relatedInteraction = interactions.find(
      i => event.actors.includes(i.initiator) && 
           event.actors.includes(i.recipient) &&
           i.leakedExcerpt &&
           Math.abs(new Date(i.timestamp).getTime() - new Date(event.timestamp).getTime()) < 60000
    );
    return {
      ...event,
      leakedExcerpt: relatedInteraction?.leakedExcerpt || null,
    };
  });

  // Sort by timestamp descending (newest first)
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Live Observation
          </h2>
          <span className="text-[10px] text-zinc-600 ml-auto">
            {allEvents.length} events
          </span>
        </div>
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto">
        {allEvents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-sm">Observing...</p>
            <p className="text-zinc-700 text-xs mt-2">The villa is quiet. Something will happen soon.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {allEvents.map((event) => (
              <TimelineItem 
                key={event.id} 
                event={event} 
                leakedExcerpt={event.leakedExcerpt}
                conversation={(event as typeof event & { conversation?: Conversation }).conversation}
                onConversationClick={onConversationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ 
  event, 
  leakedExcerpt,
  conversation,
  onConversationClick,
}: { 
  event: TimelineEvent; 
  leakedExcerpt?: string | null;
  conversation?: Conversation;
  onConversationClick?: (conversation: Conversation) => void;
}) {
  const categoryStyles: Record<string, { border: string; dot: string }> = {
    shift: { border: "border-l-rose-500/50", dot: "bg-rose-500" },
    tension: { border: "border-l-amber-500/50", dot: "bg-amber-500" },
    coupling: { border: "border-l-emerald-500/50", dot: "bg-emerald-500" },
    drift: { border: "border-l-zinc-500/50", dot: "bg-zinc-500" },
    conversation: { border: "border-l-violet-500/50", dot: "bg-violet-500" },
  };

  const style = categoryStyles[event.category] || categoryStyles.drift;

  const timeAgo = formatDistanceToNow(new Date(event.timestamp), {
    addSuffix: false,
  });

  const isClickable = !!conversation && !!onConversationClick;

  return (
    <div 
      className={`px-4 py-3 border-l-2 ${style.border} hover:bg-zinc-900/30 transition-colors ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={() => isClickable && onConversationClick(conversation)}
    >
      <div className="flex items-start gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {event.description}
          </p>
          {isClickable && (
            <p className="text-[10px] text-violet-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Click to read conversation
            </p>
          )}
          {leakedExcerpt && !conversation && (
            <p className="text-xs text-zinc-500 mt-1.5 italic border-l border-zinc-700 pl-2">
              {leakedExcerpt}
            </p>
          )}
          <p className="text-[10px] text-zinc-600 mt-1.5 uppercase tracking-wider">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
