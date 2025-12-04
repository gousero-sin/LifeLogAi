// LifeLog IA - Type Definitions

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: number;
  user_id: number;
  deepseek_api_key: string | null;
  ai_depth: 'shallow' | 'medium' | 'deep';
  theme: 'light' | 'dark' | 'system';
  discrete_mode: boolean;
  notifications_enabled: boolean;
  notification_time: string;
}

export interface Entry {
  id: number;
  user_id: number;
  entry_date: string;
  content: string | null;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress: number | null;
  focus: number | null;
  physical_discomfort: number | null;
  highlight: string | null;
  is_private: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  emotions?: EntryEmotion[];
  insights?: AIInsight[];
}

export interface Tag {
  id: number;
  user_id: number | null;
  name: string;
  color: string;
  icon: string;
  is_system: boolean;
}

export interface EntryTag {
  id: number;
  entry_id: number;
  tag_id: number;
}

export interface AIInsight {
  id: number;
  user_id: number;
  entry_id: number | null;
  insight_type: 'daily_summary' | 'tomorrow_plan' | 'weekly_summary' | 'monthly_summary' | 'pattern' | 'suggestion';
  content: string;
  metadata: string | null;
  created_at: string;
}

export interface EntryEmotion {
  id: number;
  entry_id: number;
  emotion: string;
  intensity: number;
}

// API Request/Response types
export interface CreateEntryRequest {
  entry_date: string;
  content?: string;
  mood?: number;
  energy?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  stress?: number;
  focus?: number;
  physical_discomfort?: number;
  highlight?: string;
  is_private?: boolean;
  tag_ids?: number[];
}

export interface UpdateSettingsRequest {
  deepseek_api_key?: string;
  ai_depth?: 'shallow' | 'medium' | 'deep';
  theme?: 'light' | 'dark' | 'system';
  discrete_mode?: boolean;
  notifications_enabled?: boolean;
  notification_time?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// DeepSeek API types
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Dashboard/Analytics types
export interface DashboardStats {
  avgMood: number;
  avgEnergy: number;
  avgSleep: number;
  avgStress: number;
  totalEntries: number;
  currentStreak: number;
  topTags: { name: string; count: number; color: string }[];
  moodTrend: { date: string; mood: number }[];
  sleepTrend: { date: string; hours: number }[];
}

// Cloudflare Bindings
export interface Bindings {
  DB: D1Database;
  JWT_SECRET: string;
}

export interface Variables {
  user: User;
}
