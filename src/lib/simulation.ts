import { v4 as uuidv4 } from "uuid";
import {
  Character,
  Interaction,
  TimelineEvent,
  Confessional,
  InteractionType,
  Conversation,
} from "@/types";
import { getCharacterDecision } from "./deepseek";
import { generateConversation } from "./conversations";
import {
  getCharacters,
  getRecentInteractions,
  updateCharacter,
  createInteraction,
  createTimelineEvent,
  createConfessional,
  createConversation,
  getMemoryAbout,
  upsertMemory,
} from "./database";

// Clamp value between 0 and 100
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// Pick conversation partner based on emotional state
function pickConversationPartner(
  character: Character,
  allCharacters: Character[],
  alreadyPaired: Set<string>
): Character | null {
  const available = allCharacters.filter(
    (c) => c.id !== character.id && !alreadyPaired.has(c.id)
  );

  if (available.length === 0) return null;

  // Weight by attraction + some randomness for drama
  const weights = available.map((c) => {
    const attraction = character.emotionalState.attraction[c.id] ?? 50;
    const jealousy = character.emotionalState.jealousy[c.id] ?? 0;
    const trust = character.emotionalState.trust[c.id] ?? 50;
    
    // High attraction = want to talk
    // High jealousy = need to confront
    // Low trust = need to clear air
    // Partner = should spend time with
    let weight = attraction;
    if (jealousy > 30) weight += jealousy * 0.5; // Drama potential
    if (trust < 40) weight += 20; // Tension to resolve
    if (character.currentPartner === c.id) weight += 30; // Partner priority
    if (!character.currentPartner && !c.currentPartner) weight += 15; // Both single
    
    return { character: c, weight: weight + Math.random() * 20 };
  });

  weights.sort((a, b) => b.weight - a.weight);
  return weights[0]?.character ?? null;
}

// Determine conversation reason based on emotional state
function determineConversationReason(
  initiator: Character,
  recipient: Character
): "pursue" | "tension" | "maintain" {
  const attraction = initiator.emotionalState.attraction[recipient.id] ?? 50;
  const trust = initiator.emotionalState.trust[recipient.id] ?? 50;
  const jealousy = initiator.emotionalState.jealousy[recipient.id] ?? 0;

  if (jealousy > 40 || trust < 35) return "tension";
  if (attraction > 60 && initiator.currentPartner !== recipient.id) return "pursue";
  return "maintain";
}

