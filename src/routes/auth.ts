// LifeLog IA - Authentication Routes

import { Hono } from 'hono';
import { hashPassword, verifyPassword, createToken } from '../lib/auth';
import type { Bindings, Variables, User, LoginRequest, RegisterRequest } from '../types';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterRequest>();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (existingUser) {
      return c.json({ error: 'Email já cadastrado' }, 400);
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).bind(email.toLowerCase(), passwordHash, name).run();

    const userId = result.meta.last_row_id;

    // Create default settings
    await c.env.DB.prepare(
      'INSERT INTO user_settings (user_id) VALUES (?)'
    ).bind(userId).run();

    // Generate token
    const jwtSecret = c.env.JWT_SECRET || 'lifelog-default-secret-change-in-production';
    const token = await createToken({ userId }, jwtSecret);

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    return c.json({ token, user }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Erro ao criar conta' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first<User & { password_hash: string }>();

    if (!user) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Generate token
    const jwtSecret = c.env.JWT_SECRET || 'lifelog-default-secret-change-in-production';
    const token = await createToken({ userId: user.id }, jwtSecret);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Erro ao fazer login' }, 500);
  }
});

// Get current user
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET || 'lifelog-default-secret-change-in-production';

  try {
    const { verifyToken } = await import('../lib/auth');
    const payload = await verifyToken(token, jwtSecret) as { userId: number } | null;

    if (!payload) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
    ).bind(payload.userId).first<User>();

    if (!user) {
      return c.json({ error: 'Usuário não encontrado' }, 401);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Erro ao verificar token' }, 401);
  }
});

export default auth;
