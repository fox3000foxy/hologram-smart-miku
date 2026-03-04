import fs from "fs";
import {
  BOT_PROPERTIES_PATH,
  BULLSHIT_RESPONSES_PATH,
  DATASETS_PATH,
  INTERNET_DEPENDENCY_RESPONSES_PATH,
  WAKEUP_RESPONSES_PATH,
} from "./config";
import {
  BotProperties,
  BullshitItem,
  InternetDependencyResponse,
  WakeupResponse,
} from "./types";

export const internetDependencyResponses: InternetDependencyResponse[] =
  JSON.parse(fs.readFileSync(INTERNET_DEPENDENCY_RESPONSES_PATH, "utf-8"));
export const bullshitResponses: BullshitItem[] = JSON.parse(
  fs.readFileSync(BULLSHIT_RESPONSES_PATH, "utf-8"),
);
export const wakeupResponses: WakeupResponse[] = JSON.parse(
  fs.readFileSync(WAKEUP_RESPONSES_PATH, "utf-8"),
);
export const botProperties: BotProperties = JSON.parse(
  fs.readFileSync(BOT_PROPERTIES_PATH, "utf-8"),
);
export const datasets: string[] = JSON.parse(
  fs.readFileSync(DATASETS_PATH, "utf-8"),
);
