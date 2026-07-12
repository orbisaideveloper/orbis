document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const promptInput = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-btn');
    const logBox = document.getElementById('log-box');
    const pingStatus = document.getElementById('ping-status');
    const langSelect = document.getElementById('lang-select');
    const micBtn = document.getElementById('mic-btn');
    
    function commitLog(level, module, text) {
        const time = new Date().toLocaleTimeString();
        let color = level === 'SUCCESS' ? '#34d399' : level === 'ERROR' ? '#f87171' : '#38bdf8'; 
        logBox.innerHTML += `<div class="log-line">[${time}] <span style="color:${color};font-weight:bold;">${level}</span> [${module}] ${text}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    }

    // Telemetry Engine Fetch
    async function runTelemetryStream() {
        try {
            const res = await fetch('/api/telemetry');
            if(!res.ok) throw new Error("API Offline");
            const json = await res.json();
            
            if (json.success && json.data) {
                const data = json.data;
                document.getElementById('tel-brainhub').innerText = data.brainHub?.status || "ONLINE";
                document.getElementById('tel-brainhub').className = "text-green";
                document.getElementById('tel-ram').innerText = (data.memoryEngine?.ramUsageMB || "--") + ' MB';
                document.getElementById('tel-uptime').innerText = (data.brainHub?.uptime || "0") + 's';
                document.getElementById('tel-total-req').innerText = data.performance?.totalRequests || 0;
                document.getElementById('tel-errors').innerText = data.performance?.errorCount || 0;

                const activeStep = data.brainHub?.activeWorkflow || "IDLE";
                document.getElementById('tel-wf-status').innerText = activeStep;
                
                document.querySelectorAll('.wf-node').forEach(n => n.classList.remove('active'));
                if (activeStep !== "IDLE") {
                    document.getElementById('wf-input').classList.add('active');
                    document.getElementById('wf-brain').classList.add('active');
                }
            }
        } catch (e) {
            document.getElementById('tel-brainhub').innerText = "OFFLINE";
            document.getElementById('tel-brainhub').className = "text-red";
        }
    }

    setInterval(runTelemetryStream, 3000);
    setTimeout(runTelemetryStream, 500);

    function appendMessageFrame(sender, messageText, cssClass) {
        const formatted = messageText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        chatBox.innerHTML += `<div class="message ${cssClass}"><strong>${sender}</strong><br>${formatted}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.executeSecureDispatch();
    });

    // Chat API Execution
    window.executeSecureDispatch = async function() {
        const input = promptInput.value.trim();
        if (!input) return;

        appendMessageFrame('You', input, 'msg-dev');
        promptInput.value = ''; 
        sendBtn.disabled = true; 
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; 
        
        commitLog('INFO', 'API', `Dispatching message to BrainHub...`);
        const startTime = Date.now();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
            });

            const data = await response.json();
            const latency = Date.now() - startTime;
            pingStatus.innerText = latency + ' ms';

            if (data.success) {
                commitLog('SUCCESS', 'API', `Replied in ${latency}ms`);
                appendMessageFrame('ORBIS ✨', data.response, 'msg-orbis');
            } else {
                appendMessageFrame('System Error', 'Request failed.', 'text-red');
            }
        } catch (error) {
            commitLog('ERROR', 'NET', `Error: ${error.message}`);
            appendMessageFrame('System Error', 'Network unreachable.', 'text-red');
        } finally {
            sendBtn.disabled = false; 
            sendBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            promptInput.focus();
        }
    };
    
    // Voice API
    let recognition;
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false; 
            
            recognition.onstart = () => {
                micBtn.classList.add('recording');
                promptInput.placeholder = "Listening...";
            };
            recognition.onresult = (e) => promptInput.value = e.results[0][0].transcript;
            recognition.onerror = (e) => {
                micBtn.classList.remove('recording');
                promptInput.placeholder = "Message ORBIS...";
            };
            recognition.onend = () => {
                micBtn.classList.remove('recording');
                promptInput.placeholder = "Message ORBIS...";
            };
        }
    } catch (err) {}

    window.startVoiceEngine = function() {
        if (recognition) {
            recognition.lang = langSelect.value;
            recognition.start();
        } else {
            alert("Voice not supported.");
        }
    };

    commitLog('SUCCESS', 'SYS', 'ORBIS Interface Initialized securely.');
});

