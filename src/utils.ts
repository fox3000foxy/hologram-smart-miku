import fs from 'fs';
import { NewsResult, WeatherData } from './types';

export function convertToHours(publishedAt: string): number {
  if (publishedAt.includes('heure') || publishedAt.includes('heures')) {
    return parseInt(publishedAt.match(/\d+/)?.[0] || '0');
  } else if (publishedAt.includes('jour') || publishedAt.includes('jours')) {
    return parseInt(publishedAt.match(/\d+/)?.[0] || '0') * 24;
  }
  return 0;
}

export function sortByRecent(searchResults: NewsResult[]): NewsResult[] {
  return searchResults.sort((a, b) => {
    const hoursA = convertToHours(a.PublishedAt);
    const hoursB = convertToHours(b.PublishedAt);
    return hoursA - hoursB;
  });
}

export function formatSearchResults(searchResults: NewsResult[]): string {
  return searchResults
    .map((result) => {
      return `${result.Publisher} ${result.PublishedAt} | **${result.Title}** : ${result.Description}`;
    })
    .join('');
}

export function getClosestTemperature(date: Date, weatherData: WeatherData): number {
  const targetTime = date.toISOString(); // unused but kept for clarity
  let closestIndex = 0;
  let closestDifference =
    Math.abs(new Date(weatherData.hourly.time[0]).getTime() - date.getTime());

  for (let i = 1; i < weatherData.hourly.time.length; i++) {
    const currentDifference =
      Math.abs(new Date(weatherData.hourly.time[i]).getTime() - date.getTime());
    if (currentDifference < closestDifference) {
      closestDifference = currentDifference;
      closestIndex = i;
    }
  }

  return weatherData.hourly.temperature_2m[closestIndex];
}

export function calculateDailyAverages(
  weatherData: WeatherData
): { day: string; averageTemp: number }[] {
  const dailyAverages: { day: string; averageTemp: number }[] = [];
  let dayTemps: number[] = [];
  let currentDay = new Date(weatherData.hourly.time[0]).getDate();

  weatherData.hourly.time.forEach((time, index) => {
    const date = new Date(time);
    const day = date.getDate();

    if (day === currentDay) {
      dayTemps.push(weatherData.hourly.temperature_2m[index]);
    } else {
      const averageTemp =
        dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
      dailyAverages.push({
        day: new Date(time).toISOString().split('T')[0],
        averageTemp,
      });

      dayTemps = [weatherData.hourly.temperature_2m[index]];
      currentDay = day;
    }
  });

  if (dayTemps.length > 0) {
    const averageTemp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
    dailyAverages.push({
      day: new Date(
        weatherData.hourly.time[weatherData.hourly.time.length - 1]
      )
        .toISOString()
        .split('T')[0],
      averageTemp,
    });
  }

  return dailyAverages;
}

export function format7DayForecast(weatherData: WeatherData): string {
  const dailyAverages = calculateDailyAverages(weatherData);
  const next7DaysForecast = dailyAverages.slice(0, 7).map((dayData) => {
    return `Le ${parseInt(dayData.day.split('-')[2])}, il fera ${parseInt(
      dayData.averageTemp.toString()
    )}°.`;
  });

  return next7DaysForecast.join('\n');
}

export function switchLights(state: boolean) {
  // TODO: implement hardware interface
  console.log(`switchLights called with ${state}`);
}

export function readJson<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, 'utf-8')) as T;
}
