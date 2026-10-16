# My AI

A Next.js chat app powered by an Ollama server. Conversations are saved in the browser that created them.

## Getting Started

In PowerShell, first change to the app folder (npm commands must run where this project's `package.json` is):

```powershell
cd C:\Users\emili\Desktop\prog\my-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). By default, the chat API connects to Ollama at `http://127.0.0.1:11434`. Set `OLLAMA_HOST` in `.env.local` to use a different server.

## Public deployment

The website needs a reachable Ollama server to answer chats. Ollama running on your PC is not reachable by a hosted website unless you set up a secure connection.

Recommended for a home server: run this Next.js app on the same machine as Ollama, keep Ollama bound to `127.0.0.1`, then expose only the website through a secure HTTPS tunnel. Set `OLLAMA_HOST=http://127.0.0.1:11434` on the app server.

For a temporary public test, open a terminal in the app folder, install `cloudflared`, build and start the app, then run the tunnel in a second terminal:

```bash
npm ci
npm run build
npm start -- --hostname 127.0.0.1
```

```bash
cloudflared tunnel --url http://127.0.0.1:3000
```

The tunnel prints a temporary public URL; the PC, Ollama, and both running processes must stay online. For a stable URL, configure a named tunnel and domain. Install the model selected in the app (default: `qwen3`) on the Ollama server.

Alternatively, deploy the app to a host such as Vercel and connect it to Ollama through an HTTPS endpoint protected by Cloudflare Access. Add these server-side environment variables to the hosting provider:

- `OLLAMA_HOST`: your protected Ollama HTTPS URL.
- `OLLAMA_CLOUD_ACCESS_CLIENT_ID` and `OLLAMA_CLOUD_ACCESS_CLIENT_SECRET`: the Cloudflare Access service token. Both must be set together.

Do not expose Ollama's port directly to the internet or commit service tokens. The public chat endpoint uses your server's compute, so protect it against abuse with hosting-provider rate limits.

## Publish to GitHub

After installing and signing in to [GitHub CLI](https://cli.github.com/), run these commands from the project folder to create and push a **public** repository:

```bash
gh auth login
gh repo create my-ai --public --source=. --remote=origin --push
```
