const status = document.getElementById("status");
const tempRange = document.getElementById("tempRange");
const tempInput = document.getElementById("tempInput");
const apiProvider = document.getElementById("apiProvider");
const baseUrlContainer = document.getElementById("baseUrlContainer");

tempRange.addEventListener("input", (e) => tempInput.value = e.target.value);

apiProvider.addEventListener("change", (e) => {
    if (e.target.value === "openai") baseUrlContainer.style.display = "block";
    else baseUrlContainer.style.display = "none";
});

// 🔥 V7.57: LOAD MODELS — populates BOTH Planner & Navigator dropdowns
document.getElementById('fetchModels').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const provider = document.getElementById('apiProvider').value;
    const baseUrl = document.getElementById('baseUrl').value;
    const plannerSelect = document.getElementById('plannerModel');
    const navigatorSelect = document.getElementById('navigatorModel');
    const modelStatus = document.getElementById('modelStatus');
    const fetchBtn = document.getElementById('fetchModels');

    if (!apiKey) {
        modelStatus.style.color = '#f87171';
        modelStatus.textContent = '⚠️ Enter an API key first.';
        return;
    }

    // Save current selections to restore after fetch
    const currentPlanner = plannerSelect.value;
    const currentNavigator = navigatorSelect.value;

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Loading...';
    modelStatus.style.color = '#94a3b8';
    modelStatus.textContent = '⏳ Fetching available models...';

    try {
        let models = [];

        if (provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!response.ok) {
                if (response.status === 400 || response.status === 403) throw new Error('Invalid API Key.');
                throw new Error(`HTTP ${response.status}: Could not reach Gemini API.`);
            }
            const data = await response.json();
            models = (data.models || [])
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => ({
                    id: m.name.replace('models/', ''),
                    name: m.displayName || m.name.replace('models/', '')
                }));
        } else {
            let endpoint = baseUrl || 'https://api.openai.com/v1/chat/completions';
            endpoint = endpoint.replace('/chat/completions', '/models');
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!response.ok) {
                if (response.status === 401) throw new Error('Invalid API Key.');
                throw new Error(`HTTP ${response.status}: Could not reach models endpoint.`);
            }
            const data = await response.json();
            models = (data.data || []).map(m => ({ id: m.id, name: m.name || m.id }));
        }

        models.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

        // Populate BOTH dropdowns with the same model list
        [plannerSelect, navigatorSelect].forEach((select, idx) => {
            const currentVal = idx === 0 ? currentPlanner : currentNavigator;
            select.innerHTML = '';

            if (models.length === 0) {
                select.innerHTML = '<option value="">No models found</option>';
            } else {
                models.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = m.id === m.name ? m.id : `${m.name} (${m.id})`;
                    if (currentVal === m.id) opt.selected = true;
                    select.appendChild(opt);
                });
            }
        });

        if (models.length > 0) {
            modelStatus.style.color = '#4ade80';
            modelStatus.textContent = `✅ Loaded ${models.length} models. Select one for each role.`;
        } else {
            modelStatus.style.color = '#f87171';
            modelStatus.textContent = '⚠️ No models returned by the API.';
        }
    } catch (err) {
        [plannerSelect, navigatorSelect].forEach(s => {
            s.innerHTML = '<option value="">Failed to load</option>';
        });
        modelStatus.style.color = '#f87171';
        modelStatus.textContent = `❌ ${err.message}`;
    }

    fetchBtn.disabled = false;
    fetchBtn.textContent = '⚡ Load Available Models';
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['apiKey', 'plannerModel', 'navigatorModel', 'temperature', 'apiProvider', 'baseUrl'], (items) => {
        if (items.apiKey) document.getElementById('apiKey').value = items.apiKey;

        // Restore Planner model
        if (items.plannerModel) {
            const plannerSelect = document.getElementById('plannerModel');
            plannerSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = items.plannerModel;
            opt.textContent = '🧠 ' + items.plannerModel + ' (saved)';
            opt.selected = true;
            plannerSelect.appendChild(opt);
        }

        // Restore Navigator model
        if (items.navigatorModel) {
            const navigatorSelect = document.getElementById('navigatorModel');
            navigatorSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = items.navigatorModel;
            opt.textContent = '🧭 ' + items.navigatorModel + ' (saved)';
            opt.selected = true;
            navigatorSelect.appendChild(opt);
        }

        if (items.baseUrl) document.getElementById('baseUrl').value = items.baseUrl;
        if (items.temperature !== undefined) { tempRange.value = items.temperature; tempInput.value = items.temperature; }
        if (items.apiProvider) {
            apiProvider.value = items.apiProvider;
            if (items.apiProvider === "openai") baseUrlContainer.style.display = "block";
        }
    });
});

