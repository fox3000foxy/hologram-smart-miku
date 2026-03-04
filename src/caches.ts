import fs from 'fs';
import { NewsResult, WeatherData } from './types';
import { getClosestTemperature } from './utils';

export function getMeteoCache(): WeatherData {
  return JSON.parse(fs.readFileSync('./cache/weather.json', 'utf-8')) as WeatherData;
}

export function getNewsCache(): NewsResult[] {
  return JSON.parse(fs.readFileSync('./cache/news.json', 'utf-8')) as NewsResult[];
}

export function getTemperature(date: Date): number {
  const meteo = getClosestTemperature(date, getMeteoCache());
  return meteo;
}
