# Overview
![image](https://github.com/user-attachments/assets/79a2b1b9-de90-4a4b-8ba3-572dbcc30823)
Hatsune Miku Hologram Version that acts like Alexa
Beware : French documentation !

# Documentation 
La première fois, cliquez et dites "Hey Miku !" (ca doit sonner comme "et mikou").
Ensuite, décrivez votre requête et laissez l'IA vous répondre :)
Quand vous avez fini, dites "Au revoir Miku.".

Comprend une IA hors ligne, qui est un chatbot AIML conditionné pour se comporter comme Miku, basée sur A.L.I.C.E.

Fait parti d'un projet avec un hologramme inspiré de [cette vidéo](https://www.youtube.com/watch?v=P09TWAMLhE4).
L'idée de ce projet est de pouvoir construire pour très peu cher ma propre Alexa.

Il existe le mode pyramide: <br>
![image](https://github.com/user-attachments/assets/4b326331-a4c9-430d-a41b-711492828e6c)<br>
Le mode pyramide permet, à l'aide d'une pyramide de plexiglass, de pouvoir projeter le modèle sur 4 faces, ce qui permet d'avoir un rendu 360 degréé de notre assistante.

# TODO
- Refactoriser le code en Typescript.
- Voir les traductions des phrases de réveil à la place de "Réveil...".
- Coder le moteur et l'API qui permettra d'intéragir avec de la domotique.
~~- Optimiser le code via des standards et remplacer les textes en brut par des constantes~~
- Rajouter la reconnaissance vocale continue persistante (elle est censée marcher mais ne marche pas :\)
- Prévoir des API du genre "météo, news, iot, etc..."
- Créer un système de cache pour les API précédentes: <br>
  - Pour la météo: récupérer les données GPS (facultatif), conserver dans un fichier "cache" la météo heure par heure, et en fonction de l'heure, donner la météo
  - Pour les news: garder en cache certaines news, et demander à l'IA de pouvoir en faire des synthèses pour pouvoir garder des news concises
  - Pour l'IOT: mettre en place un système de routage LAN pour les équipements et appareils connectés
  - Pour le reste: récupérer régulièrement les données (toutes les 15 minutes), les stocker dans un fichier cache dédié, et si hors ligne, renvoyer le cache, sinon, renvoyer la donnée récupérée à l'instant T    


# Crédits
- [https://voicevox.hiroshiba.jp/](https://voicevox.hiroshiba.jp/) pour les fichiers audios.
- La voix de [春日部つむぎ 利用規約 (Kasube Tsumugi)](https://voicevox.hiroshiba.jp/product/kasukabe_tsumugi/) ([Conditions d'utilisations](https://tsumugi-official.studio.site/rule)).
- Le projet [datenhahn/python-aiml-chatbot](https://github.com/datenhahn/python-aiml-chatbot/) pour les données AIML.
- Le projet [gleuch/aiml-high](https://github.com/gleuch/aiml-high) pour l'interpréteur AIML NodeJS.
- L'API projet [herc.ai](https://github.com/) pour l'interpréteur AIML NodeJS.
- `ad` pour le [modèle 3d de Miku](https://hub.vroid.com/en/characters/6393831588053029732/models/292088747503985726).

# License
MIT