document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const plannerModel = document.getElementById('plannerModel').value;
    const navigatorModel = document.getElementById('navigatorModel').value;
    const provider = document.getElementById('apiProvider').value;
    const baseUrl = document.getElementById('baseUrl').value;
    const temperature = parseFloat(tempRange.value);

    chrome.storage.sync.set({ apiKey, plannerModel, navigatorModel, temperature, apiProvider: provider, baseUrl }, () => {
        status.style.color = "#4ade80"; status.textContent = "💾 Dual-Brain Configuration Saved!";
        setTimeout(() => status.textContent = "", 2000);
    });
});

// ==========================================
// 📱 WHATSAPP LOCAL BRIDGE LOGIC
// ==========================================
const qrBox = document.getElementById('wa-qr-box');
const qrImg = document.getElementById('wa-qr-img');
const connectedBox = document.getElementById('wa-connected-box');
const loadingBox = document.getElementById('wa-loading');
const targetInput = document.getElementById('target-phone');
const groupSelect = document.getElementById('target-group-select');
const sendTestBtn = document.getElementById('send-test-btn');
let groupsLoaded = false;

async function pollWhatsAppStatus() {
    try {
        const res = await fetch('http://localhost:3000/api/whatsapp-qr');
        const data = await res.json();

        loadingBox.style.display = 'none';

        if (data.connected) {
            qrBox.style.display = 'none';
            connectedBox.style.display = 'block';

            if (document.activeElement !== targetInput && document.activeElement !== groupSelect) {
                targetInput.value = data.target || '';
            }

            // Populate groups if we haven't already
            if (!groupsLoaded && data.groups && data.groups.length > 0) {
                data.groups.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    groupSelect.appendChild(opt);
                });
                groupsLoaded = true;
            }

            // Auto-sync dropdown if target matches a group ID
            if (document.activeElement !== groupSelect) {
                const optionExists = Array.from(groupSelect.options).some(opt => opt.value === targetInput.value);
                groupSelect.value = optionExists ? targetInput.value : "";
            }

        } else if (data.qr) {
            connectedBox.style.display = 'none';
            qrBox.style.display = 'block';
            qrImg.src = data.qr;
        }
    } catch (e) {
        loadingBox.textContent = 'Backend server offline. Run `node server.js` to enable WhatsApp bridge.';
        loadingBox.style.color = '#f87171';
    }
}

// Dropdown triggers input update & save
if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            targetInput.value = e.target.value;
        }
    });
}

document.getElementById('target-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        await fetch('http://localhost:3000/api/whatsapp-target-manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: targetInput.value })
        });
        btn.textContent = 'Saved!';
        btn.style.backgroundColor = '#16a34a'; // green
    } catch (e) {
        btn.textContent = 'Error!';
        btn.style.backgroundColor = '#dc2626'; // red
    }

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '#0891b2'; // cyan
        btn.disabled = false;
    }, 2000);
});

// Test Message
if (sendTestBtn) {
    sendTestBtn.addEventListener('click', async () => {
        const originalText = sendTestBtn.textContent;
        sendTestBtn.textContent = 'Sending...';
        sendTestBtn.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/whatsapp-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "🤖 *NanoAgent Diagnostic Test*\n\nIf you are reading this, your NanoAgent extension is successfully connected to the backend server and transmitting via WhatsApp." })
            });
            const data = await res.json();

            if (data.sent) {
                sendTestBtn.textContent = 'Sent!';
                sendTestBtn.style.backgroundColor = '#16a34a';
            } else {
                sendTestBtn.textContent = 'Failed';
                sendTestBtn.style.backgroundColor = '#dc2626';
            }
        } catch (err) {
            sendTestBtn.textContent = 'Error';
            sendTestBtn.style.backgroundColor = '#dc2626';
        }

        setTimeout(() => {
            sendTestBtn.textContent = originalText;
            sendTestBtn.style.backgroundColor = '#4f46e5';
            sendTestBtn.disabled = false;
        }, 3000);
    });
}

// Connect to bridge every 3 seconds
setInterval(pollWhatsAppStatus, 3000);
pollWhatsAppStatus();