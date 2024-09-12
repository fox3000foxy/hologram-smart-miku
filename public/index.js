window.addEventListener('error',({error})=>{
	alert(error)
})

document.body.style.backgroundColor = "black";


let currentVrm, currentAnimationUrl, currentMixer, currentAnimation;
const PYRAMID_MODE = true;
document.getElementById(`TalkingVideo`).src = `/video/Talking${PYRAMID_MODE?"Pyramid":""}.mp4`;
document.getElementById(`WavingVideo`).src = `/video/Waving${PYRAMID_MODE?"Pyramid":""}.mp4`;
document.getElementById(`IdleVideo`).src = `/video/Idle2${PYRAMID_MODE?"Pyramid":""}.mp4`;
document.getElementById(`lyrics`).style.display = PYRAMID_MODE ? "none" : ""

// Constantes pour les conditions
const WAKEUP_PHRASES = ["hey miku", "hey micou", "hey mikou", "et miku", "bonjour mikou", "bonjour miku", "bonjour micou"];
const GOODBYE_PHRASES = ["au revoir miku", "au revoir micou", "au revoir mikou", "au revoir nico"];

// Éléments DOM
const lyricsElement = document.getElementById("lyrics");
lyricsElement.innerHTML = "<i>Cliquez pour commencer</i>";

// Configuration de la reconnaissance vocale pour la phrase de réveil
const wakeupRecognizer = new webkitSpeechRecognition();
wakeupRecognizer.continuous = true;
wakeupRecognizer.interimResults = true;

// Configuration de la reconnaissance vocale globale
const globalRecognizer = new webkitSpeechRecognition();
globalRecognizer.continuous = true;
globalRecognizer.interimResults = true;

// Fonction pour démarrer la reconnaissance de la phrase de réveil
function startWakeupRecognition() {
	waitingForWakeUp = true;
	lyricsElement.innerHTML = "<i>Miku vous salue</i>";
    playAnimation("Waving")
	playAudio("welcome", ()=>{}, () => {
		wakeupRecognizer.start();
		lyricsElement.innerHTML = "<i>Dites 'Hey Miku' ou 'Bonjour Miku' pour commencer</i>";
		playAnimation("Idle");
	});
}

wakeupRecognizer.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim().replace("nico", "miku");
        if (event.results[i].isFinal) {
			console.log(transcript);
            if (WAKEUP_PHRASES.some(phrase => transcript.includes(phrase))) {
				waitingForWakeUp = false;
                wakeupRecognizer.stop();
                wakeMiku();
            }
        }
    }
};

let waitingForWakeUp = true;
let waitingForGlobal = true;

wakeupRecognizer.onend = function(event) {
	if(waitingForWakeUp==true) {		
		console.log("Waking up recognizer timed out, restarting...")
		wakeupRecognizer.stop();		
		setTimeout(()=>{
			wakeupRecognizer.start();		
		},200)
	}
} 

wakeupRecognizer.onerror = function(event) {
	console.log(event.error)
}

// Fonction pour jouer un son de réveil et démarrer la reconnaissance globale
async function wakeMiku() {
	let id = Math.floor(Math.random() * 4) + 1;
	let {response} = await fetch(`/wakeupText?id=${id}`).then(res=>res.json());
    lyricsElement.innerHTML = `<i>${response.translation} (Réveil...)</i>`;
    await playAudio(`wakeup${id}`, () => {}, startGlobalRecognition);
}

// Fonction pour démarrer la reconnaissance globale
function startGlobalRecognition() {
    lyricsElement.innerHTML = "<i>Miku est prête. Parlez...</i>";
    globalRecognizer.start();
}

