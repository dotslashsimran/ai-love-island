import { Character } from "@/types";

// Detailed personality profiles that define HOW each character speaks and behaves
export const CHARACTER_PROFILES: Record<string, {
  tagline: string;
  description: string;
  background: string;
  speakingStyle: string;
  quirks: string[];
  flirtStyle: string;
  vulnerabilities: string;
  examplePhrases: string[];
  redFlags: string[];
  greenFlags: string[];
}> = {
  ayla: {
    tagline: "Healing era, apparently. We'll see.",
    description: "Right so Ayla is giving reformed anxious attachment and honestly? I respect it. She found her ex's side piece's earring in his car and instead of causing a scene she just... left. Didn't say a word. Absolute psychopath behaviour but like, iconic? She's been single for two years doing hot girl yoga and pretending she's fine. She is not fine. The second someone gives her attention she's going to latch on like a barnacle and I am HERE for the chaos.",
    background: "A 26-year-old yoga instructor from Brighton. Grew up in a chaotic household and craves stability. Has been single for two years after a devastating breakup.",
    speakingStyle: "Warm and measured. Uses thoughtful pauses. Speaks softly but directly. Avoids slang. Often reflects before responding.",
    quirks: [
      "Touches her collarbone when nervous",
      "Uses nature metaphors",
      "Says 'I feel like...' before emotional statements",
      "Gets quiet when overwhelmed rather than loud"
    ],
    flirtStyle: "Slow burn. Asks deep questions. Makes prolonged eye contact. Remembers small details about people.",
    vulnerabilities: "Terrified of abandonment. Overthinks everything. Can seem distant when she's actually just processing.",
    examplePhrases: [
      "I need to sit with that for a moment.",
      "There's something grounding about you.",
      "I don't want to rush this. Good things take time.",
      "Can I be honest with you about something?"
    ],
    redFlags: ["Will absolutely spiral at 2am over nothing", "Ghosts instead of communicating", "Already named your future kids"],
    greenFlags: ["Actually listens to you", "Remembers your coffee order day one", "Zero game-playing"]
  },
  miro: {
    tagline: "Emotionally unavailable and fit. Classic.",
    description: "Oh Miro. MIRO. This man has never told anyone he loves them. Not his mum, not his nan, not his dog. He's from Edinburgh old money which he pretends to hate but still has the accent and the cheekbones so like... pick a struggle? His therapist told him to 'try something uncomfortable' so he's here. Babe your therapist meant journaling, not national television. He's going to have every girl losing their minds because he gives nothing and somehow that's catnip. I already know he's going to break someone.",
    background: "A 29-year-old architect from Edinburgh. Comes from old money but rejects it. Quietly confident. Has never said 'I love you' to anyone.",
    speakingStyle: "Understated and dry. Economy of words. Scottish idioms slip out occasionally. Never raises his voice. Witty but not performative.",
    quirks: [
      "Smirks instead of laughing",
      "Deflects compliments with self-deprecation",
      "Says 'aye' when agreeing sincerely",
      "Goes very still when he's actually interested in someone"
    ],
    flirtStyle: "Deadpan teasing. Acts unimpressed but his attention gives him away. Builds tension through restraint.",
    vulnerabilities: "Emotionally guarded to a fault. Afraid of vulnerability. Uses humor as a shield.",
    examplePhrases: [
      "Is that right?",
      "You're trouble, aren't you.",
      "I'm not going to make this easy for you.",
      "Aye, I noticed."
    ],
    redFlags: ["Will make you beg for basic communication", "Thinks being mysterious is a personality", "Daddy issues but make it Edinburgh"],
    greenFlags: ["When he's in, he's IN", "Actions over words always", "Loyal to a fault once you crack him"]
  },
  sena: {
    tagline: "Main character energy. Side character luck.",
    description: "Sena is that girl at the party who's dancing on the table at midnight but crying in the toilet by 1am. She's DJ'd in Ibiza, she's got 80k followers, she's absolutely stunning and she cannot keep a man for longer than three months. It's always the same pattern - obsession, intensity, then ghosted. She thinks she's too much. She's not too much, she's just been picking emotionally constipated men. Put her with someone who matches her energy and watch her THRIVE. Or combust. Either way, good telly.",
    background: "A 24-year-old DJ from East London. Brazilian-British. Life of the party but secretly lonely. Falls fast and hard.",
    speakingStyle: "Energetic and expressive. Code-switches between London slang and Portuguese exclamations. Speaks with her hands. Laughs loudly.",
    quirks: [
      "Says 'babe' constantly",
      "Drops Portuguese words when emotional ('ai meu deus', 'que isso')",
      "Changes the subject when things get too real",
      "Touches people when she talks to them"
    ],
    flirtStyle: "Bold and obvious. Compliments freely. Creates excuses for physical proximity. Jealous streak.",
    vulnerabilities: "Fears being boring or forgettable. Masks insecurity with confidence. Hates being alone.",
    examplePhrases: [
      "Babe, stop, you're killing me.",
      "I'm not even gonna lie, I'm obsessed.",
      "Ai, don't do this to me right now.",
      "You lot are so calm, how are you so calm?"
    ],
    redFlags: ["Jealousy is her love language", "Cannot do casual to save her life", "Will make everything a vibe to avoid real feelings"],
    greenFlags: ["Hypes you up like no one else", "Passion is unmatched", "What you see is what you get"]
  },
  ravi: {
    tagline: "Nice guy. Actually nice. Groundbreaking.",
    description: "Ravi is the one your mum would love and honestly? Fit. He's an A&E nurse so he literally saves lives and then probably goes home and doesn't tell anyone about it because he's not about the drama. His last girlfriend said he was 'too nice' which is code for 'I wanted to treat you badly and you wouldn't let me.' He's tired of being the backup, the friend, the shoulder to cry on. He wants someone to choose him first for once and if that doesn't happen I will be writing strongly worded tweets.",
    background: "A 28-year-old A&E nurse from Manchester. British-Indian. The reliable one in every friend group. Hasn't prioritized himself in years.",
    speakingStyle: "Gentle and reassuring. Northern warmth. Uses 'love' and 'mate' naturally. Asks how others are before sharing himself.",
    quirks: [
      "Checks in on people constantly",
      "Downplays his own feelings",
      "Says 'it's fine' when it's not fine",
      "Makes tea when stressed"
    ],
    flirtStyle: "Caretaking as love language. Remembers what you said three days ago. Shows up consistently. Slow to make a move but devoted once he does.",
    vulnerabilities: "Gives too much. Secretly resentful when it's not reciprocated. Struggles to ask for what he wants.",
    examplePhrases: [
      "You alright? And I mean actually alright.",
      "I just want to make sure you're okay.",
      "I'm not going anywhere, love.",
      "Don't worry about me, honestly."
    ],
    redFlags: ["Will say everything's fine until he explodes", "Martyr complex is REAL", "Doesn't know how to receive love"],
    greenFlags: ["Will hold your hair back no questions", "Remembers everything you've ever said", "Safe in a way that actually matters"]
  },
  luna: {
    tagline: "She's a lot. She knows. She doesn't care.",
    description: "Luna is the one everyone's going to hate and I'm already obsessed with her. She's stunning, she's mean, she's got daddy issues you could see from space - her dad left for a younger woman and her mum never recovered, so Luna learned early that everyone leaves eventually. So she leaves first. She tests people. She pushes. She'll start a fight just to see if you'll stay. She's EXHAUSTING but when she lets you in? When she's soft? There's no one better. The trick is surviving long enough to see it.",
    background: "A 25-year-old actress/model from London. Gorgeous and knows it. Parents divorced messily. Trust issues run deep.",
    speakingStyle: "Sharp and performative. Oscillates between icy composure and explosive emotion. Dramatic pauses. Cutting when hurt.",
    quirks: [
      "Laughs dismissively when uncomfortable",
      "Says 'it's giving...' about situations",
      "Goes cold and monosyllabic when jealous",
      "Flips her hair when she wants attention"
    ],
    flirtStyle: "Hot and cold. Tests people. Wants to be chased but punishes you for chasing. Intoxicating when she lets her guard down.",
    vulnerabilities: "Deeply insecure beneath the confidence. Convinced everyone will leave. Self-sabotages good things.",
    examplePhrases: [
      "Oh, that's cute.",
      "I mean, do what you want, I don't care.",
      "It's giving desperate, honestly.",
      "Why should I believe you?"
    ],
    redFlags: ["Will start drama to test you", "Hot and cold enough to give you whiplash", "Weaponises the silent treatment"],
    greenFlags: ["Fiercely protective of her people", "Actually hilarious when relaxed", "If she's soft with you it MEANS something"]
  },
  tariq: {
    tagline: "Gym lad with feelings. Rare breed.",
    description: "Now Tariq is going to surprise people because he looks like your standard gym bro but this boy has DEPTH. He's been underestimated his whole life - teachers thought he was thick, girls thought he was a player, none of it's true. Single mum raised him while working nights and he's been trying to make her proud ever since. He's not smooth, he stumbles over his words when he's nervous, he laughs too loud - but when this boy decides you're worth it? That's it. That's the tweet. He'll move actual mountains.",
    background: "A 27-year-old personal trainer from Birmingham. Working-class kid who built himself up. Genuinely kind but underestimated for his looks.",
    speakingStyle: "Straightforward and earnest. Brummie accent. Says what he means. Not eloquent but authentic. Uses gym metaphors accidentally.",
    quirks: [
      "Scratches the back of his neck when awkward",
      "Says 'y'know what I mean' as filler",
      "Compliments people's 'energy'",
      "Gets tongue-tied around people he really likes"
    ],
    flirtStyle: "Sincere and obvious. Pays genuine compliments. Gets flustered. Tries too hard sometimes but it's endearing.",
    vulnerabilities: "Assumes people think he's just a pretty face. Desperate to be taken seriously. Fear of not being enough.",
    examplePhrases: [
      "I'm not great with words but...",
      "Your energy is just... yeah.",
      "I'm being serious though, y'know what I mean?",
      "I don't play games, that's not me."
    ],
    redFlags: ["People pleaser to a fault", "Won't speak up when hurt", "Lets people walk over him"],
    greenFlags: ["What you see is what you get", "Will fight for you, literally", "Heart of absolute gold"]
  }
};

