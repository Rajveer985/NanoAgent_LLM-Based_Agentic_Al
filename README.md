<p align="center">
  <img src="assets/logo.png" width="180" alt="NanoAgent Logo">
</p>

<h1 align="center"> NanoAgent — Autonomous AI Workflow Platform</h1>

<p align="center">
  <em>An open-source, three-system integration that connects browser automation, code generation, and AI command orchestration into one autonomous pipeline.</em>
</p>

<p align="center">
  <a href="https://nanoagent.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-nanoagent.vercel.app-00C7B7?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Release-v7.57-brightgreen?style=flat-square" alt="Release">
  <img src="https://img.shields.io/badge/License-Custom%20(Non--Commercial)-yellow?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Platform-Chrome%20%7C%20VS_Code%20%7C%20Open_WebUI-red?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/LLM-Any_Provider-purple?style=flat-square" alt="LLM">
</p>

<p align="center">
  <a href="https://nanoagent.vercel.app/"><strong><img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/language/default/20px.svg" width="14"> Website</strong></a> · 
  <a href="#-the-three-system-pipeline">Pipeline</a> · 
  <a href="#-core-features">Features</a> · 
  <a href="#-system-architecture">Architecture</a> · 
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-nanobridge-server">NanoBridge</a> ·
  <a href="#-vs-code-copilot-bridge">Copilot Bridge</a> ·
  <a href="#-whatsapp-remote-control">WhatsApp</a> ·
  <a href="#-api-reference">API</a> ·
  <a href="#-contributing">Contributing</a>
</p>

---

## What is NanoAgent?

NanoAgent is not just a browser automation tool — it is a **complete autonomous AI workflow platform** that connects three independent systems into a seamless pipeline:

<table>
<tr>
<td width="33%" align="center">
<img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/language/default/48px.svg" width="40"><br>
<strong>Open WebUI / Demo UI</strong><br>
<sub>Command Center</sub>
</td>
<td width="33%" align="center">
<img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/code/default/48px.svg" width="40"><br>
<strong>VS Code + GitHub Copilot</strong><br>
<sub>Code Builder</sub>
</td>
<td width="33%" align="center">
<img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/extension/default/48px.svg" width="40"><br>
<strong>NanoAgent Chrome Extension</strong><br>
<sub>Browser Executor</sub>
</td>
</tr>
</table>

Give it a high-level goal like *"Build a weather app and test it in the browser"* — and the full pipeline orchestrates code generation, browser automation, data extraction, and result delivery **without human intervention**.

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/account_tree/default/20px.svg" width="20"> The Three-System Pipeline

```
User types goal in Open WebUI / Demo UI
       │
       │  POST /webhook/open-webui
       ▼
┌─────────────────────────────┐
│  Webhook Middleware (:3001)  │  Saves prompt to .pending-prompt file
└──────────────┬──────────────┘
               │  File system event
               ▼
┌──────────────────────────────────┐
│  VS Code + Copilot Agent Mode    │  Reads prompt, generates code,
│  + NanoAgent Copilot Bridge      │  submits browser tasks via API
└──────────────┬───────────────────┘
               │  POST /api/task
               ▼
┌─────────────────────────────┐
│  NanoBridge Server (:3000)   │  Queues tasks, manages polling
└──────────────┬──────────────┘
               │  GET /api/task-poll (every 3s)
               ▼
┌──────────────────────────────────┐
│  NanoAgent Chrome Extension      │  Picks up task, auto-executes
│  (Dual-Brain LLM Architecture)   │  Drives Chrome autonomously
└──────────────┬───────────────────┘
               │  POST /api/task/complete
               ▼
       Results flow back through the pipeline
```

**Each system works independently, but together they enable fully autonomous software development and web automation workflows.**

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/play_circle/default/20px.svg" width="20"> See It In Action

https://github.com/user-attachments/assets/ff0c2171-3298-43f8-8c1e-8633286a4755.mp4

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/auto_awesome/default/20px.svg" width="20"> Core Features

