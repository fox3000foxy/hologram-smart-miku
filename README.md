# Overview
![image](https://github.com/user-attachments/assets/79a2b1b9-de90-4a4b-8ba3-572dbcc30823)
_Hatsune Miku Hologram Version that acts like Alexa_
**Beware : French documentation !**

Ce projet est un DIY personnel que j'ai tenu à faire après une mauvaise expérience d'achat au Japon.<br>
Cet achat était une Digital Figure Box de la marque GateBox qui devait coûter 5500 yens (30€), et qui m'est finalement revenu à 83€.<br>
Je pensais que cette petite boite pouvait faire le job de sa version originale à 2700€, mais je me suis retrouvé avec une boite en carton qui avait besoin d'un smartphone pour faire écran (donc 50€ en plus :D).<br>
Elle remplacera donc [cet objet](https://www.youtube.com/watch?v=nkcKaNqfykg) qui coûte trop cher pour moi et qui peut faire les mêmes choses en termes techniques.<br>
La seule différence est que la waifu ne sera pas active de manière constante. Pour plus d'information, voir la section **Documentation**

La partie construction matérielle peut être trouvée sur Internet et YouTube, que ça soit une simple hologram box ou une pyramid box. Vous pourrez trouver des vidéos que je recommande de suivre pour pouvoir construire le projecteur holographique que vous souhaitez. Adaptez les constructions à la taille de votre écran, je recommande un écran de tablette 8 pouces. (disponible dans **Matériel pour le DIY**)

La partie logicielle est celle que j'ai codée et qui se trouve dans ce repository.<br>
Elle supporte les deux formes de box et fonctionne également hors ligne.<br>
Elle peut également, via plusieurs API, vous donner la météo, vous informer des dernières nouvelles, ou encore contrôler les appareils connectés à l'aide de simples commandes vocales.<br>
Vous pouvez interroger la waifu à la manière d'Alexa.

Elle est conçue pour pouvoir répondre entièrement en ligne, ainsi qu'à quelques questions (chatbot AIML A.L.I.C.E fine-tuné) et commandes ("allumes la lumière","éteins la lumière", "donne moi la météo", "donne moi la température") quand elle tourne sans internet. (La liste des questions disponibles sera bientôt disponible)

# Documentation 
La première fois, cliquez sur votre écran et dites "Hey Miku !" (ca doit sonner comme "et mikou", vous pouvez également dire "nico").<br>
Ensuite, décrivez votre requête et laissez l'IA vous répondre. :)<br>
L'assistante vous écoutera tout le long que vous interagissez avec elle.<br>
Quand vous avez fini, dites "Au revoir Miku.", vous pourrez la réveiller plus tard.<br>

Comme dit plus haut, elle comprend une IA hors ligne, qui est un chatbot AIML conditionné pour se comporter comme Miku, basée sur A.L.I.C.E.

L'hologrammification fait parti du projet, inspirée de [cette vidéo](https://www.youtube.com/watch?v=P09TWAMLhE4).<br>
L'idée de ce projet est de pouvoir construire pour très peu cher ma propre Alexa, sous forme de Miku, et ayant une présence, un "corps".

Vous pourrez importer un modèle personnalisé pour votre assistante, à condition de changer la source du modèle chargé dans public/main.js.

Le mode pyramide est également disponible. <br>
Cliquez sur cette image pour voir ce que ça donnerait habituellement:<br>
[![image](https://github.com/user-attachments/assets/4b326331-a4c9-430d-a41b-711492828e6c)](https://youtu.be/dJruyJ4keqM?t=29)<br>
Il permet, à l'aide d'une pyramide de plexiglass, de pouvoir projeter le modèle sur 4 faces, ce qui permet d'avoir un rendu à 360 degrés équilatéral de notre assistante.<br>
Vous pouvez changer la variable `PYRAMID_MODE` à `TRUE` dans public/main.js pour pouvoir passer au mode pyramide.<br>
**ATTENTION:** Le mode pyramide remplace les sous titres par un doublage en français ! (Il ne remplace pas la voix de l'assistante, mais le baisse considérablement).

# Hébergement
Vous pouvez utiliser Termux sur votre appareil (pour moi c'est une tablette 8 pouces) ou héberger le serveur web sur un Raspberry PI (Il vous faudra le configurer en tant que relai, pour pouvoir recevoir les réponses de l'IA et pouvoir accéder à l'assistante hors connexion. L'appareil qui fait l'écran devra y être connecté en wifi.)

# Crédits
- Le projet opensource [VoiceVOX](https://voicevox.hiroshiba.jp/) pour les fichiers audios.
- La voix de [春日部つむぎ 利用規約 (Kasube Tsumugi)](https://voicevox.hiroshiba.jp/product/kasukabe_tsumugi/) ([Conditions d'utilisations](https://tsumugi-official.studio.site/rule)).
- Le projet [datenhahn/python-aiml-chatbot](https://github.com/datenhahn/python-aiml-chatbot/) pour les données AIML.
- Le projet [gleuch/aiml-high](https://github.com/gleuch/aiml-high) pour l'interpréteur AIML NodeJS.
- L'API projet [herc.ai](https://github.com/) pour l'interpréteur AIML NodeJS.
- `ad` pour le [modèle 3d de Miku](https://hub.vroid.com/en/characters/6393831588053029732/models/292088747503985726).
- Le projet [pixiv/three-vrm](https://github.com/pixiv/three-vrm), qui permet de pouvoir utiliser et changer le modèle VRM utilisée pour l'hologramme.  

# Matériel pour le DIY
- Ecran: [Tablette 8 Pouces (avec Protecteur d'écran lumière Bleue)](https://www.amazon.fr/gp/product/B0C7VHG8PL/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&psc=1)
- Pyramide / Ecran de projection: [Lot de 5 feuilles en acrylique transparent (8,26x11,6 pouces, panneau en plastique, épaisseur de 1mm)](https://www.temu.com/fr/lot-de-5-feuilles-en-acrylique-transparent-8-26x11-6-pouces-panneau-en-plastique-pour-le-remplacement--de-cadre-photo-projets-d-exposition-artistique-%C3%A9paisseur-de-1-0-mm-film-anti-rayures-haute-clart%C3%A9-g-601099563734027.html?_oak_mp_inf=EIuo4q%2Bm1ogBGiAxM2JkMjgzZWNlYWQ0YWYwODE5MTdiZjVlMDg5NWQzOSDw7pC6mzI%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2F2d7c51bb-c95b-4f72-b698-6e74e4dcc528.jpg&spec_gallery_id=4119781572&refer_page_sn=10009&refer_source=0&freesia_scene=2&_oak_freesia_scene=2&_oak_rec_ext_1=Nzc1&_oak_gallery_order=1291141593%2C1421948185%2C36196099%2C207688512%2C1801095390&search_key=plaque%20acrylique%205%20feuilles&refer_page_el_sn=200049&refer_page_name=search_result&refer_page_id=10009_1725356561827_z8u8w4q9l4&_x_sessn_id=tudzg6f4yi)
- Boite a chaussure à découper / Pièces en bois (Ce que vous voulez, mais c'est pour la structure de la boite)
- Colle (Servira à assembler les différents composants)
- Marqueur (Pour pouvoir faire les repères)
- Raspberry PI (facultatif, servirait à faire tourner le serveur NodeJS)

# Interactions avec l'IOT
(WIP) Le matériel n'ayant pas encore été choisi, je ne peux pour l'instant ni fournir de matériel domotique compatible, ni d'interactions avec via l'assistante. Cependant, je vais pouvoir coder la technologie qui permettra de pouvoir lister les appareils connectés et qui permettra à l'assistante de pouvoir évaluer des appels aux fonctions qui vont pouvoir changer l'état du matériel. Je reviendrais sur ce repository pour préciser le matériel que j'utilise, mais si vous utilisez un matériel différent, vous devrez coder votre propre API pour écraser la mienne.

# Tutoriel pour le DIY
[![image](https://github.com/user-attachments/assets/66352146-181b-49d9-83d7-3cb7192aaf2f)](https://youtu.be/iiJn9H-8H1M)<br>
Cette vidéo vous montrera comment construire l'hologram box

[![image](https://github.com/user-attachments/assets/8cb1b82f-1059-488a-b39c-e6768176357b)](https://www.youtube.com/watch?v=6OjKO_5BcPo)<br>
Celle ci vous montrera comment construire la pyramide holographique

# TODO
- *Refactoriser le code en Typescript. (Sera probablement fait à la fin)*
- *Créer un système de cache pour les API précédentes:* <br>
  - Pour l'IOT: mettre en place un système de routage LAN pour les équipements et appareils connectés._
  - ~~Pour la météo: récupérer les données GPS (facultatif), conserver dans un fichier "cache" la météo heure par heure, et en fonction de l'heure, donner la météo~~
  - ~~Pour les news: garder en cache certaines news, et demander à l'IA de pouvoir en faire des synthèses pour pouvoir garder des news concises~~
  - ~~Pour le reste: récupérer régulièrement les données (toutes les 15 minutes), les stocker dans un fichier cache dédié, et si hors ligne, renvoyer le cache, sinon, renvoyer la donnée récupérée à l'instant T.~~
- *Coder le moteur et l'API qui permettra d'intéragir avec de la domotique.*
- ~~Voir les traductions des phrases de réveil à la place de "Réveil...".~~
- ~~Optimiser le code via des standards et remplacer les textes en brut par des constantes~~
- ~~Rajouter~~ ~~Forcer la reconnaissance vocale continue persistante. (Implémentée mais buggée :\)~~
- ~~Prévoir des API du genre "météo, news, iot, etc..."~~ 
- ~~Ajouter la météo et les news en offline mode. Coder l'intelligence artificielle pour pouvoir donner ces informations.~~
- ~~Ajouter une synthèse vocale qui fera le doublage en français pour le Pyramid Mode.~~
- ~~Rendre les sous titres responsive (ils sont trop gros pour un petit écran).~~

Ce qui est en italique est infaisable tant que je n'ai pas le matériel.

# License
MIT, voir LICENSE pour plus de détails.
