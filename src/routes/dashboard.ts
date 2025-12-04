// LifeLog IA - Dashboard & Analytics Routes

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateWeeklySummary, semanticSearch } from '../lib/deepseek';
import type { Bindings, Variables, Entry, DashboardStats } from '../types';

const dashboard = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
dashboard.use('*', authMiddleware);

// Get dashboard stats
dashboard.get('/stats', async (c) => {
  const user = c.get('user');
  const period = c.req.query('period') || '7'; // days

  try {
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get entries for period
    const { results: entries } = await c.env.DB.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND entry_date >= ?
      ORDER BY entry_date DESC
    `).bind(user.id, startDateStr).all<Entry>();

    // Calculate averages
    const validMoods = (entries || []).filter(e => e.mood !== null).map(e => e.mood!);
    const validEnergy = (entries || []).filter(e => e.energy !== null).map(e => e.energy!);
    const validSleep = (entries || []).filter(e => e.sleep_hours !== null).map(e => e.sleep_hours!);
    const validStress = (entries || []).filter(e => e.stress !== null).map(e => e.stress!);

    const avgMood = validMoods.length ? validMoods.reduce((a, b) => a + b, 0) / validMoods.length : 0;
    const avgEnergy = validEnergy.length ? validEnergy.reduce((a, b) => a + b, 0) / validEnergy.length : 0;
    const avgSleep = validSleep.length ? validSleep.reduce((a, b) => a + b, 0) / validSleep.length : 0;
    const avgStress = validStress.length ? validStress.reduce((a, b) => a + b, 0) / validStress.length : 0;

    // Calculate streak
    const allEntries = await c.env.DB.prepare(`
      SELECT entry_date FROM entries 
      WHERE user_id = ?
      ORDER BY entry_date DESC
    `).bind(user.id).all<{ entry_date: string }>();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const entry of allEntries.results || []) {
      const entryDate = entry.entry_date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate < expectedDate) {
        break;
      }
    }

    // Get top tags
    const { results: tagStats } = await c.env.DB.prepare(`
      SELECT t.name, t.color, COUNT(et.id) as count
      FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      JOIN entries e ON et.entry_id = e.id
      WHERE e.user_id = ? AND e.entry_date >= ?
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 5
    `).bind(user.id, startDateStr).all<{ name: string; color: string; count: number }>();

    // Get mood trend
    const moodTrend = (entries || [])
      .filter(e => e.mood !== null)
      .map(e => ({ date: e.entry_date, mood: e.mood! }))
      .reverse();

    // Get sleep trend
    const sleepTrend = (entries || [])
      .filter(e => e.sleep_hours !== null)
      .map(e => ({ date: e.entry_date, hours: e.sleep_hours! }))
      .reverse();

    const stats: DashboardStats = {
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      totalEntries: entries?.length || 0,
      currentStreak: streak,
      topTags: tagStats || [],
      moodTrend,
      sleepTrend
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

// Get weekly summary
dashboard.get('/weekly-summary', async (c) => {
  const user = c.get('user');
  const weekOffset = parseInt(c.req.query('offset') || '0');

  try {
    // Calculate week dates
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];

    // Get entries for the week
    const { results: entries } = await c.env.DB.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND entry_date >= ? AND entry_date <= ?
      ORDER BY entry_date ASC
    `).bind(user.id, startDateStr, endDateStr).all<Entry>();

    if (!entries || entries.length === 0) {
      return c.json({
        summary: {
          title: 'Semana sem registros',
          narrative: 'Você não registrou nenhuma entrada nesta semana.',
          highlights: [],
          lowlights: [],
          suggestions: ['Tente registrar pelo menos alguns minutos por dia para acompanhar seu progresso.']
        },
        period: { start: startDateStr, end: endDateStr }
      });
    }

    // Get user settings for AI
    const settings = await c.env.DB.prepare(
      'SELECT deepseek_api_key, ai_depth FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first<{ deepseek_api_key: string; ai_depth: string }>();

    if (!settings?.deepseek_api_key) {
      // Generate basic summary without AI
      const validMoods = entries.filter(e => e.mood !== null).map(e => e.mood!);
      const avgMood = validMoods.length ? validMoods.reduce((a, b) => a + b, 0) / validMoods.length : 0;

      return c.json({
        summary: {
          title: `Semana com ${entries.length} registros`,
          narrative: `Você registrou ${entries.length} entrada(s) esta semana com humor médio de ${avgMood.toFixed(1)}/10. Configure sua API key para análises mais detalhadas.`,
          highlights: entries.filter(e => e.is_favorite).map(e => e.highlight || `Dia ${e.entry_date}`),
          lowlights: [],
          suggestions: ['Configure sua API key nas configurações para receber análises personalizadas.']
        },
        period: { start: startDateStr, end: endDateStr },
        entries_count: entries.length
      });
    }

    // Calculate context for AI
    const validMoods = entries.filter(e => e.mood !== null).map(e => e.mood!);
    const validSleep = entries.filter(e => e.sleep_hours !== null).map(e => e.sleep_hours!);
    const validEnergy = entries.filter(e => e.energy !== null).map(e => e.energy!);

    const context = {
      recentEntries: entries,
      avgMood: validMoods.length ? validMoods.reduce((a, b) => a + b, 0) / validMoods.length : 5,
      avgSleep: validSleep.length ? validSleep.reduce((a, b) => a + b, 0) / validSleep.length : 7,
      avgEnergy: validEnergy.length ? validEnergy.reduce((a, b) => a + b, 0) / validEnergy.length : 5,
      frequentTags: []
    };

    // Generate AI summary
    const summary = await generateWeeklySummary(
      { apiKey: settings.deepseek_api_key, depth: settings.ai_depth as any },
      entries,
      context
    );

    return c.json({
      summary,
      period: { start: startDateStr, end: endDateStr },
      entries_count: entries.length
    });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    return c.json({ error: 'Erro ao gerar resumo semanal' }, 500);
  }
});

