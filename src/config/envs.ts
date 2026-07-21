import dotenv from 'dotenv';

dotenv.config();

export const {
  DATABASE_URL,
  PORT = 3010,
  FRONT_URL = 'http://localhost:5173',
  OPENROUTER_API_KEY,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = process.env;
