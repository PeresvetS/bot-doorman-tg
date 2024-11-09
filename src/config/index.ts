import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  telegramToken: process.env.BOT_TOKEN || '',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  groupId: process.env.TELEGRAM_GROUP_ID || ''
};