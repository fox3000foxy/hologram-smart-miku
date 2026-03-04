import fs from 'fs';
import { getMeteoCache, getNewsCache, getTemperature } from './caches';
import { format7DayForecast, formatSearchResults } from './utils';

export function generatePrompt(question: string): string {
  let promptTemplate = fs.readFileSync('./data/prompt.txt').toString();
  if (question.includes('météo')) {
    promptTemplate += `Voici la météo pour les 7 prochains jours: \n${format7DayForecast(getMeteoCache())}. Ne donne que celle qui t'es demandé.`;
  }
  if (question.includes('température')) {
    promptTemplate += `Voici la température: ${getTemperature(new Date())}°C`;
  }
  if (question.includes('nouvelles') || question.includes('news')) {
    promptTemplate += `Voici les news récentes: \n${formatSearchResults(getNewsCache())}`;
  }
  return promptTemplate.replace(/question/g, question);
}
