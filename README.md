# Overview
![image](https://github.com/user-attachments/assets/79a2b1b9-de90-4a4b-8ba3-572dbcc30823)
_Hatsune Miku Hologram Version that acts like Alexa_
**Beware : French documentation !**

Ce projet est un DIY personnel que j'ai tenu à faire après une mauvaise expérience d'achat au Japon.
Elle remplacera [cet objet](https://www.youtube.com/watch?v=nkcKaNqfykg) qui coûte trop cher pour moi et qui peut faire les mêmes choses en termes techniques.

La partie construction matérielle peut être trouvée sur Internet et YouTube, que ça soit une simple hologram box ou une pyramid box.

La partie logicielle est celle que j'ai codée.
Elle supporte les deux formes de box et fonctionne également hors ligne. Vous pouvez interroger la waifu à la manière d'Alexa.

Elle est conçue pour pouvoir répondre entièrement en ligne, ainsi qu'à quelques questions (chatbot AIML A.L.I.C.E fine-tuné).

(WIP) Elle pourra également, via plusieurs API, vous donner la météo, vous informer  des dernières nouvelles, ou encore contrôler les appareils connectés à l'aide de simples commandes vocales.

# Documentation 
La première fois, cliquez et dites "Hey Miku !" (ca doit sonner comme "et mikou").
Ensuite, décrivez votre requête et laissez l'IA vous répondre :)
Quand vous avez fini, dites "Au revoir Miku.".

Comprend une IA hors ligne, qui est un chatbot AIML conditionné pour se comporter comme Miku, basée sur A.L.I.C.E.

Fait parti d'un projet avec un hologramme inspiré de [cette vidéo](https://www.youtube.com/watch?v=P09TWAMLhE4).
L'idée de ce projet est de pouvoir construire pour très peu cher ma propre Alexa.

Il existe le mode pyramide: <br>
![image](https://github.com/user-attachments/assets/4b326331-a4c9-430d-a41b-711492828e6c)<br>
Le mode pyramide permet, à l'aide d'une pyramide de plexiglass, de pouvoir projeter le modèle sur 4 faces, ce qui permet d'avoir un rendu à 360 degrés de notre assistante.

# TODO
- Refactoriser le code en Typescript.
- Voir les traductions des phrases de réveil à la place de "Réveil...".
- Coder le moteur et l'API qui permettra d'intéragir avec de la domotique.
- ~~Optimiser le code via des standards et remplacer les textes en brut par des constantes~~
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

# Matériel pour le DIY
- Ecran: [Tablette 8 Pouces (avec Protecteur d'écran lumière Bleue)](https://www.amazon.fr/gp/product/B0C7VHG8PL/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&psc=1)
- Pyramide / Ecran de projection: [Lot de 5 feuilles en acrylique transparent (8,26x11,6 pouces, panneau en plastique, épaisseur de 1mm)](https://www.temu.com/fr/lot-de-5-feuilles-en-acrylique-transparent-8-26x11-6-pouces-panneau-en-plastique-pour-le-remplacement--de-cadre-photo-projets-d-exposition-artistique-%C3%A9paisseur-de-1-0-mm-film-anti-rayures-haute-clart%C3%A9-g-601099563734027.html?_oak_mp_inf=EIuo4q%2Bm1ogBGiAxM2JkMjgzZWNlYWQ0YWYwODE5MTdiZjVlMDg5NWQzOSDw7pC6mzI%3D&top_gallery_url=https%3A%2F%2Fimg.kwcdn.com%2Fproduct%2Ffancy%2F2d7c51bb-c95b-4f72-b698-6e74e4dcc528.jpg&spec_gallery_id=4119781572&refer_page_sn=10009&refer_source=0&freesia_scene=2&_oak_freesia_scene=2&_oak_rec_ext_1=Nzc1&_oak_gallery_order=1291141593%2C1421948185%2C36196099%2C207688512%2C1801095390&search_key=plaque%20acrylique%205%20feuilles&refer_page_el_sn=200049&refer_page_name=search_result&refer_page_id=10009_1725356561827_z8u8w4q9l4&_x_sessn_id=tudzg6f4yi)
- Boite a chaussure à découper / Pièces en bois
- Colle
- Marqueur
- Raspberry PI (facultatif, servirait à faire tourner le serveur NodeJS)

# License
MIT
