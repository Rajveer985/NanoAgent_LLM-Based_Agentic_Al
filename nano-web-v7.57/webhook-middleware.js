const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
// Root redirect to demo UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'demo-ui.html'));
});

app.use(express.static(__dirname));

// Webhook endpoint — Open WebUI sends prompts here
app.post('/webhook/open-webui', async (req, res) => {
    const { message, chat_id, user } = req.body;
    
    console.log(`🌐 Open WebUI prompt received: ${message}`);
    
    // Save to a file that VS Code monitors
    const promptFile = path.join(__dirname, '.pending-prompt');
    fs.writeFileSync(promptFile, JSON.stringify({
        prompt: message,
        chat_id,
        user,
        timestamp: Date.now()
    }));
    
    res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'running', service: 'Open WebUI Webhook Middleware' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🌐 Open WebUI Webhook Middleware running on http://localhost:${PORT}`);
    console.log(`📝 Webhook endpoint: http://localhost:${PORT}/webhook/open-webui`);
});
