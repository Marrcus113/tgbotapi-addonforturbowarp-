(function(Scratch) {
  'use strict';

  class EchoTelegramBot {
    constructor() {
      this.token = '';
      this.lastUpdateId = 0;
      this.lastMessage = '';
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

    updateMessages(args, util) {
      if (!this.token) return;

      return fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}`)
        .then(response => response.json())
        .then(data => {
          if (data.result.length > 0) {
            for (const update of data.result) {
              const chatId = update.message.chat.id;
              const text = update.message.text;

              // ⛔ Пропустить команды, начинающиеся с "/"
              if (text.startsWith('/')) {
                this.lastUpdateId = update.update_id;
                continue;
              }

              this.lastMessage = text;
              this.lastUpdateId = update.update_id;

              fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `Ты сказал: ${text}`
                })
              });
            }
          }
        });
    }

    getLastMessage() {
      return this.lastMessage || '';
    }
  }

  Scratch.extensions.register(new EchoTelegramBot());
})(Scratch);
