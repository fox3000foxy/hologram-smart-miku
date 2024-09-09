const express = require("express");
const bodyParser = require("body-parser");
const { Readable } = require("stream");
const aimlHigh = require('./aiml-high');
const fs = require('fs');
const { Hercai } = require('hercai');
const SearchEngine = require('cdrake-se');
const https = require('https');

process.env = {...process.env, ...require('dotenv').config().parsed}

// Constants
const PORT = 3000;
const PUBLIC_DIR = __dirname + '/public';
const INDEX_FILE = `${PUBLIC_DIR}/index.html`;
const DATA_DIR = './data';
const AIML_RESPONSE_LIMIT = 7;
const HERC_API_KEY = process.env.HERC_API_KEY; // Replace with your actual API key

// API and Data Paths
const INTERNET_DEPENDENCY_RESPONSES_PATH = `${DATA_DIR}/internetDependencyResponses.json`;
const BULLSHIT_RESPONSES_PATH = `${DATA_DIR}/bullshit.json`;
const WAKEUP_REPONSES_PATH = `${DATA_DIR}/wakeup.json`;
const BOT_PROPERTIES_PATH = `${DATA_DIR}/bot_properties.json`;
const DATASETS_PATH = `${DATA_DIR}/datasets.json`;

// Loading data
const internetDependencyResponses = require(INTERNET_DEPENDENCY_RESPONSES_PATH);
const bullshitResponses = require(BULLSHIT_RESPONSES_PATH);
const wakeupResponses = require(WAKEUP_REPONSES_PATH);
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
    let promptTemplate = fs.readFileSync(`${DATA_DIR}/prompt.txt`).toString();
	if(question.includes("météo")) {
		promptTemplate += `Voici la météo pour les 7 prochains jours: \n${format7DayForecast(getMeteoCache())}. Ne donne que celle qui t'es demandé.`
	}
	if(question.includes("température")) {
		promptTemplate += `Voici la température: ${getTemperature(new Date())}°C`
	}
	if(question.includes("nouvelles") || question.includes("news")) {
		promptTemplate += `Voici les news récentes: \n${formatSearchResults(getNewsCache())}`
	}
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

function formatSearchResults(searchResults) {
  return searchResults.map(result => {
    return `${result.Publisher} ${result.PublishedAt} | **${result.Title}** : ${result.Description}`;
  });
}

function convertToHours(publishedAt) {
  if (publishedAt.includes('heure') || publishedAt.includes('heures')) {
    return parseInt(publishedAt.match(/\d+/)[0]);
  } else if (publishedAt.includes('jour') || publishedAt.includes('jours')) {
    return parseInt(publishedAt.match(/\d+/)[0]) * 24;
  }
  return 0;
}

function sortByRecent(searchResults) {
  return searchResults.sort((a, b) => {
    const hoursA = convertToHours(a.PublishedAt);
    const hoursB = convertToHours(b.PublishedAt);
    return hoursA - hoursB;
  });
}

function getClosestTemperature(date, weatherData) {
  const targetTime = date.toISOString();

  let closestIndex = 0;
  let closestDifference = Math.abs(new Date(weatherData.hourly.time[0]) - date);

  for (let i = 1; i < weatherData.hourly.time.length; i++) {
    const currentDifference = Math.abs(new Date(weatherData.hourly.time[i]) - date);
    if (currentDifference < closestDifference) {
      closestDifference = currentDifference;
      closestIndex = i;
    }
  }

  return weatherData.hourly.temperature_2m[closestIndex];
}

function calculateDailyAverages(weatherData) {
  const dailyAverages = [];
  let dayTemps = [];
  let currentDay = new Date(weatherData.hourly.time[0]).getDate();

  weatherData.hourly.time.forEach((time, index) => {
    const date = new Date(time);
    const day = date.getDate();

    if (day === currentDay) {
      dayTemps.push(weatherData.hourly.temperature_2m[index]);
    } else {
      const averageTemp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
      dailyAverages.push({ day: new Date(time).toISOString().split("T")[0], averageTemp });

      dayTemps = [weatherData.hourly.temperature_2m[index]];
      currentDay = day;
    }
  });

  if (dayTemps.length > 0) {
    const averageTemp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
    dailyAverages.push({ day: new Date(weatherData.hourly.time[weatherData.hourly.time.length - 1]).toISOString().split("T")[0], averageTemp });
  }

  return dailyAverages;
}