| Feature | Description |
|---------|-------------|
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/psychology/default/20px.svg" width="16"> **Dual-Brain LLM Architecture** | Planner model for high-level strategy + Navigator model for step-by-step DOM execution. Two LLMs working in tandem for superior task completion. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/account_tree/default/20px.svg" width="16"> **Three-System Integration** | Full autonomous pipeline: Open WebUI / Demo UI → VS Code Copilot → NanoAgent Chrome Extension. End-to-end task execution without human intervention. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/visibility/default/20px.svg" width="16"> **DOM Vision Engine** | Real-time scanning and indexing of interactive page elements with noise filtering, priority scoring, deduplication, and banned element memory. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/code/default/20px.svg" width="16"> **VS Code Copilot Bridge** | Custom VS Code extension that watches for `.pending-prompt` files and auto-forwards prompts to GitHub Copilot Agent Mode for code generation. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/dns/default/20px.svg" width="16"> **NanoBridge API Server** | Express.js server with task submission, polling, result retrieval, and WhatsApp integration endpoints. Central hub for all inter-system communication. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/webhook/default/20px.svg" width="16"> **Webhook Middleware** | Receives prompts from Open WebUI via webhook and bridges them to VS Code through file-based communication on port 3001. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/tab/default/20px.svg" width="16"> **Multi-Tab Orchestration** | Opens background tabs, switches between active tabs, and manages concurrent browsing contexts without losing agent state. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/smartphone/default/20px.svg" width="16"> **WhatsApp Remote Control** | Send commands from your phone via WhatsApp, receive results back. Full remote control through the NanoBridge companion server. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/table_chart/default/20px.svg" width="16"> **Google Sheets Auto-Export** | Planning/research tasks automatically open Google Sheets and inject extracted data via clipboard simulation with ghost mouse cursor. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/extension/default/20px.svg" width="16"> **Universal LLM Support** | Works with Gemini, OpenAI, OpenRouter, DeepSeek, Groq, Ollama, LM Studio, and any OpenAI-compatible provider. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/autorenew/default/20px.svg" width="16"> **Self-Healing Execution** | Auto-retry on API errors, loop trap detection, banned element filtering, 404 page detection, modal/popup auto-dismissal, and JSON hallucination correction. |
| <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/shield/default/20px.svg" width="16"> **Privacy-First** | All processing happens locally. No data collection, no analytics, no telemetry. API keys stored in Chrome's local storage. |

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/settings/default/20px.svg" width="20"> System Architecture

NanoAgent's **Dual-Brain Architecture** uses two separate LLM instances working in tandem:

```
┌─────────────────────────────────────────────┐
│                 USER PROMPT                  │
│          "Find the price of gold"            │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │    PLANNER LLM   │ ← Decides WHAT to do
         │  (Task Reasoning)  │    "I need to Google this"
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │   NAVIGATOR LLM  │ ← Decides HOW to do it
         │   (DOM Actions)    │    "Click element [3], type query"
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │   CHROME BROWSER  │ ← Executes the action
         │  (Content Script)  │    Clicks, types, navigates
         └─────────┬──────────┘
                   │
              ┌────▼────┐
              │ RESULTS  │ → Sidepanel / WhatsApp / API / Sheets
              └──────────┘
```

### Smart Task Classification

The agent automatically classifies every task and routes results accordingly:

