import { Character, AgentResponse, Interaction } from "@/types";
import { getCharacterName, CHARACTER_PROFILES } from "@/data/characters";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function buildSystemPrompt(character: Character): string {
  const profile = CHARACTER_PROFILES[character.id];
  
  return `You are ${character.name}, a contestant on a dating show in a villa with five other people.

WHO YOU ARE:
${profile.background}

HOW YOU SPEAK:
${profile.speakingStyle}

YOUR QUIRKS:
${profile.quirks.map(q => `- ${q}`).join('\n')}

HOW YOU FLIRT:
${profile.flirtStyle}

YOUR VULNERABILITIES:
${profile.vulnerabilities}

PHRASES YOU MIGHT SAY:
${profile.examplePhrases.map(p => `"${p}"`).join(', ')}

Your emotional tendencies (0-100 scale):
- Attachment: ${character.personality.attachment} (how fast you catch feelings)
- Novelty seeking: ${character.personality.novelty} (desire for new connections vs loyalty)
- Trust bias: ${character.personality.trustBias} (how easily you trust)
- Volatility: ${character.personality.volatility} (emotional swings)

You are here to find love. You act on feelings, attraction, and instincts.
You take risks. You pursue people who interest you.
You get jealous. You feel insecure. You make moves.

IMPORTANT: You should frequently "pursue" people you're attracted to. This means pulling them aside for private conversations. Don't just observe - make moves.

Respond ONLY with valid JSON:
{
  "emotionalUpdates": {
    "attraction": { "characterId": delta },
    "trust": { "characterId": delta },
    "jealousy": { "characterId": delta }
  },
  "intent": {
    "target": "characterId or null",
    "action": "pursue | maintain | pull_away | observe"
  },
  "confessional": "your private thought IN YOUR VOICE (1-2 sentences) or null",
  "leakedExcerpt": "something you might say out loud IN YOUR VOICE (under 10 words) or null"
}

CRITICAL: Your confessional and leakedExcerpt MUST sound like YOU. Use your speech patterns, your phrases, your accent. Stay in character.

Actions explained:
- pursue: Pull someone aside for a private conversation. Do this when attracted to someone.
- maintain: Stay close to your current partner or someone you're comfortable with.
- pull_away: Create distance from someone. Do this when trust is broken or feelings fade.
- observe: Watch from afar. Only do this if genuinely unsure what to do.

Deltas: -10 to +10. Only include characters whose feelings changed.`;
}

function buildUserPayload(
  character: Character,
  allCharacters: Character[],
  recentInteractions: Interaction[]
): string {
  const others = allCharacters.filter((c) => c.id !== character.id);

  const interactionSummaries = recentInteractions
    .filter((i) => i.initiator === character.id || i.recipient === character.id)
    .slice(0, 10)
    .map((i) => {
      const other = i.initiator === character.id ? i.recipient : i.initiator;
      const role = i.initiator === character.id ? "initiated" : "received";
      return `- ${role} ${i.type.replace(/_/g, " ")} with ${getCharacterName(other)}`;
    })
    .join("\n");

  // Find who's single and available
  const singles = others.filter(o => !o.currentPartner).map(o => o.name);
  const taken = others.filter(o => o.currentPartner).map(o => `${o.name} (with ${getCharacterName(o.currentPartner!)})`);

  // Suggest action based on state
  let suggestion = "";
  if (!character.currentPartner) {
    const highAttraction = others.find(o => (character.emotionalState.attraction[o.id] ?? 50) > 55);
    if (highAttraction) {
      suggestion = `\nYou've been thinking about ${highAttraction.name}. Maybe it's time to make a move.`;
    } else {
      suggestion = `\nYou're single. Who catches your eye?`;
    }
  } else {
    const partner = others.find(o => o.id === character.currentPartner);
    const wanderingEye = others.find(o => o.id !== character.currentPartner && (character.emotionalState.attraction[o.id] ?? 50) > 60);
    if (wanderingEye) {
      suggestion = `\nYou're with ${partner?.name}, but you can't stop thinking about ${wanderingEye.name}.`;
    }
  }

  return `CURRENT SITUATION:
You are: ${character.currentPartner ? `coupled with ${getCharacterName(character.currentPartner)}` : "SINGLE"}
Security level: ${character.emotionalState.security}/100

YOUR FEELINGS:
${others
  .map(
    (o) => `- ${o.name}: attraction=${character.emotionalState.attraction[o.id] ?? 50}, trust=${character.emotionalState.trust[o.id] ?? 50}, jealousy=${character.emotionalState.jealousy[o.id] ?? 0}`
  )
  .join("\n")}

WHO'S AVAILABLE:
Single: ${singles.length > 0 ? singles.join(", ") : "Nobody"}
Taken: ${taken.length > 0 ? taken.join(", ") : "Nobody"}

RECENT HISTORY:
${interactionSummaries || "Nothing notable"}
${suggestion}

What do you do? Who do you pursue, maintain connection with, or pull away from?`;
}

export async function getCharacterDecision(
  character: Character,
  allCharacters: Character[],
  recentInteractions: Interaction[]
): Promise<AgentResponse | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY not configured");
    return null;
  }

  const systemPrompt = buildSystemPrompt(character);
  const userPayload = buildUserPayload(character, allCharacters, recentInteractions);

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPayload },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", response.status, await response.text());
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
    return validateAgentResponse(parsed);
  } catch (error) {
    console.error("Error calling DeepSeek:", error);
    return null;
  }
}

function validateAgentResponse(data: unknown): AgentResponse | null {
  if (!data || typeof data !== "object") return null;

  const response = data as Record<string, unknown>;

  if (!response.emotionalUpdates || !response.intent) return null;

  const emotionalUpdates = response.emotionalUpdates as Record<string, Record<string, number>>;
  const intent = response.intent as { target: string | null; action: string };

  const clampDelta = (val: number) => Math.max(-10, Math.min(10, val));

  const validatedUpdates = {
    attraction: {} as Record<string, number>,
    trust: {} as Record<string, number>,
    jealousy: {} as Record<string, number>,
  };

  for (const [key, deltas] of Object.entries(emotionalUpdates)) {
    if (key in validatedUpdates && deltas && typeof deltas === "object") {
      for (const [charId, delta] of Object.entries(deltas)) {
        if (typeof delta === "number") {
          validatedUpdates[key as keyof typeof validatedUpdates][charId] = clampDelta(delta);
        }
      }
    }
  }

  const validActions = ["pursue", "maintain", "pull_away", "observe"];
  const action = validActions.includes(intent.action) ? intent.action : "observe";

  return {
    emotionalUpdates: validatedUpdates,
    intent: {
      target: typeof intent.target === "string" ? intent.target : null,
      action: action as AgentResponse["intent"]["action"],
    },
    confessional: typeof response.confessional === "string" ? response.confessional : null,
    leakedExcerpt: typeof response.leakedExcerpt === "string" ? response.leakedExcerpt : null,
  };
}
