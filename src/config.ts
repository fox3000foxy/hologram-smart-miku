import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const PORT = 3000;
export const PUBLIC_DIR = path.join(__dirname, '../public');
export const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');
export const DATA_DIR = './data';
export const AIML_RESPONSE_LIMIT = 7;
export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';

export const INTERNET_DEPENDENCY_RESPONSES_PATH = `${DATA_DIR}/internetDependencyResponses.json`;
export const BULLSHIT_RESPONSES_PATH = `${DATA_DIR}/bullshit.json`;
export const WAKEUP_RESPONSES_PATH = `${DATA_DIR}/wakeup.json`;
export const BOT_PROPERTIES_PATH = `${DATA_DIR}/bot_properties.json`;
export const DATASETS_PATH = `${DATA_DIR}/datasets.json`;
