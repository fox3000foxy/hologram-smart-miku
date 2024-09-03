const express = require("express");
const bodyParser = require("body-parser");
const { Readable } = require("stream");
const aimlHigh = require('./aiml-high');
const fs = require('fs');
const { Hercai } = require('hercai');

// Constants
const PORT = 3000;
const PUBLIC_DIR = __dirname + '/public';
const INDEX_FILE = `${PUBLIC_DIR}/index.html`;
const DATA_DIR = './data';
const AIML_RESPONSE_LIMIT = 7;
const HERC_API_KEY = "F8f3+HpW4Gn0NcCpsdTQbhzWfcwBbR0ID34TKqOy3g="; // Replace with your actual API key

// API and Data Paths
const INTERNET_DEPENDENCY_RESPONSES_PATH = `${DATA_DIR}/internetDependencyResponses.json`;
const BULLSHIT_RESPONSES_PATH = `${DATA_DIR}/bullshit.json`;
const BOT_PROPERTIES_PATH = `${DATA_DIR}/bot_properties.json`;
const DATASETS_PATH = `${DATA_DIR}/datasets.json`;

// Loading data
const internetDependencyResponses = require(INTERNET_DEPENDENCY_RESPONSES_PATH);
const bullshitResponses = require(BULLSHIT_RESPONSES_PATH);
const botProperties = require(BOT_PROPERTIES_PATH);
const datasets = require(DATASETS_PATH);

const app = express();
const herc = new Hercai(HERC_API_KEY); // Initialize Hercai with API key
const interpreter = new aimlHigh(botProperties, 'Goodbye');

// Load AIML datasets
interpreter.loadFiles(datasets.map(file => `${DATA_DIR}/datasets/${file}`));

// Middleware setup
app.use(bodyParser.json());

// Serve the index page
app.get('/', (req, res) => {
    res.sendFile(INDEX_FILE);
});

// Helper functions
function generatePrompt(question) {
    const promptTemplate = fs.readFileSync(`${DATA_DIR}/prompt.txt`).toString();
    return promptTemplate.replace(/question/g, question);
}

function AIMLCallback(answer, wildCardArray, input) {
    const bullshit = getBullshit();
    return answer && !answer.includes("undefined")
        ? {
            reply: answer,
            hiragana_form: bullshit.japanese,
            id: bullshit.id,
            type: bullshit.type
        }
        : internetDependencyResponses[Math.floor(Math.random() * internetDependencyResponses.length)];
}

function getAIMLResponse(text) {
    let response;
    for (let i = 0; i < AIML_RESPONSE_LIMIT; i++) {
        const matching = interpreter.findAnswer(text, AIMLCallback);
        if (matching) response = matching;
    }
    return response;
}

function getBullshit() {
    return bullshitResponses[Math.floor(Math.random() * bullshitResponses.length)];
}

// API endpoints
app.post('/mikuAi', async (req, res) => {
    const content = req.body?.content;
    if (!content) {
        return res.json({
            success: false,
            message: "Content is needed in the JSON payload"
        });
    }

    try {
        const prompt = generatePrompt(content);
        const { reply } = await herc.question({
            model: "turbo",
            content: prompt
        });

        const cleanedReply = reply.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
        const bullshit = getBullshit();

        res.json({
            success: true,
            message: {
                reply: cleanedReply,
                hiragana_form: bullshit.japanese,
                id: bullshit.id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

app.post('/mikuAi-offline', async (req, res) => {
    const content = req.body?.content;
    if (!content) {
        return res.json({
            success: false,
            message: "Content is needed in the JSON payload"
        });
    }

    const response = getAIMLResponse(content);
    res.json({
        success: true,
        message: response
    });
});

app.post('/voicevox', async (req, res) => {
    try {
        const queryData = await fetch(`${VOICEVOX_API_BASE_URL}/audio_query?text=${encodeURIComponent(req.body.text)}&speaker=${DEFAULT_SPEAKER}`, {
            method: 'POST',
        }).then(response => response.text());

        const response = await fetch(`${VOICEVOX_API_BASE_URL}/synthesis?speaker=${DEFAULT_SPEAKER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: queryData,
        });

        Readable.fromWeb(response.body).pipe(res);
    } catch (error) {
        console.error("VoiceVox API Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process voice synthesis"
        });
    }
});

app.get('/isOnline', async (req, res) => {
    require('dns').resolve('www.google.com', (err) => {
        res.send({ isOnline: !err });
    });
});

// Serve static files
app.use(express.static(PUBLIC_DIR));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
