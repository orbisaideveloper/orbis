// frontend/js/ui-chat.js
/**
 * UI Chat Module: Fixed Routing and API Gateway Logic
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

    // ১. স্ক্রিনে ইউজারের মেসেজ বসানো
    window.updateChatUI('YOU', msg);
    promptBox.value = ''; 

    // ২. ডিরেক্ট API গেটওয়ে কল (রাউটার বাইপাস করা হলো যাতে কোনো ব্লকেজ না হয়)
    if (window.APIGateway && typeof window.APIGateway.call === 'function') {
        try {
            const apiResult = await window.APIGateway.call('/api/chat', { prompt: msg });
            
            // টেলিমেট্রি সিঙ্ক
            if (apiResult && apiResult.telemetry) {
                window.globalEventBus?.emit('TelemetryUpdated', apiResult.telemetry);
            }

            if (apiResult && (apiResult.success || apiResult.status === 'success')) {
                // 🟢 রিপ্লাই ধরার লজিকটি আরও রবাস্ট করা হলো
                const reply = apiResult.reply || apiResult.response || apiResult.data || apiResult.message;
                
                if (reply) {
                    window.updateChatUI('ORBIS', reply);
                } else {
                    window.updateChatUI('SYSTEM_ERROR', `সার্ভার রেসপন্স দিয়েছে কিন্তু টেক্সট খুঁজে পায়নি।`);
                }
            } else {
                window.updateChatUI('SYSTEM_ERROR', `যোগাযোগ ব্যর্থ: ${apiResult?.error || 'Unknown Error'}`);
            }
        } catch (err) {
            window.updateChatUI('SYSTEM_ERROR', `ক্রিটিক্যাল এরর: ${err.message}`);
        } finally {
            window.ChatStateLock.isProcessing = false;
        }
    } else {
        window.updateChatUI('SYSTEM_ERROR', 'API Gateway Missing. মেসেজ পাঠানো যাচ্ছে না।');
        window.ChatStateLock.isProcessing = false;
    }
};

window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    if (typeof message === 'object' && message !== null) {
        message = message.reply || message.response || message.content || JSON.stringify(message);
    }

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
        
        if (messageText) {
            window.updateChatUI(sender, messageText, dbTime);
        }
    });
};

if (!window.ChatUIInitialized) {
    document.addEventListener('DOMContentLoaded', async () => {
        if (window.APIGateway && window.APIGateway.fetchHistory) {
            try {
                const response = await window.APIGateway.fetchHistory('default_user');
                if (response && (response.status === 'success' || response.success) && response.data) {
                    window.renderHistoryMessages(response.data);
                }
            } catch (err) {
                console.error(`Memory Recovery Failed: ${err.message}`);
            }
        }
    });
    window.ChatUIInitialized = true; 
}
