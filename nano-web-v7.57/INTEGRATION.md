# NanoAgent Three-System Integration Guide

This guide explains how to connect **Open WebUI**, **VS Code with GitHub Copilot**, and **NanoAgent Chrome Extension** into one unified autonomous workflow.

---

## Architecture Overview

```
┌─────────────────┐
│   Open WebUI    │  ← User types prompt here (Command Center)
│  (Docker Local) │
└────────┬────────┘
         │ Webhook (POST /webhook/open-webui)
         ↓
┌─────────────────────────┐
│  Webhook Middleware     │  ← Receives prompts, saves to file
│  (localhost:3001)       │
└────────┬────────────────┘
         │ File-based trigger (.pending-prompt)
         ↓
┌──────────────────────────────────┐
│  VS Code + GitHub Copilot Agent  │  ← Builds code, writes files
│  (Code Builder)                  │
└────────┬─────────────────────────┘
         │ HTTP API (POST /api/task)
         ↓
┌──────────────────────────────┐
│  NanoBridge Server           │  ← Routes tasks to extension
│  (localhost:3000)            │
└────────┬─────────────────────┘
         │ Polling (GET /api/task-poll)
         ↓
┌──────────────────────────────┐
│  NanoAgent Chrome Extension  │  ← Executes browser tasks
│  (Browser Executor)          │
└────────┬─────────────────────┘
         │ POST /api/task/complete
         ↓
┌──────────────────────────────┐
│  NanoBridge Server           │  ← Stores result
│  (localhost:3000)            │
└────────┬─────────────────────┘
         │ GET /api/task/result
         ↓
┌──────────────────────────────────┐
│  VS Code + GitHub Copilot Agent  │  ← Receives browser data
│  (Continues building)            │
└────────┬─────────────────────────┘
         │ Final output via webhook
         ↓
┌─────────────────┐
│   Open WebUI    │  ← Displays completion
└─────────────────┘
```

---

## Prerequisites

1. **Open WebUI** running locally via Docker
2. **VS Code** with GitHub Copilot (Agent Mode enabled)
3. **NanoAgent Chrome Extension** loaded and configured with LLM API key
4. **Node.js** v14+ installed

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd nano-web-v7.57
npm install
```

### Step 2: Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **"Load Unpacked"**
4. Select the `nano-extension-v7.57` folder
5. Pin NanoAgent to your toolbar
6. Configure your LLM API key in extension Options

### Step 3: Start Services

#### Option A: Using VS Code Tasks (Recommended)

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type **"Tasks: Run Task"**
4. Select **"Start All Services"**

This will start:
- NanoBridge Server (port 3000)
- Webhook Middleware (port 3001)
- Open WebUI Prompt Monitor

#### Option B: Manual Start

Terminal 1 - NanoBridge Server:
```bash
cd nano-web-v7.57
node server.js
```

Terminal 2 - Webhook Middleware:
```bash
cd nano-web-v7.57
node webhook-middleware.js
```

### Step 4: Configure Open WebUI Webhook

1. Open your Open WebUI instance (usually `http://localhost:3000` or your Docker port)
2. Go to **Admin Settings** → **Webhooks**
3. Add a new webhook:
   - **URL**: `http://localhost:3001/webhook/open-webui`
   - **Trigger**: On message completion (or as available)
   - **Method**: POST
   - **Content-Type**: application/json

### Step 5: Configure GitHub Copilot

The `.github/copilot-instructions.md` file is already created in this repository. GitHub Copilot Agent Mode will automatically read these instructions when working in this workspace.

To verify:
1. Open VS Code
2. Open Copilot Chat (`Ctrl+Shift+I` or `Cmd+Shift+I`)
3. Ask: "How do I use NanoAgent?"
4. Copilot should display the integration instructions

---

## API Reference

### NanoBridge Server (localhost:3000)

#### Submit Task
```http
POST /api/task
Content-Type: application/json

{
  "task": "Find the current price of Bitcoin on CoinMarketCap"
}
```

**Response:**
```json
{
  "success": true,
  "task_id": "1234567890",
  "status": "queued",
  "message": "Task sent to NanoAgent. Poll /api/task/result for completion."
}
```

#### Poll Task Result
```http
GET /api/task/result
```

**Response (Processing):**
```json
{
  "status": "processing",
  "message": "NanoAgent is executing the task..."
}
```

**Response (Complete):**
```json
{
  "status": "complete",
  "result": "Bitcoin is currently trading at $67,500 USD"
}
```

#### Task Completion (Internal - Used by Extension)
```http
POST /api/task/complete
Content-Type: application/json

{
  "result": "Extracted data here..."
}
```

#### Task Polling (Internal - Used by Extension)
```http
GET /api/task-poll
```

**Response:**
```json
{
  "task": "Find the current price of Bitcoin"
}
```
or
```json
{
  "task": null
}
```

---

### Webhook Middleware (localhost:3001)

#### Receive Open WebUI Prompt
```http
POST /webhook/open-webui
Content-Type: application/json

{
  "message": "Build a weather dashboard app",
  "chat_id": "abc123",
  "user": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "running",
  "service": "Open WebUI Webhook Middleware"
}
```