// Generate timeline commentary for a conversation
function generateConversationCommentary(
  initiator: Character,
  recipient: Character,
  reason: string,
  outcome: { initiatorDelta: number; recipientDelta: number },
  allCharacters: Character[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Opening event
  const openingLines: Record<string, string[]> = {
    pursue: [
      `${initiator.name} pulled ${recipient.name} for a chat.`,
      `${initiator.name} found ${recipient.name} alone.`,
      `${initiator.name} made a move on ${recipient.name}.`,
    ],
    tension: [
      `${initiator.name} confronted ${recipient.name}.`,
      `${initiator.name} needed to clear the air with ${recipient.name}.`,
      `Things got heated between ${initiator.name} and ${recipient.name}.`,
    ],
    maintain: [
      `${initiator.name} and ${recipient.name} caught up.`,
      `${initiator.name} spent time with ${recipient.name}.`,
      `${initiator.name} and ${recipient.name} had a moment.`,
    ],
  };

  const lines = openingLines[reason] || openingLines.maintain;
  events.push({
    id: uuidv4(),
    timestamp: new Date(),
    category: reason === "tension" ? "tension" : "shift",
    actors: [initiator.id, recipient.id],
    description: lines[Math.floor(Math.random() * lines.length)],
  });

  // Outcome event
  const avgDelta = (outcome.initiatorDelta + outcome.recipientDelta) / 2;
  if (avgDelta > 3) {
    const positiveLines = [
      `${initiator.name} and ${recipient.name} are getting closer.`,
      `Something sparked between ${initiator.name} and ${recipient.name}.`,
      `That went well for ${initiator.name}.`,
    ];
    events.push({
      id: uuidv4(),
      timestamp: new Date(Date.now() + 2000),
      category: "shift",
      actors: [initiator.id, recipient.id],
      description: positiveLines[Math.floor(Math.random() * positiveLines.length)],
    });
  } else if (avgDelta < -3) {
    const negativeLines = [
      `${recipient.name} walked away from ${initiator.name}.`,
      `That conversation left ${initiator.name} unsettled.`,
      `Tension between ${initiator.name} and ${recipient.name}.`,
    ];
    events.push({
      id: uuidv4(),
      timestamp: new Date(Date.now() + 2000),
      category: "tension",
      actors: [initiator.id, recipient.id],
      description: negativeLines[Math.floor(Math.random() * negativeLines.length)],
    });
  }

  // Third party notices (if someone's partner is talking to someone else)
  const jealousObserver = allCharacters.find(
    (c) =>
      c.id !== initiator.id &&
      c.id !== recipient.id &&
      (c.currentPartner === initiator.id || c.currentPartner === recipient.id)
  );

  if (jealousObserver && Math.random() > 0.4) {
    const jealousLines = [
      `${jealousObserver.name} noticed them talking.`,
      `${jealousObserver.name} watched from across the villa.`,
      `${jealousObserver.name} didn't look happy.`,
    ];
    events.push({
      id: uuidv4(),
      timestamp: new Date(Date.now() + 3000),
      category: "tension",
      actors: [jealousObserver.id, initiator.id, recipient.id],
      description: jealousLines[Math.floor(Math.random() * jealousLines.length)],
    });
  }

  return events;
}

// Check if two characters should couple
function shouldCouple(char1: Character, char2: Character): boolean {
  const mutualAttraction =
    (char1.emotionalState.attraction[char2.id] ?? 0) > 65 &&
    (char2.emotionalState.attraction[char1.id] ?? 0) > 65;

  const mutualTrust =
    (char1.emotionalState.trust[char2.id] ?? 0) > 50 &&
    (char2.emotionalState.trust[char1.id] ?? 0) > 50;

  const bothSingle = !char1.currentPartner && !char2.currentPartner;

  return mutualAttraction && mutualTrust && bothSingle;
}

// Check if a character should break up with their partner
function shouldBreakUp(character: Character, partner: Character): boolean {
  const attraction = character.emotionalState.attraction[partner.id] ?? 50;
  const trust = character.emotionalState.trust[partner.id] ?? 50;
  const security = character.emotionalState.security;

  return attraction < 30 && trust < 35 && security < 40;
}

// Generate confessional for a character
async function generateConfessionalForCharacter(
  character: Character,
  allCharacters: Character[],
  recentInteractions: Interaction[]
): Promise<Confessional | null> {
  const response = await getCharacterDecision(
    character,
    allCharacters,
    recentInteractions
  );

  if (response?.confessional) {
    return {
      id: uuidv4(),
      timestamp: new Date(),
      characterId: character.id,
      content: response.confessional,
    };
  }

  // Fallback confessional based on state
  const partner = character.currentPartner
    ? allCharacters.find((c) => c.id === character.currentPartner)
    : null;

  const highAttraction = Object.entries(character.emotionalState.attraction)
    .filter(([id]) => id !== character.currentPartner)
    .sort((a, b) => b[1] - a[1])[0];

  const crush = highAttraction
    ? allCharacters.find((c) => c.id === highAttraction[0])
    : null;

  let content: string;

  if (partner && crush && highAttraction[1] > 60) {
    content = `I'm with ${partner.name}, but I can't stop thinking about ${crush.name}.`;
  } else if (partner && character.emotionalState.trust[partner.id] < 40) {
    content = `I don't know if I can trust ${partner.name} anymore.`;
  } else if (!partner && crush) {
    content = `${crush.name} is definitely catching my eye.`;
  } else if (character.emotionalState.security < 40) {
    content = `I'm not sure where I stand in here anymore.`;
  } else {
    content = `Things are getting interesting in the villa.`;
  }

  return {
    id: uuidv4(),
    timestamp: new Date(),
    characterId: character.id,
    content,
  };
}

// Helper to generate and process a conversation between two characters
async function generateAndProcessConversation(
  initiator: Character,
  recipient: Character,
  allCharacters: Character[],
  updatedCharacters: Map<string, Character>,
  newConversations: Conversation[],
  newInteractions: Interaction[],
  newEvents: TimelineEvent[]
): Promise<void> {
  try {
    const reason = determineConversationReason(initiator, recipient);
    
    // Fetch memories for context
    const initiatorMemories = await getMemoryAbout(initiator.id, recipient.id);
    const recipientMemories = await getMemoryAbout(recipient.id, initiator.id);
    
    // Generate the actual conversation with ConversationContext
    const conversationResult = await generateConversation({
      initiator,
      recipient,
      initiatorMemories,
      recipientMemories,
      reason,
    });

    if (conversationResult) {
      // Use the emotional shift from the AI response
      const initiatorDelta = conversationResult.emotionalShift.initiator.attractionDelta;
      const recipientDelta = conversationResult.emotionalShift.recipient.attractionDelta;
      const initiatorTrustDelta = conversationResult.emotionalShift.initiator.trustDelta;
      const recipientTrustDelta = conversationResult.emotionalShift.recipient.trustDelta;

      // Create the Conversation object for storage
      const conversation: Conversation = {
        id: uuidv4(),
        timestamp: new Date(),
        participants: [initiator.id, recipient.id],
        messages: conversationResult.messages,
        context: reason,
        emotionalOutcome: {
          initiator: { attractionDelta: initiatorDelta, trustDelta: initiatorTrustDelta },
          recipient: { attractionDelta: recipientDelta, trustDelta: recipientTrustDelta },
        },
      };
      
      newConversations.push(conversation);

      // Update initiator emotions
      const updatedInitiator = updatedCharacters.get(initiator.id)!;
      updatedInitiator.emotionalState.attraction[recipient.id] = clamp(
        (updatedInitiator.emotionalState.attraction[recipient.id] ?? 50) + initiatorDelta
      );
      updatedInitiator.emotionalState.trust[recipient.id] = clamp(
        (updatedInitiator.emotionalState.trust[recipient.id] ?? 50) + initiatorTrustDelta
      );
      updatedInitiator.lastInteractionAt = new Date();
      updatedCharacters.set(initiator.id, updatedInitiator);

      // Update recipient emotions
      const updatedRecipient = updatedCharacters.get(recipient.id)!;
      updatedRecipient.emotionalState.attraction[initiator.id] = clamp(
        (updatedRecipient.emotionalState.attraction[initiator.id] ?? 50) + recipientDelta
      );
      updatedRecipient.emotionalState.trust[initiator.id] = clamp(
        (updatedRecipient.emotionalState.trust[initiator.id] ?? 50) + recipientTrustDelta
      );
      updatedRecipient.lastInteractionAt = new Date();
      updatedCharacters.set(recipient.id, updatedRecipient);

      // Create interaction record
      const interactionType: InteractionType = 
        reason === "pursue" ? "private_conversation" : 
        reason === "tension" ? "sustained_interaction" : "private_conversation";

      newInteractions.push({
        id: uuidv4(),
        timestamp: new Date(),
        initiator: initiator.id,
        recipient: recipient.id,
        type: interactionType,
        effects: {
          attractionDelta: initiatorDelta,
          trustDelta: initiatorTrustDelta,
        },
        leakedExcerpt: null,
      });

      // Generate timeline events for this conversation
      const conversationEvents = generateConversationCommentary(
        initiator,
        recipient,
        reason,
        { initiatorDelta, recipientDelta },
        allCharacters
      );
      newEvents.push(...conversationEvents);

      // Update memories with the AI-generated summaries
      await upsertMemory(initiator.id, recipient.id, conversationResult.memoryForInitiator);
      await upsertMemory(recipient.id, initiator.id, conversationResult.memoryForRecipient);
    }
  } catch (error) {
    console.error(`Failed to generate conversation between ${initiator.name} and ${recipient.name}:`, error);
  }
}

// Process a single simulation cycle - now with forced conversations
export async function runSimulationCycle(): Promise<{
  interactions: Interaction[];
  events: TimelineEvent[];
  confessionals: Confessional[];
  conversations: Conversation[];
}> {
  const characters = await getCharacters();
  const recentInteractions = await getRecentInteractions(50);

  const newInteractions: Interaction[] = [];
  const newEvents: TimelineEvent[] = [];
  const newConfessionals: Confessional[] = [];
  const newConversations: Conversation[] = [];
  const updatedCharacters: Map<string, Character> = new Map();
  const pairedThisCycle: Set<string> = new Set();

  // Initialize with current state
  for (const char of characters) {
    updatedCharacters.set(char.id, { ...char });
  }

  // Opening event
  const openingLines = [
    "The villa stirs. Alliances will be tested.",
    "Another cycle begins in the villa.",
    "Tensions are running high tonight.",
    "The islanders are restless.",
  ];
  newEvents.push({
    id: uuidv4(),
    timestamp: new Date(Date.now() - 1000),
    category: "shift",
    actors: [],
    description: openingLines[Math.floor(Math.random() * openingLines.length)],
  });

  // PHASE 1: Pair up characters for conversations
  // Every character should have at least one conversation per cycle
  const shuffledCharacters = [...characters].sort(() => Math.random() - 0.5);
  const conversationPromises: Promise<void>[] = [];

  // First pass: pair everyone up
  for (const initiator of shuffledCharacters) {
    if (pairedThisCycle.has(initiator.id)) continue;

    const recipient = pickConversationPartner(
      initiator,
      characters,
      pairedThisCycle
    );

    if (!recipient) continue;

    // Mark both as paired
    pairedThisCycle.add(initiator.id);
    pairedThisCycle.add(recipient.id);

    // Queue conversation generation
    conversationPromises.push(
      generateAndProcessConversation(
        initiator,
        recipient,
        characters,
        updatedCharacters,
        newConversations,
        newInteractions,
        newEvents
      )
    );
  }

  // Second pass: anyone left out gets paired with someone who's already talked
  // This ensures no one is left alone
  for (const character of shuffledCharacters) {
    if (pairedThisCycle.has(character.id)) continue;

    // Find someone to talk to (even if they already talked to someone else)
    const availablePartners = characters.filter(c => c.id !== character.id);
    if (availablePartners.length === 0) continue;

    // Pick based on emotional state
    const weights = availablePartners.map(c => {
      const attraction = character.emotionalState.attraction[c.id] ?? 50;
      const jealousy = character.emotionalState.jealousy[c.id] ?? 0;
      return { character: c, weight: attraction + jealousy * 0.3 + Math.random() * 30 };
    });
    weights.sort((a, b) => b.weight - a.weight);
    const recipient = weights[0].character;

    pairedThisCycle.add(character.id);

    conversationPromises.push(
      generateAndProcessConversation(
        character,
        recipient,
        characters,
        updatedCharacters,
        newConversations,
        newInteractions,
        newEvents
      )
    );
  }

  // Wait for all conversations to complete
  await Promise.all(conversationPromises);

  // PHASE 2: Resolve coupling/breakup logic
  const charArray = Array.from(updatedCharacters.values());

  for (let i = 0; i < charArray.length; i++) {
    for (let j = i + 1; j < charArray.length; j++) {
      const char1 = charArray[i];
      const char2 = charArray[j];

      // Check for new coupling
      if (shouldCouple(char1, char2)) {
        char1.currentPartner = char2.id;
        char2.currentPartner = char1.id;
        char1.emotionalState.security = clamp(char1.emotionalState.security + 15);
        char2.emotionalState.security = clamp(char2.emotionalState.security + 15);

        updatedCharacters.set(char1.id, char1);
        updatedCharacters.set(char2.id, char2);

        const couplingLines = [
          `${char1.name} and ${char2.name} have made it official.`,
          `${char1.name} and ${char2.name} are now coupled up.`,
          `It's official. ${char1.name} chose ${char2.name}.`,
        ];
        newEvents.push({
          id: uuidv4(),
          timestamp: new Date(Date.now() + 10000),
          category: "coupling",
          actors: [char1.id, char2.id],
          description: couplingLines[Math.floor(Math.random() * couplingLines.length)],
        });
      }

      // Check for breakup
      if (char1.currentPartner === char2.id) {
        if (shouldBreakUp(char1, char2) || shouldBreakUp(char2, char1)) {
          char1.currentPartner = null;
          char2.currentPartner = null;
          char1.emotionalState.security = clamp(char1.emotionalState.security - 20);
          char2.emotionalState.security = clamp(char2.emotionalState.security - 20);

          updatedCharacters.set(char1.id, char1);
          updatedCharacters.set(char2.id, char2);

          const breakupLines = [
            `${char1.name} and ${char2.name} have called it off.`,
            `It's over between ${char1.name} and ${char2.name}.`,
            `${char1.name} and ${char2.name} are no longer together.`,
          ];
          newEvents.push({
            id: uuidv4(),
            timestamp: new Date(Date.now() + 10000),
            category: "drift",
            actors: [char1.id, char2.id],
            description: breakupLines[Math.floor(Math.random() * breakupLines.length)],
          });
        }
      }
    }
  }

  // PHASE 3: Confessional booth - one or two characters each cycle
  const confessionalCandidates = [...charArray].sort(() => Math.random() - 0.5);
  const confessionalCount = Math.random() > 0.5 ? 2 : 1;

  for (let i = 0; i < confessionalCount && i < confessionalCandidates.length; i++) {
    const character = confessionalCandidates[i];
    const confessional = await generateConfessionalForCharacter(
      character,
      charArray,
      recentInteractions
    );

    if (confessional) {
      newConfessionals.push(confessional);

      const updatedChar = updatedCharacters.get(character.id)!;
      updatedChar.lastConfessionalAt = new Date();
      updatedCharacters.set(character.id, updatedChar);

      newEvents.push({
        id: uuidv4(),
        timestamp: new Date(Date.now() + 5000 + i * 1000),
        category: "shift",
        actors: [character.id],
        description: `${character.name} stepped into the confessional booth.`,
      });
    }
  }

  // Sort events by timestamp
  newEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Persist all changes
  for (const character of updatedCharacters.values()) {
    await updateCharacter(character);
  }

  for (const interaction of newInteractions) {
    await createInteraction(interaction);
  }

  for (const event of newEvents) {
    await createTimelineEvent(event);
  }

  for (const confessional of newConfessionals) {
    await createConfessional(confessional);
  }

  for (const conversation of newConversations) {
    await createConversation(conversation);
  }

  return {
    interactions: newInteractions,
    events: newEvents,
    confessionals: newConfessionals,
    conversations: newConversations,
  };
}
