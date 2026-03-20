const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000, () => console.log('🚀 NanoAgent Link Server running on http://localhost:3000'));

// 📱 WhatsApp Bot
let whatsappGroups = [];
let pendingRemoteTask = null;
let WHATSAPP_TARGET = '';
let waQR = null;
let waConnected = false;

const os = require('os');
const bridgeDataDir = path.join(os.homedir(), '.nanobridge_data');

console.log('📱 Initializing WhatsApp Client...');
const waClient = new Client({
    authStrategy: new LocalAuth({
        clientId: 'nanoagent-client',
        dataPath: bridgeDataDir
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});

waClient.on('qr', async (qr) => {
    waQR = await qrcode.toDataURL(qr);
    console.log('📱 QR CODE RECEIVED - Ready for scan!');
});

waClient.on('authenticated', () => console.log('🔐 WhatsApp Authenticated! Session saved.'));
waClient.on('auth_failure', () => console.error('❌ WhatsApp auth failed.'));

waClient.on('ready', async () => {
    waConnected = true;
    waQR = null;
    console.log('✅ WhatsApp Client Ready!');
    console.log('📱 Loading WhatsApp groups...');
    const chats = await waClient.getChats();
    whatsappGroups = chats.filter(c => c.isGroup).map(g => ({ id: g.id._serialized, name: g.name }));
    console.log(`📱 Found ${whatsappGroups.length} groups.`);
    console.log(`📱 WhatsApp target set (manual): ${WHATSAPP_TARGET}`);

    // Pre-load groups
    console.log('📱 Pre-loading WhatsApp groups (background)...');
    console.log(`📱 ✅ Pre-loaded ${whatsappGroups.length} groups!`);
});

// 📱 Listen for /nanoagent commands from WhatsApp
waClient.on('message_create', async msg => {
    if (!msg.fromMe) return;
    const body = (msg.body || '').trim();
    if (!body.toLowerCase().startsWith('/nanoagent ')) return;

    const task = body.substring('/nanoagent '.length).trim();
    if (!task) return;

    const chatId = msg.to || msg.from;
    console.log(`📱 WhatsApp Remote Task: ${task} [from: ${msg.from}, to: ${chatId}]`);

    pendingRemoteTask = task;

    try {
        await waClient.sendMessage(chatId, `🤖 *NanoAgent* received your task:\n\n_"${task}"_\n\n⏳ Processing...`);
    } catch (e) {
        console.log('📱 WhatsApp reply failed:', e.message);
    }
});

waClient.initialize();

// ======== ROUTES ========

// Extension Auth Check (Depreciated, auto-unlocks now)
app.get('/api/auth-status', (req, res) => {
    res.json({ authenticated: true, user: "admin@nanoagent" });
});

// 📱 WhatsApp Status & Target APIs
app.get('/api/whatsapp-qr', (req, res) => {
    res.json({ connected: waConnected, qr: waQR, target: WHATSAPP_TARGET, groups: whatsappGroups });
});

app.post('/api/whatsapp-target-manual', (req, res) => {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: 'No target provided.' });
    WHATSAPP_TARGET = target;
    console.log(`📱 WhatsApp Manual Target updated to: ${WHATSAPP_TARGET}`);
    res.json({ success: true, target: WHATSAPP_TARGET });
});

// 📱 WhatsApp Remote Task Polling (extension polls this)
app.get('/api/whatsapp-poll', (req, res) => {
    if (pendingRemoteTask) {
        const task = pendingRemoteTask;
        pendingRemoteTask = null;
        console.log(`📱 Extension picked up remote task: ${task}`);
        res.json({ task });
    } else {
        res.json({ task: null });
    }
});

// 📱 WhatsApp Send (extension sends results back)
app.post('/api/whatsapp-send', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.json({ error: 'No message provided.' });

    try {
        const targetId = WHATSAPP_TARGET.replace('+', '') + '@c.us';
        await waClient.sendMessage(targetId, message);
        console.log(`📱 WhatsApp message sent to ${WHATSAPP_TARGET}`);
        res.json({ sent: true });
    } catch (err) {
        console.log('📱 WhatsApp send error:', err.message);
        res.json({ error: err.message });
    }
});


