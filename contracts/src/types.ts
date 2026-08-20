// Contract types matching contracts/schemas/*.schema.json
// Generated from schemas — keep in sync

export type SchemaVersion = '1.0';

export interface DeviceConfig {
  schema_version: SchemaVersion;
  device_id: string;
  hardware_variant: 'integrated' | 'respeaker';
  personality?: {
    name?: string;
    sarcasm?: number;
    profanity?: number;
    allowed_topics?: string[];
  };
  display?: {
    brightness?: number;
    dim_on_idle?: boolean;
    sleep_after_seconds?: number;
    text_size?: number;
    scroll_speed?: number;
  };
  audio?: {
    volume?: number;
    voice?: string;
    speed?: number;
    response_medium?: 'voice' | 'text' | 'both';
  };
  ai_profile?: 'economico' | 'equilibrado' | 'maxima';
}

export interface Profile {
  schema_version: SchemaVersion;
  id: string;
  device_id: string;
  name: string;
  nickname?: string;
  is_persistent: boolean;
  created_at: string;
  last_seen_at?: string;
}

export interface Session {
  schema_version: SchemaVersion;
  id: string;
  device_id: string;
  profile_id: string;
  started_at: string;
  ended_at?: string;
  message_count?: number;
  context?: {
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
    weather?: string;
    recent_memories?: string[];
  };
}

export interface Memory {
  schema_version: SchemaVersion;
  id: string;
  device_id: string;
  profile_id: string;
  content: string;
  summary?: string;
  category: 'preference' | 'fact' | 'event' | 'context' | 'instruction';
  importance: number;
  source: 'conversation' | 'user_correction' | 'daily_briefing' | 'system';
  tags?: string[];
  created_at: string;
  expires_at?: string | null;
  deleted_at?: string | null;
}

export interface DeviceStatus {
  schema_version: SchemaVersion;
  device_id: string;
  state: 'idle' | 'happy' | 'thinking' | 'surprised' | 'funny' | 'angry' | 'listening' | 'speaking';
  overlay: 'offline' | 'actualizando' | 'error' | null;
  battery_level: number | null;
  wifi_connected: boolean;
  backend_connected: boolean;
  firmware_version: string;
  xvf3800_version: string | null;
  timestamp: string;
}
