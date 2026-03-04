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

export interface InternetDependencyResponse {
  reply: string;
}

export interface BotProperties {
  clothing: string;
  type: string;
  skills: string;
  purpose: string;
  plans: string;
  pets: string;
  personality: string;
  orientation: string;
  manufacturer: string;
  logo: string;
  language: string;
  job: string;
  iq: string;
  hobby: string;
  hero: string;
  goal: string;
  future: string;
  friends: string;
  fear: string;
  emotions: string;
  dog: string;
  diet: string;
  "best-friend": string;
  awards: string;
  lastname: string;
  middlename: string;
  firstname: string;
  fullname: string;
  name: string;
  birthday: string;
  birthdate: string;
  birthplace: string;
  nationality: string;
  ethnicity: string;
  religion: string;
  education: string;
  species: string;
  sign: string;
  gender: string;
  body: string;
  "look-like": string;
  height: string;
  weight: string;
  hair: string;
  "eye-color": string;
  eyes: string;
  pic: string;
  family: string;
  siblings: string;
  mother: string;
  father: string;
  children: string;
  botmaster: string;
  master: string;
  instructor: string;
  status: string;
  facebook: string;
  address: string;
  email: string;
  "phone-number": string;
  location: string;
  "default-get": string;
  "default-property": string;
  "default-map": string;
  "sentence-splitters": string;
  "learn-filename": string;
  "max-learn-file-size": string;
}
