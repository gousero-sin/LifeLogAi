// LifeLog IA - Tags Routes

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Bindings, Variables, Tag } from '../types';

const tags = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
tags.use('*', authMiddleware);

// Get all tags (system + user custom)
tags.get('/', async (c) => {
  const user = c.get('user');

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM tags 
      WHERE user_id IS NULL OR user_id = ?
      ORDER BY is_system DESC, name ASC
    `).bind(user.id).all<Tag>();

    return c.json({ tags: results || [] });
  } catch (error) {
    console.error('Get tags error:', error);
    return c.json({ error: 'Erro ao buscar tags' }, 500);
  }
});

// Create custom tag
tags.post('/', async (c) => {
  const user = c.get('user');

  try {
    const { name, color, icon } = await c.req.json<{ name: string; color?: string; icon?: string }>();

    if (!name || name.trim().length === 0) {
      return c.json({ error: 'Nome da tag é obrigatório' }, 400);
    }

    // Check if tag with same name exists for this user
    const existing = await c.env.DB.prepare(`
      SELECT id FROM tags 
      WHERE (user_id IS NULL OR user_id = ?) AND LOWER(name) = LOWER(?)
    `).bind(user.id, name.trim()).first();

    if (existing) {
      return c.json({ error: 'Tag com este nome já existe' }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO tags (user_id, name, color, icon, is_system)
      VALUES (?, ?, ?, ?, 0)
    `).bind(
      user.id,
      name.trim().toLowerCase(),
      color || '#6366f1',
      icon || 'tag'
    ).run();

    const tag = await c.env.DB.prepare(
      'SELECT * FROM tags WHERE id = ?'
    ).bind(result.meta.last_row_id).first<Tag>();

    return c.json({ tag }, 201);
  } catch (error) {
    console.error('Create tag error:', error);
    return c.json({ error: 'Erro ao criar tag' }, 500);
  }
});

// Update custom tag
tags.patch('/:id', async (c) => {
  const user = c.get('user');
  const tagId = parseInt(c.req.param('id'));

  try {
    // Check if tag exists and belongs to user (not system tag)
    const tag = await c.env.DB.prepare(
      'SELECT * FROM tags WHERE id = ? AND user_id = ? AND is_system = 0'
    ).bind(tagId, user.id).first<Tag>();

    if (!tag) {
      return c.json({ error: 'Tag não encontrada ou não pode ser editada' }, 404);
    }

    const { name, color, icon } = await c.req.json<{ name?: string; color?: string; icon?: string }>();

    if (name !== undefined) {
      // Check for duplicate name
      const existing = await c.env.DB.prepare(`
        SELECT id FROM tags 
        WHERE (user_id IS NULL OR user_id = ?) AND LOWER(name) = LOWER(?) AND id != ?
      `).bind(user.id, name.trim(), tagId).first();

      if (existing) {
        return c.json({ error: 'Tag com este nome já existe' }, 400);
      }
    }

    await c.env.DB.prepare(`
      UPDATE tags SET
        name = COALESCE(?, name),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon)
      WHERE id = ?
    `).bind(
      name?.trim().toLowerCase() || null,
      color || null,
      icon || null,
      tagId
    ).run();

    const updatedTag = await c.env.DB.prepare(
      'SELECT * FROM tags WHERE id = ?'
    ).bind(tagId).first<Tag>();

    return c.json({ tag: updatedTag });
  } catch (error) {
    console.error('Update tag error:', error);
    return c.json({ error: 'Erro ao atualizar tag' }, 500);
  }
});

// Delete custom tag
tags.delete('/:id', async (c) => {
  const user = c.get('user');
  const tagId = parseInt(c.req.param('id'));

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM tags WHERE id = ? AND user_id = ? AND is_system = 0'
    ).bind(tagId, user.id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Tag não encontrada ou não pode ser excluída' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete tag error:', error);
    return c.json({ error: 'Erro ao excluir tag' }, 500);
  }
});

// Get tag usage statistics
tags.get('/stats', async (c) => {
  const user = c.get('user');

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT t.id, t.name, t.color, t.icon, COUNT(et.id) as usage_count
      FROM tags t
      LEFT JOIN entry_tags et ON t.id = et.tag_id
      LEFT JOIN entries e ON et.entry_id = e.id AND e.user_id = ?
      WHERE t.user_id IS NULL OR t.user_id = ?
      GROUP BY t.id
      ORDER BY usage_count DESC
    `).bind(user.id, user.id).all<Tag & { usage_count: number }>();

    return c.json({ stats: results || [] });
  } catch (error) {
    console.error('Get tag stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

export default tags;
