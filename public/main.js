import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { loadMixamoAnimation } from './loadMixamoAnimation.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const PYRAMID_MODE = true;

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
    playAnimation("WavingGesture")
	playAudio("welcome", ()=>{}, () => {
		wakeupRecognizer.start();
		lyricsElement.innerHTML = "<i>Dites 'Hey Miku' ou 'Bonjour Miku' pour commencer</i>";
		playAnimation("Idle2");
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
                            playAnimation("Idle2");
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

// Configuration du rendu Three.js
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Configuration de la caméra
const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.0, 5.0);

// Configuration de la scène et de l'éclairage
const scene = new THREE.Scene();
const light = new THREE.DirectionalLight(0xffffff, Math.PI);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// Chargement du modèle VRM
const defaultModelUrl = '/models/mikuBest.vrm';
let currentVrm, currentAnimationUrl, currentMixer, currentAnimation;
const helperRoot = new THREE.Group();
helperRoot.renderOrder = 10000;

let vrms = []; // Tableau pour stocker les 4 modèles VRM
let mixers = []; // Tableau pour stocker les 4 mixers
let positions = [];
let rotations = [];
lyricsElement.style.display = "none";
if(PYRAMID_MODE) {		
	// positions = [
		// { x: -0.05, y: 0.6, z: -5.0 }, // Modèle inversé en Z
		// { x: -0.05, y: 1.4, z: -5.0 }, // Position centrale
		// { x: 1.5, y: 1.0, z: -5.0 }, // Modèle à gauche
		// { x: -1.5, y: 1.0, z: -5.0 }  // Modèle à droite
	// ];

	// rotations = [
		// { x: 0.0, y: 0.0, z: Math.PI },        // Rotation centrale
		// { x: Math.PI, y: Math.PI, z: Math.PI },    // Modèle inversé
		// { x: Math.PI / 2 , y: 0.0, z: Math.PI / 2 }, // Rotation vers la gauche
		// { x: Math.PI / 2, y: 0.0, z: Math.PI / 2 + Math.PI } // Rotation vers la droite
	// ];
	positions = [
		{ x: 0.0, y: -1.5, z: -6.0 }, // Modèle inversé en Z
		{ x: 0.0, y: 3.5, z: -6.0 }, // Position centrale
		{ x: 1.4, y: 1.0, z: -6.0 }, // Modèle à gauche
		{ x: -1.4, y: 1.0, z: -6.0 }  // Modèle à droite
	];

	rotations = [
		{ x: 0.0, y: 0.0, z: 0.0 },        // Rotation centrale
		{ x: Math.PI, y: Math.PI, z: 0},    // Modèle inversé
		{ x: Math.PI / 2 , y: 0.0, z: -(Math.PI/2)}, // Rotation vers la gauche
		{ x: Math.PI / 2, y: 0.0, z: Math.PI / 2 } // Rotation vers la droite
	];

	lyricsElement.style.display = "none";
}
else {
	positions = [
		{ x: 0.0, y: 0.0, z: 0.0 }
	]
	
	
	rotations = [
		{ x: 0.0, y: 0.0, z: 0.0 }
	]
}

function loadVRM(modelUrl,i,cb=(()=>{})) {
    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';

    helperRoot.clear();
    loader.register((parser) => new VRMLoaderPlugin(parser, {
        helperRoot: helperRoot,
        autoUpdateHumanBones: true,
    }));

    loader.load(
        modelUrl,
        (gltf) => {
            const vrm = gltf.userData.vrm;
			
			vrms.push(vrm);
			vrm.scene.position.set(positions[i].x, positions[i].y, positions[i].z);
			vrm.scene.rotation.set(rotations[i].x, rotations[i].y, rotations[i].z);
            scene.add(vrm.scene);

            vrm.scene.traverse((obj) => {
                obj.frustumCulled = false;
            });

			VRMUtils.rotateVRM0(vrm);
			window.onclick = () => {
				lyricsElement.innerText = "";
				startWakeupRecognition();
				window.onclick = () => {};
			};
			
			cb();
        },
        (progress) => {
			let percent = (100.0 * progress.loaded / progress.total).toFixed(2);
			console.log(`Loading model... ${percent}%`);
		},
        (error) => console.error(`Error loading model: ${error}`),
    );
}

for (let i in positions) {
	if(i == positions.length - 1) {
		loadVRM(defaultModelUrl,i,()=>{
			setTimeout(()=>{
				// playAnimation("Idle2");				
			},100)
		});		
	}
	else {
		loadVRM(defaultModelUrl,i);		
	}
}


function loadFBX(animationUrl, cbLoad = () => {}, cbPlay = () => {}) {
    currentAnimationUrl = animationUrl;
	for(let vrm of vrms) {
		let mixer = new THREE.AnimationMixer(vrm.scene);

		loadMixamoAnimation(animationUrl, vrm).then((clip) => {
			mixer.clipAction(clip).play();
			cbLoad();
			mixer.addEventListener('loop', cbPlay);				
			mixer.timeScale = 0.75;
		});
		
		mixers.push(mixer);
	}
}

// Boucle d'animation
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
	// setTimeout(animate,50)

    const deltaTime = clock.getDelta();
    if (mixers) {
        mixers.forEach(mixer=>{
			mixer.update(deltaTime);
		})
    }
    if (vrms) {
		vrms.forEach(vrm=>{
			vrm.update(deltaTime);
		})
    }

    renderer.render(scene, camera);
}
animate();

