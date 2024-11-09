// src/bot/index.ts
import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config';

export class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(config.telegramToken, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      },
      onlyFirstMatch: false
    });
    this.initializeHandlers();
    this.checkBotStatus();
  }

  private async checkBotStatus(): Promise<void> {
    try {
      const botInfo = await this.bot.getMe();
      console.log('\n=== Бот запущен ===');
      console.log(`Имя бота: ${botInfo.username}`);
      console.log(`ID бота: ${botInfo.id}`);
      console.log(`Целевая группа: ${config.groupId}`);

      // Проверяем права бота в группе
      if (config.groupId) {
        try {
          const chatMember = await this.bot.getChatMember(config.groupId, botInfo.id);
          console.log('Статус бота в группе:', chatMember.status);
          
          const chatInfo = await this.bot.getChat(config.groupId);
          console.log('Информация о группе:', {
            title: chatInfo.title,
            type: chatInfo.type,
            id: chatInfo.id
          });
        } catch (error) {
          console.error('Ошибка при проверке прав в группе:', error);
        }
      }
    } catch (error) {
      console.error('Ошибка при получении информации о боте:', error);
    }
  }

  private initializeHandlers(): void {
    // Добавляем обработчик ошибок для отслеживания проблем с polling
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });

    // // Обработчик всех сообщений для отладки
    // this.bot.on('message', (msg) => {
    //   console.log('Получено сообщение:', {
    //     chat_id: msg.chat.id,
    //     type: msg.chat.type,
    //     from: msg.from?.username,
    //     text: msg.text
    //   });
    // });

    // Обработчик новых участников
    this.bot.on('new_chat_members', async (msg) => {
      console.log('Обнаружен новый участник:', {
        chat_id: msg.chat.id,
        new_members: msg.new_chat_members?.map(member => ({
          username: member.username,
          first_name: member.first_name,
          is_bot: member.is_bot
        }))
      });

      const chatId = msg.chat.id;
      
      // Проверяем, что событие произошло в нужной группе
      if (config.groupId && chatId.toString() !== config.groupId) {
        console.log(`Событие в другой группе. Ожидаемая: ${config.groupId}, Полученная: ${chatId}`);
        return;
      }

      for (const newMember of msg.new_chat_members || []) {
        // Игнорируем ботов
        if (newMember.is_bot) {
          console.log('Пропускаем бота:', newMember.username);
          continue;
        }

        const welcomeMessage = `
*Добро пожаловать, ${newMember.first_name}\\!* 🎉

Рады видеть тебя в нашей группе\\! 

📌 *Полезные ссылки:*
• [Наш сайт](https://www.portalmasterov.ru/)
• [Правила группы](https://t.me/tetststdstst/5)
• [Часто задаваемые вопросы](https://t.me/tetststdstst/5)
`;
        
        try {
          await this.bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true
          });
          console.log('Приветственное сообщение отправлено для:', newMember.username);
        } catch (error) {
          console.error('Ошибка отправки приветственного сообщения:', error);
          // Пробуем отправить простое сообщение в случае ошибки
          try {
            await this.bot.sendMessage(
              chatId,
              `Добро пожаловать, ${newMember.first_name}!`
            );
          } catch (fallbackError) {
            console.error('Ошибка отправки простого сообщения:', fallbackError);
          }
        }
      }
    });

    // Обработчик изменения статуса бота
    this.bot.on('my_chat_member', async (msg) => {
      console.log('Изменение статуса бота:', {
        chat_id: msg.chat.id,
        status: msg.new_chat_member.status,
        chat_type: msg.chat.type
      });
    });
  }

  // Метод для ручной проверки группы
  public async checkGroup(groupId: string): Promise<void> {
    try {
      const chat = await this.bot.getChat(groupId);
      console.log('\n=== Проверка группы ===');
      console.log('Информация о группе:', {
        id: chat.id,
        title: chat.title,
        type: chat.type
      });
      
      const botInfo = await this.bot.getMe();
      const memberInfo = await this.bot.getChatMember(groupId, botInfo.id);
      console.log('Права бота в группе:', memberInfo.status);
      console.log('======================\n');
    } catch (error) {
      console.error('Ошибка при проверке группы:', error);
    }
  }
}