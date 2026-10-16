# My AI

A local AI chat app powered by Ollama. Chat history is saved in your browser.

## Run locally

Install [Ollama](https://ollama.com/) and a model, then in PowerShell:

```powershell
ollama pull qwen3
cd C:\Users\emili\Desktop\prog\my-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep Ollama running while chatting. The app connects only to Ollama on this computer and listens only on localhost.

The source code is public on [GitHub](https://github.com/emimokykla/my-ai). GitHub hosts the code, not the running app.