// Fonctions utilitaires
function playAnimation(name) {
    if (currentAnimation !== name) {
        loadFBX(`/animations/${name}.fbx`);
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

/** Deprecated: inexisting endpoint */
async function synthesis(text, cbPlay, cbStop) {
    const audio = new Audio();
    try {
        const arrayBuffer = await fetch("voicevox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        }).then((data) => data.arrayBuffer());

        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        audio.src = URL.createObjectURL(blob);
        audio.onplay = cbPlay;
        audio.onended = cbStop;
        audio.play();

        return true;
    } catch (error) {
        console.error(`Error fetching or playing audio: ${error}`);
        return false;
    }
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

/** Record animations

var blob, deviceRecorder = null;
var chunks = [];
const displayMediaOptions = {
  video: {
    displaySurface: "browser",
	frameRate: 60,
	"height": 1440,
    "width": 2560,
    "resizeMode": "crop-and-scale",
  },
  audio: {
    suppressLocalAudioPlayback: false,
  },
  preferCurrentTab: true,
  // selfBrowserSurface: "exclude",
  systemAudio: "exclude",
  surfaceSwitching: "include",
  monitorTypeSurfaces: "include",
};

async function startRecording(){
    var stream =  await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );

    deviceRecorder = new MediaRecorder(stream, {mimeType: "video/webm"});
	deviceRecorder.ondataavailable = (e) => {
		if(e.data.size > 0){
			 chunks.push(e.data);
		}
	}
	deviceRecorder.onstop = () => {
		chunks = [];
	}
	deviceRecorder.start(250)
}

let isStopped = false;
function stopRecording(filename){
    // var filename = window.prompt("File name", "video"); // Ask the file name

    deviceRecorder.stop(); // Stopping the recording
    blob = new Blob(chunks, {type: "video/webm"})
    chunks = [] // Resetting the data chunks
    var dataDownloadUrl = URL.createObjectURL(blob);

    // Downloadin it onto the user's device
    let a = document.createElement('a')
    a.href = dataDownloadUrl;
    a.download = `${filename}.webm`
    a.click()
    
    URL.revokeObjectURL(dataDownloadUrl)
}

async function motionToMp4(animation) {
	let capture = await startRecording();
	setTimeout(()=>{		
		loadFBX(`/animations/${animation}.fbx`, () => {
		}, () => {
			setTimeout(()=>{
				if(!isStopped) {
					stopRecording(animation);
					isStopped = true;
				}
			},500)
		})
	},2250)
}

setTimeout(()=>{
	motionToMp4("Idle2")
},5000)

 */