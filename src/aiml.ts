import { bullshitResponses, internetDependencyResponses } from './data';
import AimlHigh, { AimlCallback } from './lib/aiml-high';
import { BotProperties, BullshitItem } from './types';

let interpreter: AimlHigh;

export function initAiml(botProperties: BotProperties, datasetPaths: string[]) {
    interpreter = new AimlHigh(botProperties, 'Goodbye');
    interpreter.loadFiles(datasetPaths);
}

// consumer functions assume interpreter has been initialized

export const AIMLCallback: AimlCallback = (answer) => {
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

export function getAIMLResponse(text: string, limit = 7): string | { reply: string } {
    let response: string | { reply: string } = {
        reply: 'Je suis désolé, je ne comprends pas encore cette question.'
    };
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