| Task Type | Example | Result Destination |
|-----------|---------|-------------------|
| **Navigation** | *"Go to GitHub"* | Visual confirmation |
| **Extraction** | *"Find the price of Bitcoin"* | WhatsApp + Sidepanel |
| **Planning/Research** | *"Plan a vacation to Pune"* | Auto-export to Google Sheets |
| **Action** | *"Fill out this form"* | Execution confirmation |
| **Transfer** | *"Extract data and paste into Sheets"* | Google Sheets injection |

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/rocket_launch/default/20px.svg" width="20"> Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Rajveer-sahay985/NanoAgent_LLM-Based_Agentic_Al.git
cd NanoAgent_LLM-Based_Agentic_Al
```

### 2. Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **"Load Unpacked"** → select the `nano-extension-v7.57` folder
4. Pin NanoAgent to your toolbar

### 3. Configure Your LLM

1. Right-click the NanoAgent icon → **Options**
2. Choose your API provider (Gemini, OpenAI, OpenRouter, etc.)
3. Paste your API key
4. Click **"Load Available Models"** to auto-discover models
5. Select a **Planner** model and a **Navigator** model
6. Click **"Save Brain Configuration"**

### 4. Start NanoBridge Server

```bash
cd nano-web-v7.57
npm install
node server.js
```

### 5. (Optional) Start Webhook Middleware

```bash
# In a separate terminal
cd nano-web-v7.57
node webhook-middleware.js
```

### 6. Start Using NanoAgent

1. Click the NanoAgent icon to open the **sidepanel**
2. Type your task in plain English:
   - *"Find the current price of Bitcoin"*
   - *"Go to Amazon and find the cheapest MacBook Air"*
   - *"Plan a 3-day vacation to Pune with hotels and flights"*
3. Click **Start** and watch the AI work!

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/screenshot_monitor/default/20px.svg" width="20"> Screenshots

<p align="center">
  <img src="assets/screenshot-sidepanel.png" width="300" alt="NanoAgent Sidepanel">
  &nbsp;&nbsp;&nbsp;
  <img src="assets/screenshot-settings.png" width="450" alt="Settings Page">
</p>

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/hub/default/20px.svg" width="20"> NanoBridge Server

The NanoBridge server (`nano-web-v7.57/server.js`) is the central communication hub running on `localhost:3000`. It handles:

- **WhatsApp Remote Control** — QR auth, message polling, result delivery
- **API Task Queue** — Accepts tasks from VS Code Copilot, queues them for the extension
- **Result Pipeline** — Collects results from the extension, serves them to API callers
- **Electron Desktop App** — Pre-built macOS app with a native UI wrapper

```bash
cd nano-web-v7.57
npm install
node server.js        # Express server on port 3000
```

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/code/default/20px.svg" width="20"> VS Code Copilot Bridge

The Copilot Bridge (`nano-copilot-bridge/`) is a custom VS Code extension that connects the Demo UI to GitHub Copilot Agent Mode:

- **File Watcher** — Monitors workspace for `.pending-prompt` files
- **Auto-Forward** — Sends prompts directly to Copilot Chat
- **Status Bar** — Toggle ON/OFF from the VS Code status bar
- **Pre-built VSIX** — Install directly from `nano-copilot-bridge-1.0.0.vsix`

Additionally, `.github/copilot-instructions.md` teaches Copilot how to use the NanoAgent API for browser verification during code generation.

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/smartphone/default/20px.svg" width="20"> WhatsApp Remote Control

Send commands from your phone and receive results — all through WhatsApp:

1. Start the NanoBridge server (`node server.js`)
2. Scan the QR code from the extension's **Options** page
3. Send a message starting with `/nanoagent` from WhatsApp:

```
/nanoagent what is the current price of ethereum
```

4. NanoAgent auto-executes the task in Chrome and sends results back via WhatsApp.

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/terminal/default/20px.svg" width="20"> API Reference

### NanoBridge Server (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/task` | POST | Submit a browser task `{ "task": "..." }` |
| `/api/task/result` | GET | Poll for task result (`idle` / `processing` / `complete`) |
| `/api/task-poll` | GET | Extension polls this to receive queued tasks |
| `/api/task/complete` | POST | Extension sends results back `{ "result": "..." }` |
| `/api/whatsapp-qr` | GET | WhatsApp connection status and QR code |
| `/api/whatsapp-poll` | GET | Extension polls for WhatsApp remote tasks |
| `/api/whatsapp-send` | POST | Send results back to WhatsApp |
| `/api/whatsapp-target-manual` | POST | Set WhatsApp target number |
| `/api/auth-status` | GET | Auth check (auto-unlocked) |

### Webhook Middleware (Port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/open-webui` | POST | Receive prompts from Open WebUI |
| `/health` | GET | Health check |
| `/` | GET | Serves the Demo UI (Command Center) |

### Example: Submit a Task via CLI

```bash
# Submit a task
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Go to example.com and extract the heading"}'

# Poll for result
curl http://localhost:3000/api/task/result
```

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/dns/default/20px.svg" width="20"> Supported Providers

NanoAgent works with **any OpenAI-compatible API endpoint**, plus native Gemini support:

