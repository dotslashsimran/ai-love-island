-- AI Love Island Database Schema
-- Run this in your Supabase SQL Editor

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  personality JSONB NOT NULL,
  current_partner TEXT REFERENCES characters(id),
  emotional_state JSONB NOT NULL,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  last_confessional_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  initiator TEXT NOT NULL REFERENCES characters(id),
  recipient TEXT NOT NULL REFERENCES characters(id),
  type TEXT NOT NULL CHECK (type IN ('private_conversation', 'sustained_interaction', 'withdrawal')),
  effects JSONB NOT NULL DEFAULT '{}',
  leaked_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL CHECK (category IN ('shift', 'tension', 'coupling', 'drift')),
  actors TEXT[] NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confessionals table
CREATE TABLE IF NOT EXISTS confessionals (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  character_id TEXT NOT NULL REFERENCES characters(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table (full private conversations)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  participants TEXT[] NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  context TEXT,
  emotional_outcome JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character memories table
CREATE TABLE IF NOT EXISTS character_memories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  character_id TEXT NOT NULL REFERENCES characters(id),
  about_character_id TEXT NOT NULL REFERENCES characters(id),
  memories TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, about_character_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_initiator ON interactions(initiator);
CREATE INDEX IF NOT EXISTS idx_interactions_recipient ON interactions(recipient);
CREATE INDEX IF NOT EXISTS idx_timeline_events_timestamp ON timeline_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_confessionals_timestamp ON confessionals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_confessionals_character ON confessionals(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_memories_character ON character_memories(character_id);
CREATE INDEX IF NOT EXISTS idx_memories_about ON character_memories(about_character_id);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_memories ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public read access for interactions" ON interactions FOR SELECT USING (true);
CREATE POLICY "Public read access for timeline_events" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Public read access for confessionals" ON confessionals FOR SELECT USING (true);
CREATE POLICY "Public read access for conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public read access for character_memories" ON character_memories FOR SELECT USING (true);

-- Service role write access (for simulation)
CREATE POLICY "Service role write for characters" ON characters FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write for interactions" ON interactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write for timeline_events" ON timeline_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write for confessionals" ON confessionals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write for conversations" ON conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write for character_memories" ON character_memories FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for characters updated_at
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
