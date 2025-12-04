// LifeLog IA - Settings Routes

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Bindings, Variables, UserSettings, UpdateSettingsRequest } from '../types';

const settings = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
settings.use('*', authMiddleware);

// Get user settings
settings.get('/', async (c) => {
  const user = c.get('user');

  try {
    let userSettings = await c.env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first<UserSettings>();

    // Create default settings if not exists
    if (!userSettings) {
      await c.env.DB.prepare(
        'INSERT INTO user_settings (user_id) VALUES (?)'
      ).bind(user.id).run();

      userSettings = await c.env.DB.prepare(
        'SELECT * FROM user_settings WHERE user_id = ?'
      ).bind(user.id).first<UserSettings>();
    }

    // Mask API key for response
    const maskedSettings = {
      ...userSettings,
      deepseek_api_key: userSettings?.deepseek_api_key 
        ? `sk-...${userSettings.deepseek_api_key.slice(-4)}` 
        : null,
      has_api_key: Boolean(userSettings?.deepseek_api_key)
    };

    return c.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Erro ao buscar configurações' }, 500);
  }
});

// Update settings
settings.patch('/', async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json<UpdateSettingsRequest>();
    const {
      deepseek_api_key,
      ai_depth,
      theme,
      discrete_mode,
      notifications_enabled,
      notification_time
    } = body;

    // Validate ai_depth
    if (ai_depth && !['shallow', 'medium', 'deep'].includes(ai_depth)) {
      return c.json({ error: 'Profundidade de IA inválida' }, 400);
    }

    // Validate theme
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
      return c.json({ error: 'Tema inválido' }, 400);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (deepseek_api_key !== undefined) {
      updates.push('deepseek_api_key = ?');
      values.push(deepseek_api_key || null);
    }
    if (ai_depth !== undefined) {
      updates.push('ai_depth = ?');
      values.push(ai_depth);
    }
    if (theme !== undefined) {
      updates.push('theme = ?');
      values.push(theme);
    }
    if (discrete_mode !== undefined) {
      updates.push('discrete_mode = ?');
      values.push(discrete_mode ? 1 : 0);
    }
    if (notifications_enabled !== undefined) {
      updates.push('notifications_enabled = ?');
      values.push(notifications_enabled ? 1 : 0);
    }
    if (notification_time !== undefined) {
      updates.push('notification_time = ?');
      values.push(notification_time);
    }

    if (updates.length === 0) {
      return c.json({ error: 'Nenhuma configuração para atualizar' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(user.id);

    await c.env.DB.prepare(`
      UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?
    `).bind(...values).run();

    // Get updated settings
    const userSettings = await c.env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first<UserSettings>();

    const maskedSettings = {
      ...userSettings,
      deepseek_api_key: userSettings?.deepseek_api_key 
        ? `sk-...${userSettings.deepseek_api_key.slice(-4)}` 
        : null,
      has_api_key: Boolean(userSettings?.deepseek_api_key)
    };

    return c.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Erro ao atualizar configurações' }, 500);
  }
});

// Test DeepSeek API key
settings.post('/test-api-key', async (c) => {
  const user = c.get('user');

  try {
    const { api_key } = await c.req.json<{ api_key?: string }>();

    // Get existing key if not provided
    let keyToTest = api_key;
    if (!keyToTest) {
      const userSettings = await c.env.DB.prepare(
        'SELECT deepseek_api_key FROM user_settings WHERE user_id = ?'
      ).bind(user.id).first<{ deepseek_api_key: string }>();
      keyToTest = userSettings?.deepseek_api_key;
    }

    if (!keyToTest) {
      return c.json({ 
        valid: false, 
        error: 'Nenhuma API key fornecida ou configurada' 
      }, 400);
    }

    // Test the API key with a simple request
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToTest}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Olá' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return c.json({ valid: true, message: 'API key válida!' });
    } else {
      const error = await response.json() as any;
      return c.json({ 
        valid: false, 
        error: error.error?.message || 'API key inválida' 
      });
    }
  } catch (error) {
    console.error('Test API key error:', error);
    return c.json({ 
      valid: false, 
      error: 'Erro ao testar API key' 
    }, 500);
  }
});

// Delete API key
settings.delete('/api-key', async (c) => {
  const user = c.get('user');

  try {
    await c.env.DB.prepare(`
      UPDATE user_settings SET deepseek_api_key = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(user.id).run();

    return c.json({ success: true, message: 'API key removida' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return c.json({ error: 'Erro ao remover API key' }, 500);
  }
});

export default settings;
