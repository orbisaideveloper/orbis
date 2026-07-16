// frontend/js/ui-chat.js
/**
 * UI Chat Module: Direct Fetch API Integration with Permanent ORB-ID
 */

window.ChatStateLock = {
    lastUserPrompt: '',
    lastTimestamp: 0,
    isProcessing: false
};

window.dispatchToAI = async function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value ? promptBox.value.trim() : '';
    if (!msg) return;

    const now = Date.now();
    if (msg === window.ChatStateLock.lastUserPrompt && (now - window.ChatStateLock.lastTimestamp < 500)) {
        return; 
    }

    window.ChatStateLock.lastUserPrompt = msg;
    window.ChatStateLock.lastTimestamp = now;
    window.ChatStateLock.isProcessing = true;

    window.updateChatUI('YOU', msg);
    promptBox.value = ''; 

    const activeUserId = localStorage.getItem('orbis_uid') || localStorage.getItem('orbis_active_user') || 'guest_user';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: msg, sessionId: activeUserId }) 
        });

        const apiResult = await response.json();
        
        if (apiResult && apiResult.telemetry) window.globalEventBus?.emit('TelemetryUpdated', apiResult.telemetry);

        if (response.ok && (apiResult.success || apiResult.status === 'success')) {
            const reply = apiResult.reply || apiResult.response || apiResult.data || apiResult.message;
            if (reply) window.updateChatUI('ORBIS', reply);
            else window.updateChatUI('SYSTEM_ERROR', `সার্ভার রেসপন্স দিয়েছে কিন্তু টেক্সট খুঁজে পায়নি।`);
        } else {
            window.updateChatUI('SYSTEM_ERROR', `সার্ভার এরর: ${apiResult?.error || response.statusText}`);
        }
    } catch (err) {
        window.updateChatUI('SYSTEM_ERROR', `নেটওয়ার্ক এরর: সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।`);
    } finally {
        window.ChatStateLock.isProcessing = false;
    }
};

window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    if (typeof message === 'object' && message !== null) message = message.reply || message.response || message.content || JSON.stringify(message);

    const msgDiv = document.createElement('div');
    let timeString = timestamp ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                               : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let bubbleClass = sender === 'YOU' ? 'msg-user' : sender === 'SYSTEM_ERROR' ? 'msg-system-error' : 'msg-ai';
    let labelText = sender === 'YOU' ? 'YOU' : sender === 'SYSTEM_ERROR' ? '🚨 SYSTEM' : 'ORBIS (Core)';
    
    msgDiv.className = `msg-bubble ${bubbleClass}`;
    msgDiv.innerHTML = `<span class="msg-label">${labelText}</span><div class="msg-body">${message}</div><span class="msg-time">${timeString}</span>`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    chatBox.innerHTML = '';

    historyArray.forEach(item => {
        const sender = item.role === 'user' || item.sender === 'YOU' ? 'YOU' : 'ORBIS';
        const messageText = item.content || item.message || item.prompt || item.reply; 
        const dbTime = item.created_at || item.timestamp; 
        
        if (messageText) window.updateChatUI(sender, messageText, dbTime);
    });
};

// 🟢 NEW: CLEAR HISTORY FUNCTION
window.clearUserHistory = async function() {
    if (!confirm("Are you sure you want to permanently delete all your chats?")) return;
    
    const activeUserId = localStorage.getItem('orbis_uid') || localStorage.getItem('orbis_active_user') || 'guest_user';
    const chatBox = document.getElementById('chat-box');
    
    // UI থেকে সাথে সাথে মুছে দেওয়া
    if (chatBox) chatBox.innerHTML = '<div style="text-align:center; color:#64748b; padding:20px; font-size:0.85rem; font-weight:bold;">Memory Cleared Successfully.</div>';
    
    try {
        // সার্ভারকে বলা Supabase থেকে ডিলিট করতে
        const response = await fetch('/api/history/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: activeUserId })
        });
        
        const result = await response.json();
        if (!result.success) alert("Failed to clear cloud memory.");
    } catch(e) {
        console.error("Clear memory error:", e);
    }
};

if (!window.ChatUIInitialized) {
    document.addEventListener('DOMContentLoaded', async () => {
        const activeUserId = localStorage.getItem('orbis_uid') || localStorage.getItem('orbis_active_user') || 'guest_user';
        try {
            const response = await fetch(`/api/history?sessionId=${activeUserId}`);
            if (response.ok) {
                const result = await response.json();
                if (result && (result.status === 'success' || result.success) && result.data) {
                    window.renderHistoryMessages(result.data);
                }
            }
        } catch (err) { console.error(`Memory Recovery Failed: ${err.message}`); }
    });
    window.ChatUIInitialized = true; 
}
