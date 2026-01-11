// Character Types
export interface Personality {
  attachment: number; // 0-100: how quickly they form bonds
  novelty: number; // 0-100: desire for new connections
  trustBias: number; // 0-100: default trust level
  volatility: number; // 0-100: emotional instability
}

export interface EmotionalState {
  attraction: Record<string, number>; // characterId -> 0-100
  trust: Record<string, number>; // characterId -> 0-100
  jealousy: Record<string, number>; // characterId -> 0-100
  security: number; // 0-100
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  personality: Personality;
  currentPartner: string | null;
  emotionalState: EmotionalState;
  lastInteractionAt: Date;
  lastConfessionalAt: Date;
}

// Interaction Types
export type InteractionType = 
  | "private_conversation" 
  | "sustained_interaction" 
  | "withdrawal";

export interface InteractionEffects {
  attractionDelta?: number;
  trustDelta?: number;
  jealousyDelta?: number;
}

export interface Interaction {
  id: string;
  timestamp: Date;
  initiator: string;
  recipient: string;
  type: InteractionType;
  effects: InteractionEffects;
  leakedExcerpt: string | null;
}

// Timeline Event Types
export type EventCategory = "shift" | "tension" | "coupling" | "drift" | "conversation";

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  category: EventCategory;
  actors: string[];
  description: string;
}

// Confessional Types
export interface Confessional {
  id: string;
  timestamp: Date;
  characterId: string;
  content: string;
}

// Agent Response Types
export interface EmotionalUpdates {
  attraction: Record<string, number>;
  trust: Record<string, number>;
  jealousy: Record<string, number>;
}

export interface AgentIntent {
  target: string | null;
  action: "pursue" | "maintain" | "pull_away" | "observe";
}

export interface AgentResponse {
  emotionalUpdates: EmotionalUpdates;
  intent: AgentIntent;
  confessional: string | null;
  leakedExcerpt: string | null;
}

// Conversation Memory Types
export interface ConversationMessage {
  speaker: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  timestamp: Date;
  participants: [string, string];
  messages: ConversationMessage[];
  context: string; // What prompted this conversation
  emotionalOutcome: {
    initiator: { attractionDelta: number; trustDelta: number };
    recipient: { attractionDelta: number; trustDelta: number };
  };
}

export interface ConversationRow {
  id: string;
  timestamp: string;
  participants: [string, string];
  messages: ConversationMessage[];
  context: string;
  emotional_outcome: {
    initiator: { attractionDelta: number; trustDelta: number };
    recipient: { attractionDelta: number; trustDelta: number };
  };
}

// Character Memory - what they remember about interactions
export interface CharacterMemory {
  characterId: string;
  aboutCharacterId: string;
  memories: string[]; // Key moments they remember
  lastUpdated: Date;
}

export interface CharacterMemoryRow {
  id: string;
  character_id: string;
  about_character_id: string;
  memories: string[];
  last_updated: string;
}

// Database Row Types (for Supabase)
export interface CharacterRow {
  id: string;
  name: string;
  avatar_url: string;
  personality: Personality;
  current_partner: string | null;
  emotional_state: EmotionalState;
  last_interaction_at: string;
  last_confessional_at: string;
}

export interface InteractionRow {
  id: string;
  timestamp: string;
  initiator: string;
  recipient: string;
  type: InteractionType;
  effects: InteractionEffects;
  leaked_excerpt: string | null;
}

export interface TimelineEventRow {
  id: string;
  timestamp: string;
  category: EventCategory;
  actors: string[];
  description: string;
}

export interface ConfessionalRow {
  id: string;
  timestamp: string;
  character_id: string;
  content: string;
}
