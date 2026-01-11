"use client";

import { Conversation } from "@/types";
import { INITIAL_CHARACTERS } from "@/data/characters";
import { formatDistanceToNow } from "date-fns";

interface ConversationModalProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ConversationModal({ conversation, onClose }: ConversationModalProps) {
  const char1 = INITIAL_CHARACTERS.find(c => c.id === conversation.participants[0]);
  const char2 = INITIAL_CHARACTERS.find(c => c.id === conversation.participants[1]);
  
  const contextLabels: Record<string, string> = {
    pursue: "Romantic Intent",
    maintain: "Casual Moment", 
    tension: "Unresolved Tension",
  };

  const timeAgo = formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {char1 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char1.avatarUrl}
                  alt={char1.name}
                  className="w-10 h-10 rounded-full border-2 border-zinc-950"
                />
              )}
              {char2 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char2.avatarUrl}
                  alt={char2.name}
                  className="w-10 h-10 rounded-full border-2 border-zinc-950"
                />
              )}
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-200">
                {char1?.name} & {char2?.name}
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {contextLabels[conversation.context]} · {timeAgo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {conversation.messages.map((msg, idx) => {
            const speaker = INITIAL_CHARACTERS.find(c => c.name === msg.speaker);
            const isFirstParticipant = speaker?.id === conversation.participants[0];
            
            return (
              <div 
                key={idx} 
                className={`flex gap-2 ${isFirstParticipant ? '' : 'flex-row-reverse'}`}
              >
                {speaker && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={speaker.avatarUrl}
                    alt={speaker.name}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                )}
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    isFirstParticipant 
                      ? 'bg-zinc-800 text-zinc-200 rounded-tl-sm' 
                      : 'bg-violet-900/40 text-violet-100 rounded-tr-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emotional Outcome */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Emotional Shift</p>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-400 mb-1">{char1?.name}</p>
              <div className="flex gap-3 text-xs">
                <span className="text-zinc-500">
                  Attraction: <span className={conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {conversation.emotionalOutcome.initiator.attractionDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.attractionDelta}
                  </span>
                </span>
                <span className="text-zinc-500">
                  Trust: <span className={conversation.emotionalOutcome.initiator.trustDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {conversation.emotionalOutcome.initiator.trustDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.initiator.trustDelta}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-400 mb-1">{char2?.name}</p>
              <div className="flex gap-3 text-xs">
                <span className="text-zinc-500">
                  Attraction: <span className={conversation.emotionalOutcome.recipient.attractionDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {conversation.emotionalOutcome.recipient.attractionDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.recipient.attractionDelta}
                  </span>
                </span>
                <span className="text-zinc-500">
                  Trust: <span className={conversation.emotionalOutcome.recipient.trustDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {conversation.emotionalOutcome.recipient.trustDelta >= 0 ? '+' : ''}{conversation.emotionalOutcome.recipient.trustDelta}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
