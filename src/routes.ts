import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { getAIMLResponse, getBullshit } from './aiml';
import { getMeteoCache, getNewsCache, getTemperature } from './caches';
import { wakeupResponses } from './data';
import { generatePrompt } from './handlers';
import { format7DayForecast, formatSearchResults, switchLights } from './utils';

// typed bodies
interface TextRequest {
  content?: string;
}

import { HERC_API_KEY, INDEX_FILE } from './config';

export function registerRoutes(app: express.Application) {
  app.get('/', (req, res) => {
    console.log('Serving index page');
    res.sendFile(INDEX_FILE);
  });

  app.post('/mikuAi', async (req: Request<{}, {}, TextRequest>, res: Response) => {
    const content = req.body.content;
    if (!content) {
      return res.json({
        success: false,
        message: 'Content is needed in the JSON payload',
      });
    }

    const prompt = generatePrompt(content);

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const apiKey = HERC_API_KEY;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content },
          ],
          model: 'llama3-8b-8192',
        }),
      });

      const data: any = await response.json();
      const reply: string = data.choices[0].message.content;
      const cleanedReply = reply.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
      const bullshit = getBullshit();

      res.json({
        success: true,
        message: {
          reply: cleanedReply,
          hiragana_form: bullshit.japanese,
          id: bullshit.id,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  app.post('/mikuAi-offline', (req: Request<{}, {}, TextRequest>, res: Response) => {
    const content = req.body.content;
    if (!content) {
      return res.json({
        success: false,
        message: 'Content is needed in the JSON payload',
      });
    }

    let response: any;

    if (content === 'météo') {
      response = {
        reply: `Voici la météo pour les 7 prochains jours: \n${format7DayForecast(getMeteoCache())}`,
      };
    } else if (content === 'température') {
      response = {
        reply: `La température actuelle est de ${getTemperature(new Date())}°.`,
      };
    } else if (content === 'news' || content === 'nouvelles') {
      response = {
        reply: `Voici les nouvelles: ${formatSearchResults(getNewsCache())}`,
      };
    } else if (content === 'allume lumière') {
      switchLights(true);
      response = { reply: `J'ai allumé la lumière.` };
    } else if (content === 'éteins lumière') {
      switchLights(false);
      response = { reply: `J'ai éteint la lumière.` };
    } else {
      response = getAIMLResponse(content);
    }
    res.json({ success: true, message: response });
  });

  app.post('/voicevox', async (req: Request<{}, {}, { text: string }>, res: Response) => {
    try {
      const VOICEVOX_API_BASE_URL = process.env.VOICEVOX_API_BASE_URL;
      const DEFAULT_SPEAKER = process.env.DEFAULT_SPEAKER || '1';

      const queryData = await fetch(
        `${VOICEVOX_API_BASE_URL}/audio_query?text=${encodeURIComponent(req.body.text)}&speaker=${DEFAULT_SPEAKER}`,
        { method: 'POST' }
      ).then((response) => response.text());

      const response2 = await fetch(
        `${VOICEVOX_API_BASE_URL}/synthesis?speaker=${DEFAULT_SPEAKER}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: queryData,
        }
      );

      // `body` can be null according to types, use non-null assertion and cast to any
      Readable.fromWeb(response2.body as any).pipe(res as any);
    } catch (error) {
      console.error('VoiceVox API Error:', error);
      res.status(500).json({ success: false, message: 'Failed to process voice synthesis' });
    }
  });

  app.get('/isOnline', (req, res) => {
    require('dns').resolve('www.google.com', (err: NodeJS.ErrnoException | null) => {
      res.send({ isOnline: !err });
    });
  });

  app.get('/wakeupText', (req, res) => {
    const wakeupId = Number(req.query?.id);
    if (!wakeupId || wakeupId < 1 || wakeupId > 6) {
      res.send({ success: false });
    } else {
      const wakeup = wakeupResponses.find(({ id }) => id === wakeupId);
      res.send({ success: true, response: wakeup });
    }
  });
}
