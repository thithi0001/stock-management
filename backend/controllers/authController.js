import { findUserByUsername } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const user = await findUserByUsername(username);
  if (!user) return res.status(401).json({ message: 'username is not exsisted' });

  const ok = await bcrypt.compare(password, user.user_password);
  if (!ok) return res.status(401).json({ message: 'wrong password' });

  const payload = { user_id: user.user_id, username: user.username, full_name: user.full_name, phone: user.phone, email: user.email, role: user.roles.role_name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  res.json({ token, payload });
}
