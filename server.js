const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

// Создаем бота
const bot = new Telegraf('7895272383:AAG9RKIZ3Mw95bzOgBj3-TwvHc9ilAB2o2U');

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply('Запуск мини-приложения', {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: 'Открыть карту', 
            web_app: { url: 'https://navigatorapp-production.up.railway.app/' } 
          }
        ]
      ]
    }
  });
});

// Запуск бота
bot.launch();

// Создаем приложение Express
const app = express();

// Обслуживание статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