| Provider | Type | Cost |
|----------|------|------|
| **Google Gemini** | Native | Free tier available |
| **OpenRouter** | OpenAI-compatible | Free models available |
| **OpenAI / ChatGPT** | OpenAI-compatible | Paid |
| **DeepSeek** | OpenAI-compatible | Very cheap |
| **Groq** | OpenAI-compatible | Free tier available |
| **Ollama** (local) | OpenAI-compatible | Free (runs on your machine) |
| **LM Studio** (local) | OpenAI-compatible | Free (runs on your machine) |

### Recommended Free Setup

Use **OpenRouter** with free models for zero-cost usage:
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get a free API key
3. Set Base URL to: `https://openrouter.ai/api/v1/chat/completions`
4. Select free models like `google/gemma-3-12b-it:free`

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/folder_open/default/20px.svg" width="20"> Project Structure

```
NanoAgent/
├── nano-extension-v7.57/          # Chrome Extension (Manifest V3)
│   ├── manifest.json              # Extension manifest
│   ├── background.js              # Service worker
│   ├── sidepanel.html/js          # Agent UI + dual-brain execution engine
│   ├── options.html/js            # Settings: LLM config + WhatsApp setup
│   └── icons/                     # Extension icons
│
├── nano-web-v7.57/                # NanoBridge — Companion Server
│   ├── server.js                  # Express server (port 3000) — API + WhatsApp
│   ├── webhook-middleware.js       # Open WebUI webhook receiver (port 3001)
│   ├── demo-ui.html               # Command Center web UI
│   ├── main.js                    # Electron wrapper for desktop app
│   ├── index.html                 # Desktop app UI
│   ├── INTEGRATION.md             # Full integration documentation
│   └── package.json               # Dependencies & build config
│
├── nano-copilot-bridge/           # VS Code Extension — Copilot Bridge
│   ├── extension.js               # File watcher + Copilot Chat integration
│   ├── package.json               # Extension manifest
│   └── nano-copilot-bridge-1.0.0.vsix  # Pre-built installable
│
├── .github/
│   └── copilot-instructions.md    # Teaches Copilot how to use NanoAgent API
│
├── index.html                     # Project website (deployed on Vercel)
├── MASTER_PLAN_Three-System_Integration.md  # Full implementation reference
├── SCOPES_AND_LIMITATIONS.md      # Scopes, limitations & future roadmap
├── assets/                        # Screenshots, logo, demo video
├── LICENSE                        # Custom License (Attribution-NonCommercial)
└── README.md                      # You are here
```

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/build/default/20px.svg" width="20"> Tech Stack

| Technology | Role |
|-----------|------|
| **Chrome Extension (MV3)** | Browser automation agent |
| **Node.js + Express.js** | NanoBridge API server |
| **WhatsApp Web.js** | Remote control via WhatsApp |
| **Electron** | Desktop app wrapper for NanoBridge |
| **VS Code Extension API** | Copilot Bridge file watcher |
| **GitHub Copilot Agent Mode** | AI code generation |
| **Open WebUI** | Local Docker LLM command center |
| **OpenAI-compatible LLM APIs** | Gemini, OpenRouter, DeepSeek, Groq, Ollama, etc. |

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/lock/default/20px.svg" width="20"> Privacy & Security

- **No data collection.** NanoAgent does not send any data to any server other than your chosen LLM API.
- **API keys are stored locally** in Chrome's `chrome.storage.sync` — they never leave your browser.
- **Local-only communication.** All inter-system communication happens on localhost (ports 3000/3001).
- **No analytics, no tracking, no telemetry.**
- **Open source.** Every line of code is auditable right here.

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/group/default/20px.svg" width="20"> Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/gavel/default/20px.svg" width="20"> License

This project is licensed under a **Custom License (Attribution-NonCommercial)** — see the [LICENSE](LICENSE) file for details. You may use, modify, and distribute this software with proper attribution, but commercial use and resale are strictly prohibited.

---

## <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/person/default/20px.svg" width="20"> Author

**Rajveer Sahay**  
Built with <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/coffee/default/20px.svg" width="14"> and curiosity.

---

<p align="center">
  <sub>If NanoAgent helped you, consider giving it a <img src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/star/default/20px.svg" width="12"> on GitHub!</sub>
</p>
