# NEW!
A hosted version is available at https://fox3000foxy.com/hologram-smart-miku/

# Overview

![image](https://github.com/user-attachments/assets/79a2b1b9-de90-4a4b-8ba3-572dbcc30823)
_Hatsune Miku Hologram Version that acts like Alexa_

This project is a personal DIY effort I started after a bad purchase experience in Japan.  
The item I bought was a GateBox Digital Figure Box that should have cost 5500 yen (~€30), but I ended up paying €83.  
I thought this little box could do the job of the original version priced at €27,000, but instead I got a cardboard box that required a smartphone as a screen (another €50 :D).  
It will replace [this object](https://www.youtube.com/watch?v=nkcKaNqfykg) which costs too much for me and can do the same things technically.  
The only difference is that the waifu won't be active all the time.  For more information, see the **Documentation** section.

The hardware construction part can be found on the Internet and YouTube, whether a simple hologram box or a pyramid box.  
You can follow video tutorials I recommend to build the holographic projector you want.  
Adjust the constructions to the size of your screen— I recommend an 8‑inch tablet (available under **Hardware for the DIY**).

The software portion is what I coded and is located in this repository.  
It supports both box designs and also works offline.  
Via several APIs it can give you the weather, inform you of the latest news, or even control connected devices using simple voice commands.  
You can query the waifu like you would Alexa.

It is designed to answer completely online, plus a handful of offline questions (AIML chatbot based on A.L.I.C.E. tuned to behave like Miku) and commands ("turn on the light", "turn off the light", "give me the weather", "give me the temperature") when running without internet.  (The list of available questions will be published soon.)

# Documentation

> Make sure you access the site over HTTPS. Otherwise, your microphone won't work!

The first time, click on your screen and say “Hey Miku!” (it should sound like "et micou"; you can also say "nico").  
Then describe your request and let the AI answer you.  :)  
The assistant will listen as long as you interact with it.  
When you're finished, say "Goodbye Miku." You can wake her later.

As mentioned earlier, she includes an offline AI, which is an AIML chatbot conditioned to behave as Miku, based on A.L.I.C.E.

The hologram effect is part of the project, inspired by [this video](https://www.youtube.com/watch?v=P09TWAMLhE4).  
The idea of this project is to build my own cheap Alexa, in the form of Miku, with a presence—a “body.”

You can import a custom model for your assistant by changing the source of the model loaded in `public/main.js`.

Pyramid mode is also available (video):  
[![image](https://github.com/user-attachments/assets/eb9f40ec-8f40-41c7-bec0-538b9ace6788)](https://www.youtube.com/shorts/kM1B0eezats)  
It uses a plexiglass pyramid to project the model onto four faces, giving a 360‑degree equilateral view of your assistant.  
You can set the variable `PYRAMID_MODE` to `TRUE` in `public/main.js` to switch to pyramid mode.  
**WARNING:** Pyramid mode replaces subtitles with a French dub! (It doesn't change the assistant's voice but lowers it significantly.)

# Hosting

You can use Termux on your device (for me that's an 8‑inch tablet) or host the web server on a Raspberry Pi.  
You'll need to configure it as a relay so it can receive AI responses and allow offline access to the assistant.  
The screen device should connect to it via Wi‑Fi.

# Credits

- The project [datenhahn/python-aiml-chatbot](https://github.com/datenhahn/python-aiml-chatbot/) for AIML data.
- The project [gleuch/aiml-high](https://github.com/gleuch/aiml-high) for the AIML interpreter in Node.js.
- The [herc.ai](https://github.com/) API project for the AIML interpreter.
- `ad` for the [3D model of Miku](https://hub.vroid.com/en/characters/6393831588053029732/models/292088747503985726).
- The project [pixiv/three-vrm](https://github.com/pixiv/three-vrm), which lets you use and swap the VRM model used for the hologram.

# Hardware for the DIY

- Screen: [8‑inch Tablet (with Blue Light Screen Protector)](https://www.amazon.fr/gp/product/B0C7VHG8PL/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&psc=1)
- Projection pyramid: [3D Hologram Projector Pyramid](https://www.amazon.fr/dp/B0CRL9QKLY?ref=ppx_yo2ov_dt_b_fed_asin_title&th=1)

# IoT Interactions

*(WIP)* Since the hardware hasn't been chosen yet, I can't currently provide compatible smart‑home devices or interactions via the assistant.  
However, I'll code the framework and API to list connected devices and let the assistant evaluate calls that change hardware state.  
I'll return to this repository to specify the equipment I use; if you use different hardware, you'll need to write your own API to override mine.

# DIY Tutorial

[![image](https://github.com/user-attachments/assets/66352146-181b-49d9-83d7-3cb7192aaf2f)](https://youtu.be/iiJn9H-8H1M)  
This video shows you how to build the hologram box.

# Development

This project uses **pnpm** for package management. Common commands:

```bash
pnpm install          # install dependencies
pnpm run build        # compile TypeScript to dist/
pnpm run start        # start server + vv-engine
```

You can also run the compiled app directly with `pnpm run start:ts`.

# TODO

- ~Refactor the code into TypeScript (now done).~
- *Implement the engine and API for interacting with home automation.*

# License

MIT, see LICENSE for details.