globalRecognizer.onresult = async function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.replace("\n", "<br>").replace("nico", "Miku").toLowerCase().trim();
        if (event.results[i].isFinal) {
			waitingForGlobal = false;
            globalRecognizer.stop();
            if (transcript) {
                if (GOODBYE_PHRASES.some(phrase => transcript.includes(phrase))) {
					waitingForGlobal = false;
                    globalRecognizer.stop();
                    startWakeupRecognition();
                } else {
                    await interact(
                        transcript,
                        () => playAnimation("Talking"),
                        () => {
                            playAnimation("Idle");
							waitingForGlobal = true;
                            globalRecognizer.start();
                        },
                        () => {
				waitingForGlobal = true;
				globalRecognizer.start()
			}
                    );
                }
            } else {
                globalRecognizer.start();
            }
        }
    }
};

globalRecognizer.onend = function(event) {
	if(waitingForGlobal==true) {		
		console.log("Global up recognizer timed out...")
		globalRecognizer.stop();	
		setTimeout(()=>{
			startWakeupRecognition();
		},200)
	}
} 

// Fonctions utilitaires
function playAnimation(name) {
    if (currentAnimation !== name) {
	document.getElementById(`TalkingVideo`).style.display = "none";
	document.getElementById(`WavingVideo`).style.display = "none";
	document.getElementById(`IdleVideo`).style.display = "none";
	document.getElementById(`TalkingVideo`).pause();
	document.getElementById(`WavingVideo`).pause();
	document.getElementById(`IdleVideo`).pause();

	
	document.getElementById(`${name}Video`).style.display = "";
	document.getElementById(`${name}Video`).currentTime = 0;
	document.getElementById(`${name}Video`).play();
        currentAnimation = name;
    }
}

async function askAI(question) {
    const response = await fetch("/mikuAi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: question }),
    });
    return response.json();
}

async function askAIOffline(question) {
    const response = await fetch("/mikuAi-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: question }),
    });
    return response.json();
}

async function playAudio(name, cbPlay, cbStop) {
    const audio = new Audio();
    try {
        audio.src = `/audio/${name}.wav`;
        audio.onplay = cbPlay;
        audio.onended = cbStop;
		audio.volume = 0.3;
        audio.play();

        return true;
    } catch (error) {
        console.error(`Error fetching or playing audio: ${error}`);
        return false;
    }
}

async function playNAudio(n, cbPlay, cbStop) {
    if (n <= 0) {
        cbStop();
        return;
    }

    const name = `bullshit${(n%10) + 1}`;
    const success = await playAudio(name, cbPlay, async () => {
        await playNAudio(n - 1, cbPlay, cbStop);
    });

    if (!success) {
        console.error(`Failed to play audio: ${name}`);
    }
}

async function interact(text, cbPlay, cbStop, cbError) {
    text = text.replace("Nico", "Miku");
    lyricsElement.innerHTML = "<i>Réfléchit...</i>";
    
    const { isOnline } = await fetch('/isOnline').then(res => res.json());
    let response;

    if (isOnline) {
        response = await askAI(text);
    } else {
        response = await askAIOffline(text);
    }

    lyricsElement.innerHTML = "<i>Synthétise...</i>";

    if (response.success) {
        try {
            if (response.message.type === "noInternet") {
                await playAudio(`noInternet${response.message.id}`, cbPlay, cbStop);
            } else {
                const numOfSentences = response.message.reply.replaceAll(",", ".").split(/[.!?]/).length - 1;
                await playNAudio(numOfSentences, cbPlay, cbStop);
				if(PYRAMID_MODE){
					let utterance = new SpeechSynthesisUtterance(response.message.reply);
					// let synthesis = synthesis
					console.log(speechSynthesis)
					speechSynthesis.lang = "fr-FR";
					utterance.rate = 1.4;
					speechSynthesis.speak(utterance);
				}
            }
        } catch (e) {
            console.error(e);
            cbError();
        }
        lyricsElement.innerText = response.message.reply;
    } else {
        lyricsElement.innerHTML = "Il y a eu une erreur. Regarde la console :/";
    }
}


window.onclick = () => {
	lyricsElement.innerText = "";
	startWakeupRecognition();
	window.onclick = () => {};
	document.body.requestFullscreen();
};

playAnimation("Idle");

















