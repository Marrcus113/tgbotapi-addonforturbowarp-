(function(Scratch) {
  'use strict';

  class EchoTelegramBot {
    constructor() {
      this.token = '';
      this.lastUpdateId = 0;
    }

    getInfo() {
      return {
        id: 'echoTelegramBot',
        name: 'Echo Telegram Bot',
        blocks: [
          {
            opcode: 'setToken',
            blockType: Scratch.BlockType.COMMAND,
            text: 'установить токен [TOKEN]',
            arguments: {
              TOKEN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'вставь_токен_сюда'
              }
            }
          },
          {
            opcode: 'checkMessages',
            blockType: Scratch.BlockType.COMMAND,
            text: 'проверить сообщения'
          }
        ]
      };
    }

    setToken(args) {
      this.token = args.TOKEN;
    }

    async checkMessages() {
      if (!this.token) return;

      const url = `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result.length > 0) {
        for (const update of data.result) {
          const chatId = update.message.chat.id;
          const text = update.message.text;

          await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: `Ты сказал: ${text}`
            })
          });

          this.lastUpdateId = update.update_id;
        }
      }
    }
  }

  Scratch.extensions.register(new EchoTelegramBot());
})(Scratch);
