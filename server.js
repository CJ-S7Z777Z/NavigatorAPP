const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

// Create bot
const bot = new Telegraf('7895272383:AAG9RKIZ3Mw95bzOgBj3-TwvHc9ilAB2o2U');

// Handle /start command
bot.start((ctx) => {
  ctx.reply('Запуск мини-приложения', {
    reply_markup: {
      keyboard: [
        [
          {
            text: 'Открыть карту',
            web_app: { url: 'https://https://navigatorapp-production.up.railway.app/' }
          }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Launch bot
bot.launch();

// Create Express app
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
