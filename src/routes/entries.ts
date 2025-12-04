// LifeLog IA - Entries Routes

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateDailyInsights } from '../lib/deepseek';
import type { Bindings, Variables, Entry, Tag, CreateEntryRequest } from '../types';

const entries = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
entries.use('*', authMiddleware);

// Get all entries (with pagination and filters)
entries.get('/', async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '30');
  const offset = parseInt(c.req.query('offset') || '0');
  const startDate = c.req.query('start_date');
  const endDate = c.req.query('end_date');
  const tagId = c.req.query('tag_id');
  const minMood = c.req.query('min_mood');
  const maxMood = c.req.query('max_mood');

  try {
    let query = `
      SELECT DISTINCT e.* FROM entries e
      LEFT JOIN entry_tags et ON e.id = et.entry_id
      WHERE e.user_id = ?
    `;
    const params: any[] = [user.id];

    if (startDate) {
      query += ' AND e.entry_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.entry_date <= ?';
      params.push(endDate);
    }
    if (tagId) {
      query += ' AND et.tag_id = ?';
      params.push(parseInt(tagId));
    }
    if (minMood) {
      query += ' AND e.mood >= ?';
      params.push(parseInt(minMood));
    }
    if (maxMood) {
      query += ' AND e.mood <= ?';
      params.push(parseInt(maxMood));
    }

    query += ' ORDER BY e.entry_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Entry>();

    // Get tags for each entry
    const entriesWithTags = await Promise.all(
      (results || []).map(async (entry) => {
        const { results: tags } = await c.env.DB.prepare(`
          SELECT t.* FROM tags t
          JOIN entry_tags et ON t.id = et.tag_id
          WHERE et.entry_id = ?
        `).bind(entry.id).all<Tag>();

        return { ...entry, tags: tags || [] };
      })
    );

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT e.id) as total FROM entries e
      LEFT JOIN entry_tags et ON e.id = et.entry_id
      WHERE e.user_id = ?
    `;
    const countParams: any[] = [user.id];

    if (startDate) {
      countQuery += ' AND e.entry_date >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND e.entry_date <= ?';
      countParams.push(endDate);
    }
    if (tagId) {
      countQuery += ' AND et.tag_id = ?';
      countParams.push(parseInt(tagId));
    }

    const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();

    return c.json({
      entries: entriesWithTags,
      total: countResult?.total || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Get entries error:', error);
    return c.json({ error: 'Erro ao buscar entradas' }, 500);
  }
});

// Get single entry
entries.get('/:id', async (c) => {
  const user = c.get('user');
  const entryId = parseInt(c.req.param('id'));

  try {
    const entry = await c.env.DB.prepare(
      'SELECT * FROM entries WHERE id = ? AND user_id = ?'
    ).bind(entryId, user.id).first<Entry>();

    if (!entry) {
      return c.json({ error: 'Entrada não encontrada' }, 404);
    }

    // Get tags
    const { results: tags } = await c.env.DB.prepare(`
      SELECT t.* FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      WHERE et.entry_id = ?
    `).bind(entryId).all<Tag>();

    // Get insights
    const { results: insights } = await c.env.DB.prepare(
      'SELECT * FROM ai_insights WHERE entry_id = ? ORDER BY created_at DESC'
    ).bind(entryId).all();

    // Get emotions
    const { results: emotions } = await c.env.DB.prepare(
      'SELECT * FROM entry_emotions WHERE entry_id = ?'
    ).bind(entryId).all();

    return c.json({
      ...entry,
      tags: tags || [],
      insights: insights || [],
      emotions: emotions || []
    });
  } catch (error) {
    console.error('Get entry error:', error);
    return c.json({ error: 'Erro ao buscar entrada' }, 500);
  }
});

// Get entry by date
entries.get('/date/:date', async (c) => {
  const user = c.get('user');
  const date = c.req.param('date');

  try {
    const entry = await c.env.DB.prepare(
      'SELECT * FROM entries WHERE entry_date = ? AND user_id = ?'
    ).bind(date, user.id).first<Entry>();

    if (!entry) {
      return c.json({ entry: null });
    }

    // Get tags
    const { results: tags } = await c.env.DB.prepare(`
      SELECT t.* FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      WHERE et.entry_id = ?
    `).bind(entry.id).all<Tag>();

    // Get insights
    const { results: insights } = await c.env.DB.prepare(
      'SELECT * FROM ai_insights WHERE entry_id = ? ORDER BY created_at DESC'
    ).bind(entry.id).all();

    return c.json({
      entry: {
        ...entry,
        tags: tags || [],
        insights: insights || []
      }
    });
  } catch (error) {
    console.error('Get entry by date error:', error);
    return c.json({ error: 'Erro ao buscar entrada' }, 500);
  }
});

// Create or update entry
entries.post('/', async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json<CreateEntryRequest>();
    const {
      entry_date,
      content,
      mood,
      energy,
      sleep_hours,
      sleep_quality,
      stress,
      focus,
      physical_discomfort,
      highlight,
      is_private,
      tag_ids
    } = body;

    if (!entry_date) {
      return c.json({ error: 'Data é obrigatória' }, 400);
    }

    // Check if entry exists for this date
    const existingEntry = await c.env.DB.prepare(
      'SELECT id FROM entries WHERE entry_date = ? AND user_id = ?'
    ).bind(entry_date, user.id).first<{ id: number }>();

    let entryId: number;

    if (existingEntry) {
      // Update existing entry
      await c.env.DB.prepare(`
        UPDATE entries SET
          content = ?,
          mood = ?,
          energy = ?,
          sleep_hours = ?,
          sleep_quality = ?,
          stress = ?,
          focus = ?,
          physical_discomfort = ?,
          highlight = ?,
          is_private = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        content || null,
        mood ?? null,
        energy ?? null,
        sleep_hours ?? null,
        sleep_quality ?? null,
        stress ?? null,
        focus ?? null,
        physical_discomfort ?? null,
        highlight || null,
        is_private ? 1 : 0,
        existingEntry.id
      ).run();

      entryId = existingEntry.id;

      // Clear existing tags
      await c.env.DB.prepare('DELETE FROM entry_tags WHERE entry_id = ?').bind(entryId).run();
    } else {
      // Create new entry
      const result = await c.env.DB.prepare(`
        INSERT INTO entries (
          user_id, entry_date, content, mood, energy, sleep_hours, sleep_quality,
          stress, focus, physical_discomfort, highlight, is_private
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        entry_date,
        content || null,
        mood ?? null,
        energy ?? null,
        sleep_hours ?? null,
        sleep_quality ?? null,
        stress ?? null,
        focus ?? null,
        physical_discomfort ?? null,
        highlight || null,
        is_private ? 1 : 0
      ).run();

      entryId = result.meta.last_row_id as number;
    }

    // Add tags
    if (tag_ids && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await c.env.DB.prepare(
          'INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)'
        ).bind(entryId, tagId).run();
      }
    }

    // Get updated entry with tags
    const entry = await c.env.DB.prepare(
      'SELECT * FROM entries WHERE id = ?'
    ).bind(entryId).first<Entry>();

    const { results: tags } = await c.env.DB.prepare(`
      SELECT t.* FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      WHERE et.entry_id = ?
    `).bind(entryId).all<Tag>();

    return c.json({
      ...entry,
      tags: tags || []
    }, existingEntry ? 200 : 201);
  } catch (error) {
    console.error('Create entry error:', error);
    return c.json({ error: 'Erro ao salvar entrada' }, 500);
  }
});

// Generate AI insights for an entry
entries.post('/:id/insights', async (c) => {
  const user = c.get('user');
  const entryId = parseInt(c.req.param('id'));

  try {
    // Get entry
    const entry = await c.env.DB.prepare(
      'SELECT * FROM entries WHERE id = ? AND user_id = ?'
    ).bind(entryId, user.id).first<Entry>();

    if (!entry) {
      return c.json({ error: 'Entrada não encontrada' }, 404);
    }

    if (entry.is_private) {
      return c.json({ error: 'Esta entrada está marcada como privada e não será processada pela IA' }, 400);
    }

    // Get user settings
    const settings = await c.env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first<{ deepseek_api_key: string; ai_depth: string }>();

    if (!settings?.deepseek_api_key) {
      return c.json({ 
        error: 'API key não configurada',
        message: 'Configure sua API key da DeepSeek nas configurações para gerar insights.'
      }, 400);
    }

    // Get recent entries for context
    const { results: recentEntries } = await c.env.DB.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND entry_date < ? AND is_private = 0
      ORDER BY entry_date DESC LIMIT 7
    `).bind(user.id, entry.entry_date).all<Entry>();

    // Calculate context
    const validMoods = (recentEntries || []).filter(e => e.mood !== null).map(e => e.mood!);
    const validSleep = (recentEntries || []).filter(e => e.sleep_hours !== null).map(e => e.sleep_hours!);
    const validEnergy = (recentEntries || []).filter(e => e.energy !== null).map(e => e.energy!);

    const context = {
      recentEntries: recentEntries || [],
      avgMood: validMoods.length ? validMoods.reduce((a, b) => a + b, 0) / validMoods.length : 5,
      avgSleep: validSleep.length ? validSleep.reduce((a, b) => a + b, 0) / validSleep.length : 7,
      avgEnergy: validEnergy.length ? validEnergy.reduce((a, b) => a + b, 0) / validEnergy.length : 5,
      frequentTags: []
    };

    // Generate insights
    const insights = await generateDailyInsights(
      { apiKey: settings.deepseek_api_key, depth: settings.ai_depth as any },
      entry,
      context
    );

    // Save insights to database
    await c.env.DB.prepare(`
      INSERT INTO ai_insights (user_id, entry_id, insight_type, content, metadata)
      VALUES (?, ?, 'daily_summary', ?, ?)
    `).bind(
      user.id,
      entryId,
      JSON.stringify(insights),
      JSON.stringify({ generated_at: new Date().toISOString() })
    ).run();

    // Save emotions
    if (insights.emotions && insights.emotions.length > 0) {
      // Clear existing emotions
      await c.env.DB.prepare('DELETE FROM entry_emotions WHERE entry_id = ?').bind(entryId).run();
      
      for (const emotion of insights.emotions) {
        await c.env.DB.prepare(
          'INSERT INTO entry_emotions (entry_id, emotion) VALUES (?, ?)'
        ).bind(entryId, emotion).run();
      }
    }

    return c.json({ insights });
  } catch (error) {
    console.error('Generate insights error:', error);
    return c.json({ error: 'Erro ao gerar insights' }, 500);
  }
});

// Toggle favorite
entries.patch('/:id/favorite', async (c) => {
  const user = c.get('user');
  const entryId = parseInt(c.req.param('id'));

  try {
    const entry = await c.env.DB.prepare(
      'SELECT is_favorite FROM entries WHERE id = ? AND user_id = ?'
    ).bind(entryId, user.id).first<{ is_favorite: number }>();

    if (!entry) {
      return c.json({ error: 'Entrada não encontrada' }, 404);
    }

    const newValue = entry.is_favorite ? 0 : 1;
    await c.env.DB.prepare(
      'UPDATE entries SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newValue, entryId).run();

    return c.json({ is_favorite: Boolean(newValue) });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return c.json({ error: 'Erro ao atualizar favorito' }, 500);
  }
});

// Delete entry
entries.delete('/:id', async (c) => {
  const user = c.get('user');
  const entryId = parseInt(c.req.param('id'));

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM entries WHERE id = ? AND user_id = ?'
    ).bind(entryId, user.id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Entrada não encontrada' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete entry error:', error);
    return c.json({ error: 'Erro ao excluir entrada' }, 500);
  }
});

export default entries;
