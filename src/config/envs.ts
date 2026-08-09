import dotenv from 'dotenv';

dotenv.config();

export const {
  DATABASE_URL,
  PORT = 3010,
  FRONT_URL = 'http://localhost:5173',
  JWT_SECRET = 'dev-secret',
  OPENROUTER_API_KEY,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = process.env;

export const FRONT_URLS = (FRONT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`;
