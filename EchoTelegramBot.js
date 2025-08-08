(function(Scratch) {
  'use strict';

  class EchoTelegramBot {
    constructor() {
      this.token = '';
      this.lastUpdateId = 0;
      this.lastMessage = '';
      this.mode = 'repeat';
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

    async updateMessages(args, util) {
      if (!this.token) return;

      const response = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}`);
      const data = await response.json();

      if (data.result.length > 0) {
        for (const update of data.result) {
          const chatId = update.message.chat.id;
          const text = update.message.text;
          this.lastUpdateId = update.update_id;

          this.lastMessage = text;

          let reply = '';

          if (text === '/textrepeat') {
            this.mode = 'repeat';
            reply = 'Режим: Повтор текста';
          } else if (text === '/developersite') {
            reply = 'Официальный сайт разработчика: https://promem.shop';
          } else {
            reply = text;
          }

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