// Semantic search
dashboard.post('/search', async (c) => {
  const user = c.get('user');

  try {
    const { query, limit = 20 } = await c.req.json<{ query: string; limit?: number }>();

    if (!query || query.trim().length === 0) {
      return c.json({ error: 'Query é obrigatória' }, 400);
    }

    // Get user settings
    const settings = await c.env.DB.prepare(
      'SELECT deepseek_api_key, ai_depth FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first<{ deepseek_api_key: string; ai_depth: string }>();

    // First, do a simple text search
    const { results: textResults } = await c.env.DB.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND (
        content LIKE ? OR highlight LIKE ?
      )
      ORDER BY entry_date DESC
      LIMIT ?
    `).bind(user.id, `%${query}%`, `%${query}%`, limit).all<Entry>();

    if (!settings?.deepseek_api_key) {
      // Return text search results only
      return c.json({
        results: textResults || [],
        method: 'text',
        message: 'Configure sua API key para busca semântica mais inteligente.'
      });
    }

    // Get more entries for semantic search
    const { results: allEntries } = await c.env.DB.prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND is_private = 0
      ORDER BY entry_date DESC
      LIMIT 100
    `).bind(user.id).all<Entry>();

    if (!allEntries || allEntries.length === 0) {
      return c.json({ results: [], method: 'semantic' });
    }

    // Do semantic search with AI
    const searchResult = await semanticSearch(
      { apiKey: settings.deepseek_api_key, depth: settings.ai_depth as any },
      query,
      allEntries
    );

    // Get full entries for results
    const resultEntries = [];
    for (const result of searchResult.results.slice(0, limit)) {
      const entry = allEntries.find(e => e.id === result.entry_id);
      if (entry) {
        resultEntries.push({
          ...entry,
          relevance: result.relevance
        });
      }
    }

    return c.json({
      results: resultEntries,
      summary: searchResult.summary,
      method: 'semantic'
    });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ error: 'Erro ao buscar' }, 500);
  }
});

// Get heatmap data (for monthly view)
dashboard.get('/heatmap', async (c) => {
  const user = c.get('user');
  const year = parseInt(c.req.query('year') || new Date().getFullYear().toString());
  const month = c.req.query('month'); // optional, if not provided get whole year

  try {
    let query = `
      SELECT entry_date, mood, energy, sleep_hours
      FROM entries 
      WHERE user_id = ? AND strftime('%Y', entry_date) = ?
    `;
    const params: any[] = [user.id, year.toString()];

    if (month) {
      query += ` AND strftime('%m', entry_date) = ?`;
      params.push(month.padStart(2, '0'));
    }

    query += ' ORDER BY entry_date ASC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all<{
      entry_date: string;
      mood: number | null;
      energy: number | null;
      sleep_hours: number | null;
    }>();

    const heatmapData = (results || []).map(e => ({
      date: e.entry_date,
      mood: e.mood,
      energy: e.energy,
      sleep: e.sleep_hours
    }));

    return c.json({ heatmap: heatmapData, year, month });
  } catch (error) {
    console.error('Get heatmap error:', error);
    return c.json({ error: 'Erro ao buscar dados do heatmap' }, 500);
  }
});

// Get emotions summary
dashboard.get('/emotions', async (c) => {
  const user = c.get('user');
  const period = c.req.query('period') || '30';

  try {
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { results } = await c.env.DB.prepare(`
      SELECT ee.emotion, COUNT(*) as count, AVG(ee.intensity) as avg_intensity
      FROM entry_emotions ee
      JOIN entries e ON ee.entry_id = e.id
      WHERE e.user_id = ? AND e.entry_date >= ?
      GROUP BY ee.emotion
      ORDER BY count DESC
    `).bind(user.id, startDateStr).all<{
      emotion: string;
      count: number;
      avg_intensity: number;
    }>();

    return c.json({ emotions: results || [] });
  } catch (error) {
    console.error('Get emotions error:', error);
    return c.json({ error: 'Erro ao buscar emoções' }, 500);
  }
});

export default dashboard;
