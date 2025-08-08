(function(Scratch) {
  'use strict';

  class EchoTelegramBot {
    constructor() {
      this.token = '';
      this.aiToken = '';
      this.lastUpdateId = 0;
      this.lastMessage = '';
      this.mode = 'repeat'; // режим по умолчанию
    }

    getInfo() {
      return {
        id: 'echoTelegramBot',
        name: 'Echo Telegram Bot',
        blocks: [
          {
            opcode: 'setToken',
            blockType: Scratch.BlockType.COMMAND,
            text: 'установить Telegram токен [TOKEN]',
            arguments: {
              TOKEN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '123456789:ABCdefGhIJKlmNoPQRstuVWxyZ12345678'
              }
            }
          },
          {
            opcode: 'setAiToken',
            blockType: Scratch.BlockType.COMMAND,
            text: 'установить AI токен [AITOKEN]',
            arguments: {
              AITOKEN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'aiml_xxx'
              }
            }
          },
          {
            opcode: 'updateMessages',
            blockType: Scratch.BlockType.COMMAND,
            text: 'обновить сообщения'
          },
          {
            opcode: 'getLastMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последнее сообщение'
          }
        ]
      };
    }

    setToken(args) {
      this.token = args.TOKEN;
    }

    setAiToken(args) {
      this.aiToken = args.AITOKEN;
    }

    async updateMessages(args, util) {
      if (!this.token) return;

      const response = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}`);
      const data = await response.json();

      if (data.result.length > 0) {
        for (const update of data.result) {
          const chatId = update.message.chat.id;
          const text = update.message.text;
          this.lastUpdateId = update.update_id;

          // Сохраняем последнее сообщение
          this.lastMessage = text;

          let reply = '';

          // Переключение режима
          if (text === '/ai') {
            this.mode = 'ai';
            reply = 'Режим переключён: ИИ';
          } else if (text === '/textrepeat') {
            this.mode = 'repeat';
            reply = 'Режим переключён: Повтор текста';
          } else {
            // Ответ в зависимости от режима
            if (this.mode === 'ai') {
              if (!this.aiToken) {
                reply = 'AI токен не установлен.';
              } else {
                try {
                  const aiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${this.aiToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      messages: [
                        { role: 'user', content: text }
                      ]
                    })
                  }).then(res => res.json());

                  reply = aiResponse.choices?.[0]?.message?.content || 'Не удалось получить ответ от ИИ.';
                } catch (e) {
                  reply = 'Ошибка при обращении к AI.';
                }
              }
            } else {
              reply = text;
            }
          }

          // Отправка ответа в Telegram
          await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply
            })
          });
        }
      }
    }

    getLastMessage() {
      return this.lastMessage || '';
    }
  }

  Scratch.extensions.register(new EchoTelegramBot());
})(Scratch);
