import dns from "dns";
import express, { Request, Response } from "express";
import { Groq } from "groq-sdk";
import { getAIMLResponse, getBullshit } from "./aiml";
import { getMeteoCache, getNewsCache, getTemperature } from "./caches";
import { GROQ_API_KEY, INDEX_FILE } from "./config";
import { wakeupResponses } from "./data";
import { generatePrompt } from "./handlers";
import { format7DayForecast, formatSearchResults, switchLights } from "./utils";

const groq = new Groq({ apiKey: GROQ_API_KEY });
export function registerRoutes(app: express.Application) {
  app.get("/", (req, res) => {
    console.log("Serving index page");
    res.sendFile(INDEX_FILE);
  });

  app.post("/mikuAi", async (req: Request, res: Response) => {
    const content = req.body.content;
    if (!content) {
      return res.json({
        success: false,
        message: "Content is needed in the JSON payload",
      });
    }

    const prompt = generatePrompt(content);

    try {
      const groqRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content },
        ],
      });

      if (!groqRes.choices || groqRes.choices.length === 0) {
        return res
          .status(500)
          .json({ success: false, message: "No response from Groq" });
      }

      if (!groqRes.choices[0].message || !groqRes.choices[0].message.content) {
        return res
          .status(500)
          .json({
            success: false,
            message: "Invalid response format from Groq",
          });
      }

      const reply: string = groqRes.choices[0].message.content;
      const cleanedReply = reply.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        "",
      );
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
      console.error("groq error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });

  app.post("/mikuAi-offline", (req: Request, res: Response) => {
    const content = req.body.content;
    if (!content) {
      return res.json({
        success: false,
        message: "Content is needed in the JSON payload",
      });
    }

    let response:
      | { reply: string; hiragana_form?: string; id?: number; type?: string }
      | string;

    if (content === "météo") {
      response = {
        reply: `Voici la météo pour les 7 prochains jours: \n${format7DayForecast(getMeteoCache())}`,
      };
    } else if (content === "température") {
      response = {
        reply: `La température actuelle est de ${getTemperature(new Date())}°.`,
      };
    } else if (content === "news" || content === "nouvelles") {
      response = {
        reply: `Voici les nouvelles: ${formatSearchResults(getNewsCache())}`,
      };
    } else if (content === "allume lumière") {
      switchLights(true);
      response = { reply: `J'ai allumé la lumière.` };
    } else if (content === "éteins lumière") {
      switchLights(false);
      response = { reply: `J'ai éteint la lumière.` };
    } else {
      response = getAIMLResponse(content);
    }
    res.json({ success: true, message: response });
  });

  app.get("/isOnline", (req, res) => {
    dns.resolve("www.google.com", (err: NodeJS.ErrnoException | null) => {
      res.send({ isOnline: !err });
    });
  });

  app.get("/wakeupText", (req, res) => {
    const wakeupId = Number(req.query?.id);
    if (!wakeupId || wakeupId < 1 || wakeupId > 6) {
      res.send({ success: false });
    } else {
      const wakeup = wakeupResponses.find(({ id }) => id === wakeupId);
      res.send({ success: true, response: wakeup });
    }
  });
}
