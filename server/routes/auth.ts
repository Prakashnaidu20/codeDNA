import { Router } from 'express';
import { userStore } from '../db/user_store.js';

export const authRouter = Router();

// POST Signup
authRouter.post('/signup', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = userStore.signup(email, password, name, role);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

// POST Login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = userStore.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// GET Current User Profile (/api/auth/me)
authRouter.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = userStore.getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

  res.json(user);
});

// POST Logout
authRouter.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) userStore.logout(token);
  res.json({ success: true });
});
