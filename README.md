# 🤖 AI Chat Assistant

A simple, clean web app that lets users chat with AI using their own [OpenRouter](https://openrouter.ai) API key.

## Features
- 🔑 Users provide their own OpenRouter API key (stored only in the browser)
- 🧠 Multiple model choices: GPT-4o, Claude 3.5, Gemini Flash, Llama, Mistral & more
- 💬 Full conversation history per session
- 🌙 Clean dark UI
- 📱 Mobile responsive

## How to use
1. Open `index.html` in any browser (or host it on GitHub Pages, Netlify, Vercel, etc.)
2. Enter your [OpenRouter API key](https://openrouter.ai/keys)
3. Pick a model and start chatting!

## Files
- `index.html` — the main HTML structure
- `style.css` — dark-themed styles
- `app.js` — all the logic (API calls, chat UI, localStorage)

## Privacy
Your API key is stored in `localStorage` in your browser only. It is never sent to any server other than OpenRouter.

## Live demo (GitHub Pages)
Enable GitHub Pages on this repo (Settings → Pages → Deploy from branch: main) to get a free live URL.

