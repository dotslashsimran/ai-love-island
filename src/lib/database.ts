import { supabase, createServerClient } from "./supabase";
import {
  Character,
  Interaction,
  TimelineEvent,
  Confessional,
  Conversation,
  CharacterMemory,
  CharacterRow,
  InteractionRow,
  TimelineEventRow,
  ConfessionalRow,
  ConversationRow,
  CharacterMemoryRow,
} from "@/types";
import { INITIAL_CHARACTERS } from "@/data/characters";

// Transform database rows to application types
function rowToCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    personality: row.personality,
    currentPartner: row.current_partner,
    emotionalState: row.emotional_state,
    lastInteractionAt: new Date(row.last_interaction_at),
    lastConfessionalAt: new Date(row.last_confessional_at),
  };
}

function rowToInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp),
    initiator: row.initiator,
    recipient: row.recipient,
    type: row.type,
    effects: row.effects,
    leakedExcerpt: row.leaked_excerpt,
  };
}

function rowToTimelineEvent(row: TimelineEventRow): TimelineEvent {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp),
    category: row.category,
    actors: row.actors,
    description: row.description,
  };
}

function rowToConfessional(row: ConfessionalRow): Confessional {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp),
    characterId: row.character_id,
    content: row.content,
  };
}

function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp),
    participants: row.participants,
    messages: row.messages,
    context: row.context,
    emotionalOutcome: row.emotional_outcome,
  };
}

function rowToMemory(row: CharacterMemoryRow): CharacterMemory {
  return {
    characterId: row.character_id,
    aboutCharacterId: row.about_character_id,
    memories: row.memories,
    lastUpdated: new Date(row.last_updated),
  };
}

// Character operations
export async function getCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("name");

  if (error || !data || data.length === 0) {
    // Return initial characters if database is empty
    return INITIAL_CHARACTERS;
  }

  return data.map(rowToCharacter);
}

export async function getCharacter(id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return INITIAL_CHARACTERS.find((c) => c.id === id) ?? null;
  }

  return rowToCharacter(data);
}

export async function updateCharacter(character: Character): Promise<void> {
  const db = createServerClient();
  
  const { error } = await db.from("characters").upsert({
    id: character.id,
    name: character.name,
    avatar_url: character.avatarUrl,
    personality: character.personality,
    current_partner: character.currentPartner,
    emotional_state: character.emotionalState,
    last_interaction_at: character.lastInteractionAt.toISOString(),
    last_confessional_at: character.lastConfessionalAt.toISOString(),
  });

  if (error) {
    console.error("Error updating character:", error);
  }
}

// Interaction operations
export async function getRecentInteractions(limit = 50): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToInteraction);
}

export async function createInteraction(interaction: Interaction): Promise<void> {
  const db = createServerClient();
  
  const { error } = await db.from("interactions").insert({
    id: interaction.id,
    timestamp: interaction.timestamp.toISOString(),
    initiator: interaction.initiator,
    recipient: interaction.recipient,
    type: interaction.type,
    effects: interaction.effects,
    leaked_excerpt: interaction.leakedExcerpt,
  });

  if (error) {
    console.error("Error creating interaction:", error);
  }
}

// Timeline operations
export async function getTimelineEvents(limit = 100): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToTimelineEvent);
}

export async function createTimelineEvent(event: TimelineEvent): Promise<void> {
  const db = createServerClient();
  
  const { error } = await db.from("timeline_events").insert({
    id: event.id,
    timestamp: event.timestamp.toISOString(),
    category: event.category,
    actors: event.actors,
    description: event.description,
  });

  if (error) {
    console.error("Error creating timeline event:", error);
  }
}

// Confessional operations
export async function getConfessionals(limit = 20): Promise<Confessional[]> {
  const { data, error } = await supabase
    .from("confessionals")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToConfessional);
}

export async function createConfessional(confessional: Confessional): Promise<void> {
  const db = createServerClient();
  
  const { error } = await db.from("confessionals").insert({
    id: confessional.id,
    timestamp: confessional.timestamp.toISOString(),
    character_id: confessional.characterId,
    content: confessional.content,
  });

  if (error) {
    console.error("Error creating confessional:", error);
  }
}

// Conversation operations
export async function getConversations(limit = 50): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToConversation);
}

export async function getConversationsBetween(
  char1Id: string,
  char2Id: string,
  limit = 20
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .contains("participants", [char1Id, char2Id])
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToConversation);
}

export async function getConversationsForCharacter(
  characterId: string,
  limit = 20
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .contains("participants", [characterId])
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(rowToConversation);
}

export async function createConversation(conversation: Conversation): Promise<void> {
  const db = createServerClient();

  const { error } = await db.from("conversations").insert({
    id: conversation.id,
    timestamp: conversation.timestamp.toISOString(),
    participants: conversation.participants,
    messages: conversation.messages,
    context: conversation.context,
    emotional_outcome: conversation.emotionalOutcome,
  });

  if (error) {
    console.error("Error creating conversation:", error);
  }
}

// Memory operations
export async function getMemories(characterId: string): Promise<CharacterMemory[]> {
  const { data, error } = await supabase
    .from("character_memories")
    .select("*")
    .eq("character_id", characterId);

  if (error || !data) {
    return [];
  }

  return data.map(rowToMemory);
}

export async function getMemoryAbout(
  characterId: string,
  aboutCharacterId: string
): Promise<CharacterMemory | null> {
  const { data, error } = await supabase
    .from("character_memories")
    .select("*")
    .eq("character_id", characterId)
    .eq("about_character_id", aboutCharacterId)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToMemory(data);
}

export async function upsertMemory(
  characterId: string,
  aboutCharacterId: string,
  newMemory: string
): Promise<void> {
  const db = createServerClient();

  // Get existing memories
  const existing = await getMemoryAbout(characterId, aboutCharacterId);
  const memories = existing?.memories ?? [];

  // Keep last 10 memories to prevent unbounded growth
  const updatedMemories = [...memories, newMemory].slice(-10);

  const { error } = await db.from("character_memories").upsert({
    character_id: characterId,
    about_character_id: aboutCharacterId,
    memories: updatedMemories,
    last_updated: new Date().toISOString(),
  }, {
    onConflict: "character_id,about_character_id",
  });

  if (error) {
    console.error("Error upserting memory:", error);
  }
}

// Initialize database with characters if empty
export async function initializeCharacters(): Promise<void> {
  const db = createServerClient();
  
  for (const character of INITIAL_CHARACTERS) {
    await db.from("characters").upsert({
      id: character.id,
      name: character.name,
      avatar_url: character.avatarUrl,
      personality: character.personality,
      current_partner: character.currentPartner,
      emotional_state: character.emotionalState,
      last_interaction_at: character.lastInteractionAt.toISOString(),
      last_confessional_at: character.lastConfessionalAt.toISOString(),
    });
  }
}
