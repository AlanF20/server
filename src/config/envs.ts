import dotenv from 'dotenv';

dotenv.config();

export const {
  DATABASE_URL,
  PORT = 3010,
  FRONT_URL = 'http://localhost:5173',
} = process.env;
