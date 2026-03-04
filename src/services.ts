import SearchEngine from 'cdrake-se';
import fetch from 'node-fetch';
import { NewsResult, WeatherData } from './types';
import { sortByRecent } from './utils';

export async function getMeteo(
  latitude: string,
  longitude: string
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m`;
  return (await fetch(url).then((r) => r.json())) as WeatherData;
}

export async function getNews(query: string): Promise<NewsResult[]> {
  try {
    const news = await SearchEngine({
      Method: 'News',
      Page: 1,
      Query: query,
      Language: 'fr',
    });
    return sortByRecent(news.Results as NewsResult[]);
  } catch (err) {
    console.error(err);
    return [];
  }
}