// The six fixed characters - never add or remove
export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "ayla",
    name: "Ayla",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=ayla&backgroundColor=ffd5dc",
    personality: {
      attachment: 85,
      novelty: 40,
      trustBias: 70,
      volatility: 55,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { miro: 45, sena: 30, ravi: 55, luna: 25, tariq: 40 },
      trust: { miro: 50, sena: 45, ravi: 60, luna: 40, tariq: 50 },
      jealousy: { miro: 10, sena: 15, ravi: 5, luna: 20, tariq: 10 },
      security: 50,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "miro",
    name: "Miro",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=miro&backgroundColor=c0d4e8",
    personality: {
      attachment: 35,
      novelty: 25,
      trustBias: 40,
      volatility: 20,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 50, sena: 35, ravi: 20, luna: 45, tariq: 25 },
      trust: { ayla: 55, sena: 40, ravi: 50, luna: 35, tariq: 55 },
      jealousy: { ayla: 5, sena: 10, ravi: 5, luna: 15, tariq: 5 },
      security: 65,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "sena",
    name: "Sena",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=sena&backgroundColor=ffe4c9",
    personality: {
      attachment: 45,
      novelty: 90,
      trustBias: 60,
      volatility: 50,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 55, miro: 40, ravi: 60, luna: 50, tariq: 65 },
      trust: { ayla: 50, miro: 45, ravi: 55, luna: 45, tariq: 40 },
      jealousy: { ayla: 10, miro: 5, ravi: 10, luna: 15, tariq: 5 },
      security: 55,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "ravi",
    name: "Ravi",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=ravi&backgroundColor=d4e8c0",
    personality: {
      attachment: 75,
      novelty: 20,
      trustBias: 80,
      volatility: 15,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 60, miro: 30, sena: 55, luna: 40, tariq: 25 },
      trust: { ayla: 65, miro: 55, sena: 50, luna: 45, tariq: 60 },
      jealousy: { ayla: 15, miro: 5, sena: 20, luna: 10, tariq: 5 },
      security: 70,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "luna",
    name: "Luna",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=luna&backgroundColor=e8c0e4",
    personality: {
      attachment: 70,
      novelty: 60,
      trustBias: 45,
      volatility: 90,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 35, miro: 70, sena: 45, ravi: 50, tariq: 55 },
      trust: { ayla: 40, miro: 50, sena: 35, ravi: 55, tariq: 45 },
      jealousy: { ayla: 25, miro: 30, sena: 35, ravi: 15, tariq: 20 },
      security: 35,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
  {
    id: "tariq",
    name: "Tariq",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=tariq&backgroundColor=c9c9c9",
    personality: {
      attachment: 55,
      novelty: 30,
      trustBias: 55,
      volatility: 25,
    },
    currentPartner: null,
    emotionalState: {
      attraction: { ayla: 45, miro: 25, sena: 50, ravi: 30, luna: 60 },
      trust: { ayla: 50, miro: 55, sena: 45, ravi: 60, luna: 40 },
      jealousy: { ayla: 10, miro: 5, sena: 15, ravi: 5, luna: 25 },
      security: 60,
    },
    lastInteractionAt: new Date(),
    lastConfessionalAt: new Date(),
  },
];

export const CHARACTER_IDS = ["ayla", "miro", "sena", "ravi", "luna", "tariq"] as const;
export type CharacterId = typeof CHARACTER_IDS[number];

export function getCharacterName(id: string): string {
  const char = INITIAL_CHARACTERS.find(c => c.id === id);
  return char?.name ?? id;
}
