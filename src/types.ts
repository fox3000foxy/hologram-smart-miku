export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export interface NewsResult {
  Publisher: string;
  PublishedAt: string;
  Title: string;
  Description: string;
}

export interface BullshitItem {
  japanese: string;
  id: string;
  type: string;
}

export interface WakeupResponse {
  id: number;
  text: string;
}
