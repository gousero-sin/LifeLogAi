// LifeLog IA - Authentication Middleware

import { Context, Next } from 'hono';
import { verifyToken } from '../lib/auth';
import type { Bindings, Variables, User } from '../types';

export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET || 'lifelog-default-secret-change-in-production';

  try {
    const payload = await verifyToken(token, jwtSecret) as { userId: number } | null;

    if (!payload || !payload.userId) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
    ).bind(payload.userId).first<User>();

    if (!user) {
      return c.json({ error: 'Usuário não encontrado' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Erro de autenticação' }, 401);
  }
}
