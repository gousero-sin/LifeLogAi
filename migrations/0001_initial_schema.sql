-- LifeLog IA - Initial Schema
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User settings (including API keys)
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  deepseek_api_key TEXT,
  ai_depth TEXT DEFAULT 'medium' CHECK (ai_depth IN ('shallow', 'medium', 'deep')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  discrete_mode INTEGER DEFAULT 0,
  notifications_enabled INTEGER DEFAULT 1,
  notification_time TEXT DEFAULT '21:00',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily entries (main diary entries)
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  content TEXT,
  mood INTEGER CHECK (mood >= 0 AND mood <= 10),
  energy INTEGER CHECK (energy >= 0 AND energy <= 10),
  sleep_hours REAL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
  stress INTEGER CHECK (stress >= 0 AND stress <= 10),
  focus INTEGER CHECK (focus >= 0 AND focus <= 10),
  physical_discomfort INTEGER CHECK (physical_discomfort >= 0 AND physical_discomfort <= 10),
  highlight TEXT,
  is_private INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, entry_date)
);

-- Tags (predefined + custom)
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'tag',
  is_system INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Entry-Tag relationship
CREATE TABLE IF NOT EXISTS entry_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(entry_id, tag_id)
);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  entry_id INTEGER,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily_summary', 'tomorrow_plan', 'weekly_summary', 'monthly_summary', 'pattern', 'suggestion')),
  content TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

-- Detected emotions/feelings
CREATE TABLE IF NOT EXISTS entry_emotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  emotion TEXT NOT NULL,
  intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_tags_tag ON entry_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_entry ON ai_insights(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_emotions_entry ON entry_emotions(entry_id);

-- Insert system tags (predefined)
INSERT OR IGNORE INTO tags (id, user_id, name, color, icon, is_system) VALUES
  (1, NULL, 'saude', '#22c55e', 'heart-pulse', 1),
  (2, NULL, 'faculdade', '#3b82f6', 'graduation-cap', 1),
  (3, NULL, 'estagio', '#8b5cf6', 'briefcase', 1),
  (4, NULL, 'trabalho', '#f59e0b', 'laptop', 1),
  (5, NULL, 'familia', '#ec4899', 'users', 1),
  (6, NULL, 'amor', '#ef4444', 'heart', 1),
  (7, NULL, 'jogos', '#06b6d4', 'gamepad-2', 1),
  (8, NULL, 'espiritualidade', '#a855f7', 'sparkles', 1),
  (9, NULL, 'lazer', '#10b981', 'coffee', 1),
  (10, NULL, 'ansiedade', '#f97316', 'alert-triangle', 1),
  (11, NULL, 'conquista', '#fbbf24', 'trophy', 1),
  (12, NULL, 'exercicio', '#14b8a6', 'dumbbell', 1);
