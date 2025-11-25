const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: 'Вопрос не может быть пустым.' });
  }

  // Allow an API key override in the request body for local/dev testing
  // (client may send `apiKey` in the POST body). Prefer request-provided key, then env var.
  const PROVIDED_KEY = req.body?.apiKey;
  const OPENROUTER_API_KEY = PROVIDED_KEY || process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    // basic rule-based fallback answers in Russian to keep the widget functional offline
    const text = userMessage.toLowerCase();
    let reply = "Извините, внешняя служба ИИ сейчас недоступна. Вот краткий ответ: ";

    if (text.includes('pm') || text.includes('pm2') || text.includes('пыль') || text.includes('pm2.5')) {
      reply += 'PM2.5 — мелкие частицы, вредны для дыхания. Старайтесь находиться в помещениях и использовать фильтры.';
    } else if (text.includes('маск') || text.includes('mask')) {
      reply += 'Медицинская маска или респиратор уровня N95/FFP2 лучше защищают от мелкой пыли.';
    } else if (text.includes('очист') || text.includes('фильтр')) {
      reply += 'Эффективен очиститель с HEPA-фильтром для удаления частиц PM2.5.';
    } else if (text.includes('здоров') || text.includes('боль')) {
      reply += 'При проблемах с дыханием обратитесь к врачу. Ограничьте время на улице при плохом качестве воздуха.';
    } else {
      reply = 'Временно недоступно подключение к внешнему ИИ. Попробуйте задать вопрос про маски, фильтры или PM2.5.';
    }

    return res.json({ reply, fallback: true });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты — ИИ-консультант по экологии. Отвечай по-русски, кратко, понятно и строго по теме загрязнения воздуха, защиты здоровья, масок и очистителей. Не выдумывай.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply, fallback: false });
  } catch (error) {
    console.error('Ошибка при обращении к OpenRouter:', error.response?.data || error.message);
    // If we couldn't reach OpenRouter, return a friendly message and mark as fallback so frontend can show a note
    res.status(500).json({ reply: 'Ошибка при получении ответа от ИИ.', fallback: true });
  }
});

module.exports = router;
