// @ts-ignore - module has no types
const aimlHigh: any = require('../lib/aiml-high');
import { bullshitResponses, internetDependencyResponses } from './data';
import { BullshitItem } from './types';

let interpreter: any;

export function initAiml(botProperties: any, datasetPaths: string[]) {
  interpreter = new (aimlHigh as any)(botProperties, 'Goodbye');
  interpreter.loadFiles(datasetPaths);
}

// consumer functions assume interpreter has been initialized

export function AIMLCallback(
  answer: string | undefined,
  wildCardArray: any,
  input: any
) {
  const bullshit = getBullshit();
  return answer && !answer.includes('undefined')
    ? {
        reply: answer,
        hiragana_form: bullshit.japanese,
        id: bullshit.id,
        type: bullshit.type,
      }
    : internetDependencyResponses[
        Math.floor(Math.random() * internetDependencyResponses.length)
      ];
}

export function getAIMLResponse(text: string, limit = 7): any {
  let response: any;
  for (let i = 0; i < limit; i++) {
    const matching = interpreter.findAnswer(text, AIMLCallback);
    if (matching) response = matching;
  }
  return response;
}

export function getBullshit(): BullshitItem {
  return bullshitResponses[
    Math.floor(Math.random() * bullshitResponses.length)
  ];
}