function format7DayForecast(weatherData) {
  const dailyAverages = calculateDailyAverages(weatherData);
  
  const next7DaysForecast = dailyAverages.slice(0, 7).map(dayData => {
    return `Le ${parseInt(dayData.day.split("-")[2])}, il fera ${parseInt(dayData.averageTemp)}°.`;
  });

  return next7DaysForecast.join("\n");
}

function switchLights(state) {
	//TO CODE
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
	
	let response;

	if(content=="météo") {
		response = {reply: `Voici la météo pour les 7 prochains jours: \n${format7DayForecast(getMeteoCache())}`}
	}
	else if(content=="température") {
		response = {reply: `La température actuelle est de ${getTemperature(new Date())}°.`}
	}
	else if(content=="news" || content=="nouvelles") {
		response = {reply: `Voici les nouvelles: ${formatSearchResults(getNewsCache())}`}
	}
	else if(content=="allume lumière") {
		switchLights(true);
		response = {reply: `J'ai allumé la lumière.`}
	}
	else if(content=="éteins lumière") {
		switchLights(false);
		response = {reply: `J'ai éteint la lumière.`}
	}
	else {
		response = getAIMLResponse(content);		
	}
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

app.get('/wakeupText', (req,res) => {
	const wakeupId = req.query?.id;
	if(!wakeupId || (wakeupId > 6 && wakeupId < 1)) {
		res.send({success: false})
	} else {
		let wakeup = wakeupResponses.find(({id})=>id==wakeupId)
		res.send({success: true, response: wakeup})
	}
})

// Serve static files
app.use(express.static(PUBLIC_DIR));



// Start the server
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
const server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/** APIS */
//Weather API
async function getMeteo(latitude,longitude) {	
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m`;
	return await fetch(url).then(response => response.json());
}

//News API
async function getNews(Query){
    try{
        const news = await SearchEngine({
            Method: 'News',
            Page: 1,
            Query,
            Language: 'fr'
        });
		return sortByRecent(news.Results);
    }catch(SearchRuntimeError){
        console.log(SearchRuntimeError);
    }
}

/** Get caches */
// Weather cache
function getMeteoCache() {
	return JSON.parse(fs.readFileSync("./cache/weather.json").toString());
}

// News cache
function getNewsCache() {
	return JSON.parse(fs.readFileSync("./cache/news.json").toString());
}

/** Get caches specific values */
// Weather value
function getTemperature(date) {
	const meteo = getClosestTemperature(date, getMeteoCache());
	return meteo;
}

/** Caches daemons */
//Weather cache
async function weatherDaemon(){	
	let data = await getMeteo(process.env.LATITUDE,process.env.LONGITUDE)
	fs.writeFileSync("./cache/weather.json", JSON.stringify(data,0,2));
}

//News cache
async function newsDaemon(){	
	let data = await getNews(process.env.NEWS_PREFERENCES)
	fs.writeFileSync("./cache/news.json", JSON.stringify(data,0,2));
}

//Daemons every hour
function executeDaemons() {
	require('dns').resolve('www.google.com', async (err) => {
        if(!err) {
			await weatherDaemon();
			await newsDaemon();
		}
    });
}
setInterval(executeDaemons, 60 * 60 * 1000);	

//First launch
executeDaemons();

//Prevent process from crashing
process.on('uncaughtException', (error)  => {
    console.log('Oh my god, something terrible happened: ',  error);
    process.exit(1); // exit application 
})

process.on('unhandledRejection', (error, promise) => {
  console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
  console.log(' The error was: ', error );
});
