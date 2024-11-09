import express from 'express';
import { config } from './config';
import { TelegramBotService } from './bot';

const app = express();
const botService = new TelegramBotService();

// Добавляем эндпоинт для проверки группы
app.get('/check-group', async (req, res) => {
  await botService.checkGroup(config.groupId);
  res.json({ status: 'check completed' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});