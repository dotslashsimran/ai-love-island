import { Character, ConversationMessage, CharacterMemory } from "@/types";
import { getCharacterName } from "@/data/characters";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface ConversationContext {
  initiator: Character;
  recipient: Character;
  initiatorMemories: CharacterMemory | null;
  recipientMemories: CharacterMemory | null;
  reason: "pursue" | "maintain" | "tension";
}

function buildConversationPrompt(ctx: ConversationContext): string {
  const { initiator, recipient, initiatorMemories, recipientMemories, reason } = ctx;

  const initiatorFeelings = `attraction: ${initiator.emotionalState.attraction[recipient.id] ?? 50}, trust: ${initiator.emotionalState.trust[recipient.id] ?? 50}, jealousy: ${initiator.emotionalState.jealousy[recipient.id] ?? 0}`;
  const recipientFeelings = `attraction: ${recipient.emotionalState.attraction[initiator.id] ?? 50}, trust: ${recipient.emotionalState.trust[initiator.id] ?? 50}, jealousy: ${recipient.emotionalState.jealousy[initiator.id] ?? 0}`;

  const initiatorMemStr = initiatorMemories?.memories.length
    ? `${initiator.name}'s memories of ${recipient.name}: ${initiatorMemories.memories.slice(-3).join("; ")}`
    : `${initiator.name} has no specific memories of ${recipient.name} yet.`;

  const recipientMemStr = recipientMemories?.memories.length
    ? `${recipient.name}'s memories of ${initiator.name}: ${recipientMemories.memories.slice(-3).join("; ")}`
    : `${recipient.name} has no specific memories of ${initiator.name} yet.`;

  const reasonContext = {
    pursue: `${initiator.name} is actively interested in ${recipient.name} and initiates conversation with romantic intent.`,
    maintain: `${initiator.name} and ${recipient.name} are comfortable with each other. This is a casual, intimate moment.`,
    tension: `There's unresolved tension between them. Something feels off or uncertain.`,
  };

  return `You are simulating a private conversation between two people in a romantic social environment (like a dating show villa).

CHARACTERS:
${initiator.name} (initiating):
- Personality: attachment=${initiator.personality.attachment}, novelty=${initiator.personality.novelty}, volatility=${initiator.personality.volatility}
- Feelings toward ${recipient.name}: ${initiatorFeelings}
- Partner: ${initiator.currentPartner ? getCharacterName(initiator.currentPartner) : "None"}
${initiatorMemStr}

${recipient.name} (responding):
- Personality: attachment=${recipient.personality.attachment}, novelty=${recipient.personality.novelty}, volatility=${recipient.personality.volatility}
- Feelings toward ${initiator.name}: ${recipientFeelings}
- Partner: ${recipient.currentPartner ? getCharacterName(recipient.currentPartner) : "None"}
${recipientMemStr}

CONTEXT: ${reasonContext[reason]}

Generate a realistic, emotionally authentic conversation of 4-8 exchanges. The dialogue should:
- Feel natural and human, not scripted
- Show subtext and emotional undercurrents
- Include flirtation, vulnerability, or tension as appropriate
- Never be explicit, but can be suggestive and intimate
- Reflect each character's personality and current feelings
- Reference memories if relevant

Respond with JSON only:
{
  "messages": [
    { "speaker": "name", "content": "dialogue" },
    ...
  ],
  "emotionalShift": {
    "initiator": { "attractionDelta": number, "trustDelta": number },
    "recipient": { "attractionDelta": number, "trustDelta": number }
  },
  "memoryForInitiator": "A one-sentence summary of what ${initiator.name} will remember about this conversation",
  "memoryForRecipient": "A one-sentence summary of what ${recipient.name} will remember about this conversation"
}

Deltas should be between -5 and +5. Positive means feelings increased.`;
}

export interface GeneratedConversation {
  messages: ConversationMessage[];
  emotionalShift: {
    initiator: { attractionDelta: number; trustDelta: number };
    recipient: { attractionDelta: number; trustDelta: number };
  };
  memoryForInitiator: string;
  memoryForRecipient: string;
}

export async function generateConversation(
  ctx: ConversationContext
): Promise<GeneratedConversation | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY not configured");
    return null;
  }

  const prompt = buildConversationPrompt(ctx);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in DeepSeek response");
      return null;
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    return validateConversationResponse(parsed, ctx.initiator.name, ctx.recipient.name);
  } catch (error) {
    console.error("Error generating conversation:", error);
    return null;
  }
}

function validateConversationResponse(
  data: unknown,
  initiatorName: string,
  recipientName: string
): GeneratedConversation | null {
  if (!data || typeof data !== "object") return null;

  const response = data as Record<string, unknown>;

  if (!Array.isArray(response.messages) || response.messages.length === 0) {
    return null;
  }

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const messages: ConversationMessage[] = response.messages.map((m: { speaker: string; content: string }) => ({
    speaker: m.speaker,
    content: m.content,
    timestamp: new Date(),
  }));

  const shift = response.emotionalShift as {
    initiator?: { attractionDelta?: number; trustDelta?: number };
    recipient?: { attractionDelta?: number; trustDelta?: number };
  } | undefined;

  return {
    messages,
    emotionalShift: {
      initiator: {
        attractionDelta: clamp(shift?.initiator?.attractionDelta ?? 0, -5, 5),
        trustDelta: clamp(shift?.initiator?.trustDelta ?? 0, -5, 5),
      },
      recipient: {
        attractionDelta: clamp(shift?.recipient?.attractionDelta ?? 0, -5, 5),
        trustDelta: clamp(shift?.recipient?.trustDelta ?? 0, -5, 5),
      },
    },
    memoryForInitiator:
      typeof response.memoryForInitiator === "string"
        ? response.memoryForInitiator
        : `Had a conversation with ${recipientName}`,
    memoryForRecipient:
      typeof response.memoryForRecipient === "string"
        ? response.memoryForRecipient
        : `Had a conversation with ${initiatorName}`,
  };
}
