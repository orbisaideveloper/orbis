document.addEventListener('DOMContentLoaded', () => {
    const getEl = (id) => document.getElementById(id);

    function printLog(type, msg) {
        const logBox = getEl('log-box');
        if (!logBox) return;
        const time = new Date().toLocaleTimeString();
        let color = type === 'OK' ? '#138808' : type === 'ERR' ? '#FF9933' : '#ffffff';
        logBox.innerHTML += `<div><span style="color:#aaa;">[${time}]</span> <strong style="color:${color};">${type}</strong>: ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
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
    setInterval(fetchTelemetry, 3000);
    fetchTelemetry();

    window.dispatchToAI = async function() {
        const promptBox = getEl('prompt-box');
        const sendBtn = getEl('send-btn');
        const chatBox = getEl('chat-box');
        
        if (!promptBox || !sendBtn || !chatBox) return;
        const val = promptBox.value.trim();
        if (!val) return;

        chatBox.innerHTML += `<div class="msg-bubble msg-user"><strong>You</strong><br>${val}</div>`;
        promptBox.value = '';
        sendBtn.disabled = true;
        printLog('INFO', 'Forwarding request to Gemini Flash...');

        try {
            const start = Date.now();
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: val })
            });
            const data = await res.json();
            
            const diff = Date.now() - start;
            if(getEl('tel-ping')) getEl('tel-ping').innerText = diff + ' ms';

            if (data.success) {
                printLog('OK', `AI synthesis complete in ${diff}ms`);
                chatBox.innerHTML += `<div class="msg-bubble msg-ai"><strong>ORBIS ✨</strong><br>${data.response}</div>`;
            }
        } catch (err) {
            printLog('ERR', 'Transmission failed.');
        } finally {
            sendBtn.disabled = false;
            chatBox.scrollTop = chatBox.scrollHeight;
            promptBox.focus();
        }
    };

    let rec;
    try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            rec = new SR();
            rec.onstart = () => { if(getEl('mic-btn')) getEl('mic-btn').classList.add('mic-active'); };
            rec.onresult = (e) => { if(getEl('prompt-box')) getEl('prompt-box').value = e.results[0][0].transcript; };
            rec.onend = () => { if(getEl('mic-btn')) getEl('mic-btn').classList.remove('mic-active'); };
        }
    } catch(e) {}

    window.startVoiceEngine = () => { 
        if(rec) { 
            rec.lang = getEl('lang-select')?.value || 'bn-IN'; 
            rec.start(); 
        } 
    };
    
    printLog('OK', 'ORBIS Systems Architecture Locked.');
});
