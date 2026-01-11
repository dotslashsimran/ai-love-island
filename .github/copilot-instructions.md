<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Love Island - Development Guidelines

## Project Overview
AI Love Island is a perpetual relationship simulator with six autonomous AI characters. The simulation never ends and drama accumulates indefinitely.

## Key Constraints
- **Fixed Characters**: Exactly six characters (Ayla, Miro, Sena, Ravi, Luna, Tariq). Never add or remove.
- **No User Interaction**: Users observe only. No voting, input, or resets.
- **AI Engine**: DeepSeek API for all character cognition. Claude designs prompts but never invents outcomes.
- **Tone**: Voyeuristic but restrained. Slightly saucy, never goofy. No emojis in commentary.

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS (dark theme only)
- Supabase for persistence
- DeepSeek API for AI

## Code Style
- Keep UI minimal and text-first
- Commentary is single sentences, suggestive not explicit
- Interactions are events with effects, not conversations
- Emotional values range 0-100
- Deltas are clamped to -10 to +10 per cycle

## Files to Know
- `src/lib/simulation.ts` - Agent loop logic
- `src/lib/deepseek.ts` - AI prompting
- `src/data/characters.ts` - Fixed character roster
- `src/types/index.ts` - All type definitions
