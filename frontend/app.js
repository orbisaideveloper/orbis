document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        chat: document.getElementById('chat-box'),
        prompt: document.getElementById('prompt-box'),
        sendBtn: document.getElementById('send-btn'),
        log: document.getElementById('log-box'),
        ping: document.getElementById('tel-ping'),
        uptime: document.getElementById('tel-uptime'),
        ram: document.getElementById('tel-ram'),
        wf: document.getElementById('tel-wf'),
        req: document.getElementById('tel-req'),
        glowDot: document.getElementById('glow-dot'),
        statusText: document.getElementById('status-text'),
        micBtn: document.getElementById('mic-btn')
    };

    function printLog(type, msg) {
        const time = new Date().toLocaleTimeString();
        let color = type === 'OK' ? '#138808' : type === 'ERR' ? '#FF9933' : '#ffffff';
        ui.log.innerHTML += `<div><span style="color:#888;">[${time}]</span> <strong style="color:${color};">${type}</strong>: ${msg}</div>`;
        ui.log.scrollTop = ui.log.scrollHeight;
    }

    async function fetchTelemetry() {
        try {
            const res = await fetch('/api/telemetry');
            if(!res.ok) throw new Error();
            const json = await res.json();
            if (json.success) {
                ui.glowDot.className = "status-glow online";
                ui.statusText.innerText = "SYSTEM ONLINE";
                ui.statusText.style.color = "var(--green)";
                ui.uptime.innerText = json.data.brainHub.uptime + 's';
                ui.ram.innerText = json.data.memoryEngine.ramUsageMB + ' MB';
                ui.wf.innerText = json.data.brainHub.activeWorkflow;
                ui.req.innerText = json.data.performance.totalRequests;
            }
        } catch (e) {
            ui.glowDot.className = "status-glow offline";
            ui.statusText.innerText = "OFFLINE";
            ui.statusText.style.color = "var(--saffron)";
        }
    }
    setInterval(fetchTelemetry, 3000);
    fetchTelemetry();

    window.dispatchToAI = async function() {
        const val = ui.prompt.value.trim();
        if (!val) return;

        ui.chat.innerHTML += `<div class="msg-bubble msg-user"><strong>You</strong><br>${val}</div>`;
        ui.prompt.value = '';
        ui.sendBtn.disabled = true;
        printLog('INFO', 'Dispatching query to BrainHub...');

        try {
            const start = Date.now();
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: val })
            });
            const data = await res.json();
            ui.ping.innerText = (Date.now() - start) + ' ms';

            if (data.success) {
                printLog('OK', 'AI response compiled.');
                ui.chat.innerHTML += `<div class="msg-bubble msg-ai"><strong>ORBIS ✨</strong><br>${data.response}</div>`;
            }
        } catch (err) {
            printLog('ERR', 'Failed execution.');
        } finally {
            ui.sendBtn.disabled = false;
            ui.chat.scrollTop = ui.chat.scrollHeight;
        }
    };

    let rec;
    try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            rec = new SR();
            rec.onstart = () => ui.micBtn.classList.add('mic-active');
            rec.onresult = (e) => ui.prompt.value = e.results[0][0].transcript;
            rec.onend = () => ui.micBtn.classList.remove('mic-active');
        }
    } catch(e) {}

    window.startVoiceEngine = () => { if(rec) { rec.lang = document.getElementById('lang-select').value; rec.start(); } };
    printLog('OK', 'ORBIS Systems UI Rendered Successfully.');
});
