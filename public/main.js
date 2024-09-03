import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { loadMixamoAnimation } from './loadMixamoAnimation.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

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
	loadFBX("/animations/Idle2.fbx");
    playAudio("welcome", () => playAnimationOnce("WavingGesture"));

    wakeupRecognizer.start();
    lyricsElement.innerHTML = "<i>Dites 'Hey Miku' pour commencer</i>";
}

wakeupRecognizer.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (event.results[i].isFinal) {
			// console.log(transcript.toLowerCase().trim())
            if (
				transcript.toLowerCase().trim().replace("nico","miku").includes("hey miku") || 
				transcript.toLowerCase().trim().replace("nico","miku").includes("hey micou") || 
				transcript.toLowerCase().trim().replace("nico","miku").includes("hey mikou") || 
				transcript.toLowerCase().trim().replace("nico","miku").includes("et miku") 
			) {
                wakeupRecognizer.stop();
                wakeMiku();
            }
        }
    }
};

// Fonction pour jouer un son de réveil et démarrer la reconnaissance globale
async function wakeMiku() {
    lyricsElement.innerHTML = "<i>Réveil...</i>";
    await playAudio(`wakeup${Math.floor(Math.random() * 4) + 1}`, () => {}, startGlobalRecognition);
}

// Fonction pour démarrer la reconnaissance globale
function startGlobalRecognition() {
    lyricsElement.innerHTML = "<i>Miku est prête. Parlez...</i>";
    globalRecognizer.start();
}

globalRecognizer.onresult = async function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.replace("\n", "<br>").replace("nico", "Miku");
        if (event.results[i].isFinal) {
            globalRecognizer.stop();
            if (transcript) {
				if(
					transcript.toLowerCase().trim().includes("au revoir miku") ||
					transcript.toLowerCase().trim().includes("au revoir micou") ||
					transcript.toLowerCase().trim().includes("au revoir mikou")
				) {
					globalRecognizer.stop();
					startWakeupRecognition();
				} else {
					await interact(
						transcript,
						() => playAnimation("Talking"),
						() => {
							playAnimation("Idle2");
							globalRecognizer.start();
						},
						() => globalRecognizer.start()
					);
				}
            } else {
                globalRecognizer.start();
            }
        }
    }
};

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

function loadVRM(modelUrl) {
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

            if (currentVrm) {
                scene.remove(currentVrm.scene);
                VRMUtils.deepDispose(currentVrm.scene);
            }

            currentVrm = vrm;
            scene.add(vrm.scene);

            vrm.scene.traverse((obj) => {
                obj.frustumCulled = false;
            });

            if (currentAnimationUrl) {
                loadFBX(currentAnimationUrl);
            }

            VRMUtils.rotateVRM0(vrm);
			playAnimation("Idle2");
			window.onclick = () => {
				lyricsElement.innerText = "";
				startWakeupRecognition();
				window.onclick = () => {};
			};
        },
        (progress) => console.log(`Loading model... ${(100.0 * progress.loaded / progress.total).toFixed(2)}%`),
        (error) => console.error(`Error loading model: ${error}`),
    );
}

loadVRM(defaultModelUrl);

function loadFBX(animationUrl, cbLoad = () => {}, cbPlay = () => {}) {
    currentAnimationUrl = animationUrl;
    currentMixer = new THREE.AnimationMixer(currentVrm.scene);

    loadMixamoAnimation(animationUrl, currentVrm).then((clip) => {
        currentMixer.clipAction(clip).play();
        cbLoad();
        currentMixer.addEventListener('loop', cbPlay);
        currentMixer.timeScale = 0.75;
    });
}

// Boucle d'animation
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    if (currentMixer) {
        currentMixer.update(deltaTime);
    }
    if (currentVrm) {
        currentVrm.update(deltaTime);
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

function playAnimationOnce(name) {
    loadFBX("/animations/Idle2.fbx", () => {
        loadFBX(`/animations/${name}.fbx`, () => {}, () => loadFBX("/animations/Idle2.fbx"));
    });
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

async function speechSynthesis(text, cbPlay, cbStop) {
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

    const name = `bullshit${n}`;
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

// Tests unitaires supplémentaires
// Demandes en ligne
// askAI("Bonjour Miku, comment vas-tu ?").then((response) => { console.log(`Réponse AI en ligne: ${response}`); });
// askAI("Quel est le temps aujourd'hui ?").then((response) => { console.log(`Réponse AI en ligne: ${response}`); });
// askAI("Raconte-moi une blague.").then((response) => { console.log(`Réponse AI en ligne: ${response}`); });

// Demandes hors ligne
// askAIOffline("Quel est ton nom ?").then((response) => { console.log(`Réponse AI hors ligne: ${response}`); });
// askAIOffline("Quelle heure est-il ?").then((response) => { console.log(`Réponse AI hors ligne: ${response}`); });
// askAIOffline("Peux-tu chanter une chanson ?").then((response) => { console.log(`Réponse AI hors ligne: ${response}`); });

// Tests de synthèse vocale
// speechSynthesis("Bonjour, je suis Miku.", () => { console.log("Lecture commencée."); }, () => { console.log("Lecture terminée."); });
// speechSynthesis("C'est une belle journée.", () => { console.log("Lecture commencée."); }, () => { console.log("Lecture terminée."); });

// Tests de lecture audio
// playAudio("welcome", () => { console.log("Audio 'welcome' commencé."); }, () => { console.log("Audio 'welcome' terminé."); });
// playAudio("goodbye", () => { console.log("Audio 'goodbye' commencé."); }, () => { console.log("Audio 'goodbye' terminé."); });

// Tests d'interaction
// interact("Salut Miku!", () => { console.log("Animation 'Talking' jouée."); }, () => { console.log("Animation 'Idle2' jouée."); }, () => { console.log("Erreur dans l'interaction."); });
// interact("Chante une chanson.", () => { console.log("Animation 'Talking' jouée."); }, () => { console.log("Animation 'Idle2' jouée."); }, () => { console.log("Erreur dans l'interaction."); });

