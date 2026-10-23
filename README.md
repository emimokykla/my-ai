# My AI

A local AI chat app powered by Ollama. Chat history is saved in your browser.

## Try it on your computer

This app runs on your computer and uses [Ollama](https://ollama.com/) to generate replies. GitHub shows the source code; it does not run the app for you. To try it, install:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (LTS)
- [Ollama](https://ollama.com/)

### First-time setup in PowerShell

Run these commands from your user folder. Do not clone or install the app from `C:\Windows\System32`.

```powershell
Set-Location $HOME
git clone https://github.com/emimokykla/my-ai.git
Set-Location .\my-ai
npm install
ollama pull gemma3:4b
npm run dev
```

### If you already cloned the project

Do not run `git clone` again. In PowerShell, change to the folder containing your existing clone, then pull the latest changes before starting it. Replace the example path with the location of your `my-ai` folder:

```powershell
Set-Location "C:\path\to\my-ai"
git pull
npm install
ollama pull gemma3:4b
npm run dev
```

If `git clone` says the `my-ai` folder already exists, use these update steps instead. Make sure the terminal is in the project folder (the one containing `package.json`) before running `npm install` or `npm run dev`.

Open [http://127.0.0.1:3010](http://127.0.0.1:3010) in your browser. Use this exact address so you open this app rather than another local server. Keep the terminal running while you use the app, and make sure Ollama is running too. If Ollama is not already running as a background service on your system, open a second terminal and run `ollama serve`.

The app connects to Ollama on the same computer, so each person who wants to use it needs to run the app and Ollama locally. It is not a hosted chat page that can be opened directly from GitHub.

For my teacher:

Kompetansemål:

1. Velge og bruke relevante rammeverk og moduler til utvikling
Jeg har brukt Next.js, TypeScript og Tailwind CSS til å lage nettsiden, og Ollama for å koble til AI-modellen.

2. Utforske konseptene maskinlæring og kunstig intelligens
Jeg har brukt AI-modellen Gemma 3 gjennom Ollama og lært hvordan jeg kan koble en språkmodell til en nettside.

3. Utvikle og tilpasse brukergrensesnitt som ivaretar krav til universell utforming
Jeg har laget et enkelt og oversiktlig grensesnitt med tekstfelt, knapper og innstillinger. Jeg har fokusert på at det skal være enkelt å bruke.

4. Utforske prosesser knyttet til testing og feilsøking i utvikling av løsninger
Jeg har testet nettsiden lokalt og brukt terminalen i VS Code til å starte den. Jeg har feilsøkt når noe ikke har fungert, og kontrollert at nettsiden kommuniserer med AI-modellen.