---

## Example Workflows

### Workflow 1: Simple Browser Query

**User in Open WebUI:** "What's the current price of Ethereum?"

**Flow:**
1. Open WebUI sends webhook to middleware
2. Middleware saves prompt to `.pending-prompt`
3. VS Code Copilot detects prompt
4. Copilot calls NanoAgent API:
   ```bash
   curl -X POST http://localhost:3000/api/task \
     -H "Content-Type: application/json" \
     -d '{"task": "Go to coinmarketcap.com and find the current price of Ethereum"}'
   ```
5. NanoAgent executes browser task
6. Result returned to Copilot
7. Copilot responds to user in Open WebUI

---

### Workflow 2: Build + Test Web App

**User in Open WebUI:** "Build a todo app and test it"

**Flow:**
1. Copilot builds the todo app code in VS Code
2. Copilot starts local server (e.g., `http://localhost:5173`)
3. Copilot uses NanoAgent to test:
   ```bash
   curl -X POST http://localhost:3000/api/task \
     -d '{"task": "Open http://localhost:5173, add a todo item called Test, and verify it appears in the list"}'
   ```
4. NanoAgent opens browser, interacts with app
5. Copilot receives test results
6. If tests pass, Copilot confirms completion
7. If tests fail, Copilot fixes code and retests

---

### Workflow 3: Multi-Step Research Task

**User in Open WebUI:** "Research the top 5 AI startups founded in 2024 and create a comparison table"

**Flow:**
1. Copilot breaks task into subtasks
2. For each startup:
   - Copilot uses NanoAgent to search and extract data
   - NanoAgent navigates to sources, extracts information
   - Results fed back to Copilot
3. Copilot compiles all data into structured format
4. Copilot saves to Google Sheets (using NanoAgent's built-in Sheets integration)
5. Final response sent to Open WebUI with sheet link

---

## Testing the Integration

### Test 1: Verify NanoBridge Server

```bash
curl http://localhost:3000/api/whatsapp-qr
```

Should return WhatsApp status (even if not connected).

### Test 2: Submit API Task

```bash
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Go to example.com and extract the heading"}'
```

### Test 3: Verify Extension Picks Up Task

1. Open NanoAgent sidepanel in Chrome
2. You should see: `[API TASK] Remote task received from VS Code!`
3. Watch it auto-execute the task

### Test 4: Retrieve Result

```bash
curl http://localhost:3000/api/task/result
```

Should return the extracted data once complete.

### Test 5: Full Workflow

1. Type a prompt in Open WebUI
2. Check VS Code terminal for prompt receipt
3. Watch Copilot work in the editor
4. Check NanoAgent sidepanel for browser automation
5. Verify final result appears in Open WebUI

---

## Troubleshooting

### NanoBridge Server Won't Start

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:** Another process is using port 3000. Find and kill it:
```bash
lsof -i :3000
kill -9 <PID>
```

### Extension Not Picking Up Tasks

**Check:**
1. Is NanoBridge server running? (`curl http://localhost:3000/health`)
2. Is the extension loaded in Chrome?
3. Check Chrome DevTools console for errors in the sidepanel

### Open WebUI Webhook Not Working

**Check:**
1. Is webhook middleware running? (`curl http://localhost:3001/health`)
2. Is the webhook URL correct in Open WebUI settings?
3. Check middleware terminal for incoming requests

### Copilot Not Using NanoAgent

**Check:**
1. Is `.github/copilot-instructions.md` present in your workspace?
2. Are you using Copilot **Agent Mode** (not just chat)?
3. Try asking Copilot directly: "How do I use NanoAgent to check a website?"

### Task Stuck in "Processing" State

**Possible causes:**
1. NanoAgent is still executing (complex tasks take time)
2. Extension crashed - check sidepanel for errors
3. LLM API rate limit - check your API provider dashboard

**Solution:** Restart the extension or check the sidepanel logs.

---

## Advanced Configuration

### Change Ports

Edit these files to change default ports:
- **NanoBridge Server**: `nano-web-v7.57/server.js` (line 15)
- **Webhook Middleware**: `nano-web-v7.57/webhook-middleware.js` (line 31)

### Add Authentication

For production use, add API key validation to endpoints:

```javascript
const API_KEY = process.env.NANOAGENT_API_KEY;

app.post('/api/task', (req, res) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // ... rest of handler
});
```

### Enable Logging

Add Winston or Morgan for structured logging:

```bash
npm install winston
```

---

## Future Enhancements

- [ ] WebSocket-based real-time communication (replace polling)
- [ ] MCP (Model Context Protocol) server for native Copilot tool integration
- [ ] Task queue with priority management
- [ ] Multi-agent orchestration (multiple NanoAgent instances)
- [ ] Open WebUI custom plugin for direct integration
- [ ] Authentication for API endpoints
- [ ] Task timeout and retry logic
- [ ] Browser session management (cookies, auth states)

---

## Support

For issues or questions:
- Check the main README.md
- Review the NanoAgent architecture in the project wiki
- Open an issue on GitHub

---

## License

This integration follows the same license as the main NanoAgent project (Attribution-NonCommercial).
