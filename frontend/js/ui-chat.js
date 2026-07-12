// ui-chat.js - Frontend Chat Interface & Memory
let contextMemory = [];

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
    window.printLog('INFO', 'Routing payload to Gemini Hub...');
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
            window.printLog('OK', `AI synthesis complete in ${diff}ms`);
            chatBox.innerHTML += `<div class="msg-bubble msg-ai"><span class="msg-label">ORBIS ✨</span>${data.response.replace(/\n/g, '<br>')}</div>`;
            contextMemory.push({ role: 'ai', text: data.response });
            if(getEl('tel-nodes')) getEl('tel-nodes').innerText = contextMemory.length + ' Nodes';
        } else {
            window.printLog('ERR', 'API Error: ' + (data.error || 'Unknown'));
        }
    } catch (err) {
        window.printLog('ERR', 'Transmission timeout/failed.');
    } finally {
        sendBtn.disabled = false;
        if(brainState) {
            brainState.innerText = "IDLE";
            brainState.style.background = "var(--border)";
            brainState.style.color = "var(--navy-blue)";
        }
        chatBox.scrollTop = chatBox.scrollHeight;
        if(window.innerWidth > 900) promptBox.focus(); 
    }
};

window.clearContext = function() {
    if(confirm("Clear memory nodes?")) {
        contextMemory = [];
        getEl('chat-box').innerHTML = '';
        if(getEl('tel-nodes')) getEl('tel-nodes').innerText = '0 Nodes';
        window.printLog('WARN', 'Memory Context Wiped.');
    }
};
