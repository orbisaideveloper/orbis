document.addEventListener('DOMContentLoaded', () => {
    const getEl = (id) => document.getElementById(id);
    let contextMemory = []; 

    // --- NEW: Sidebar Toggle Logic for Mobile ---
    window.toggleSidebar = function() {
        const sidebar = getEl('dev-sidebar');
        if (!sidebar) return;
        
        // Check current display state and toggle
        if (sidebar.style.display === 'none' || sidebar.style.display === '') {
            sidebar.style.display = 'flex';
            sidebar.style.position = 'absolute';
            sidebar.style.zIndex = '100';
            sidebar.style.height = '100%';
            sidebar.style.boxShadow = '5px 0 15px rgba(0,0,0,0.1)';
        } else {
            sidebar.style.display = 'none';
        }
    };

    function printLog(type, msg) {
        try {
            const logBox = getEl('log-box');
            if (!logBox) return;
            const time = new Date().toLocaleTimeString();
            let color = type === 'OK' ? '#138808' : type === 'ERR' ? '#FF9933' : type === 'INFO' ? '#3b82f6' : '#ffffff';
            logBox.innerHTML += `<div><span style="color:#aaa;">[${time}]</span> <strong style="color:${color};">${type}</strong>: ${msg}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        } catch(e) {}
    }

    async function fetchTelemetry() {
        try {
            const res = await fetch('/api/telemetry');
            if(!res.ok) throw new Error();
            const json = await res.json();
            
            if (json.success && json.data) {
                const d = json.data;
                if(getEl('glow-dot')) getEl('glow-dot').className = "status-glow online";
                if(getEl('status-text')) {
                    getEl('status-text').innerText = "SYSTEM ONLINE";
                    getEl('status-text').style.color = "var(--green)";
                }
                if(getEl('tel-uptime')) getEl('tel-uptime').innerText = (d.brainHub?.uptime || 0) + 's';
                if(getEl('tel-ram')) getEl('tel-ram').innerText = (d.memoryEngine?.ramUsageMB || 0) + ' MB';
                if(getEl('tel-wf')) getEl('tel-wf').innerText = d.brainHub?.activeWorkflow || "IDLE";
                if(getEl('tel-req')) getEl('tel-req').innerText = d.performance?.totalRequests || 0;
            }
        } catch (e) {
            if(getEl('glow-dot')) getEl('glow-dot').className = "status-glow offline";
            if(getEl('status-text')) {
                getEl('status-text').innerText = "OFFLINE Connecting...";
                getEl('status-text').style.color = "var(--saffron)";
            }
        }
    }
    
    // Start telemetry safely
    try {
        setInterval(fetchTelemetry, 3000);
        fetchTelemetry();
    } catch(e) {}

    window.dispatchToAI = async function() {
        const promptBox = getEl('prompt-box');
        const sendBtn = getEl('send-btn');
        const chatBox = getEl('chat-box');
        const brainState = getEl('tel-brain');
        const welcomeMsg = getEl('welcome-msg');
        
        if (!promptBox || !sendBtn || !chatBox) return;
        const val = promptBox.value.trim();
        if (!val) return;

        if(welcomeMsg) welcomeMsg.style.display = 'none';

        chatBox.innerHTML += `<div class="msg-bubble msg-user"><span class="msg-label">You</span>${val.replace(/\n/g, '<br>')}</div>`;
        contextMemory.push({ role: 'user', text: val });
        if(getEl('tel-nodes')) getEl('tel-nodes').innerText = contextMemory.length + ' Nodes';
        
        promptBox.value = '';
        sendBtn.disabled = true;
        if(brainState) {
            brainState.innerText = "SYNTHESIZING";
            brainState.style.background = "var(--saffron)";
            brainState.style.color = "white";
        }
        printLog('INFO', 'Routing payload to Gemini Hub...');
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const start = Date.now();
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: val, history: contextMemory })
            });
            const data = await res.json();
            
            const diff = Date.now() - start;
            if(getEl('tel-ping')) getEl('tel-ping').innerText = diff + ' ms';

            if (data.success) {
                printLog('OK', `AI synthesis complete in ${diff}ms`);
                chatBox.innerHTML += `<div class="msg-bubble msg-ai"><span class="msg-label">ORBIS ✨</span>${data.response.replace(/\n/g, '<br>')}</div>`;
                contextMemory.push({ role: 'ai', text: data.response });
                if(getEl('tel-nodes')) getEl('tel-nodes').innerText = contextMemory.length + ' Nodes';
            } else {
                printLog('ERR', 'API Error: ' + (data.error || 'Unknown'));
            }
        } catch (err) {
            printLog('ERR', 'Transmission timeout/failed.');
        } finally {
            sendBtn.disabled = false;
            if(brainState) {
                brainState.innerText = "IDLE";
                brainState.style.background = "var(--border)";
                brainState.style.color = "var(--navy-blue)";
            }
            chatBox.scrollTop = chatBox.scrollHeight;
            if(window.innerWidth > 900) promptBox.focus(); // Prevent mobile keyboard popup auto-trigger
        }
    };

    window.clearContext = function() {
        if(confirm("Clear memory nodes?")) {
            contextMemory = [];
            getEl('chat-box').innerHTML = '';
            if(getEl('tel-nodes')) getEl('tel-nodes').innerText = '0 Nodes';
            printLog('WARN', 'Memory Context Wiped.');
        }
    };

    printLog('OK', 'ORBIS Systems Architecture Locked.');
});
