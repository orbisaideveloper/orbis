// frontend/js/ui-chat.js
/**
 * UI Chat Module: Orchestrates real-time rendering, historical state-healing, 
 * and advanced multi-agent visual profiling.
 * Updated: Phase 8.5 - Advanced Anti-Duplication Engine & Telemetry Injection.
 */

// ডুপ্লিকেট মেসেজ এবং নেটওয়ার্ক ট্র্যাকিং লক স্টেট
window.ChatStateLock = {
    lastUserPrompt: '',
    lastTimestamp: 0,
    isProcessing: false
};

window.dispatchToAI = async function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value ? promptBox.value.trim() : '';
    if (!msg) return;

    // 🚨 ANTI-LOOP LOCK: একই মেসেজ ৫০০ মিলিসেকেন্ডের মধ্যে দুবার প্রসেস হবে না
    const now = Date.now();
    if (msg === window.ChatStateLock.lastUserPrompt && (now - window.ChatStateLock.lastTimestamp < 500)) {
        window.printLog('WARN', 'Anti-Loop: Duplicate prompt blocked from double-rendering.');
        return;
    }

    window.ChatStateLock.lastUserPrompt = msg;
    window.ChatStateLock.lastTimestamp = now;
    window.ChatStateLock.isProcessing = true;

    window.printLog('INFO', 'Chat: Dispatching to Router...');
    
    // ১. স্ক্রিনে ইউজারের মেসেজ একবারই বসানো হলো
    window.updateChatUI('YOU', msg);
    promptBox.value = ''; // UX উইন

    // ২. রাউটিং এবং ব্যাকএন্ড গেটওয়ে মেকানিজম
    if (typeof window.WorkflowRouter !== 'undefined') {
        window.WorkflowRouter.route({ type: 'CHAT_MESSAGE', content: msg });
    } else {
        if (window.APIGateway && window.APIGateway.call) {
            try {
                const apiResult = await window.APIGateway.call('/api/chat', { prompt: msg });
                
                // 🟢 ড্যাশবোর্ড সিঙ্ক ইন্টেলিজেন্স: ব্যাকএন্ড থেকে আসা টেলিমেট্রি সরাসরি গ্লোবাল বাসে পুশ
                if (apiResult && apiResult.telemetry) {
                    window.globalEventBus?.emit('TelemetryUpdated', apiResult.telemetry);
                    if (window.Telemetry?.updateMetricsUI) window.Telemetry.updateMetricsUI(apiResult.telemetry);
                    if (window.NetworkMetrics?.updateNetworkUI) window.NetworkMetrics.updateNetworkUI(apiResult.telemetry);
                }

                if (apiResult.success || apiResult.status === 'success') {
                    // শুধু মডেলের উত্তরটি রেন্ডার হবে, ইউজারের ইনপুট পুনরায় রেন্ডার হবে না
                    const reply = apiResult.response || apiResult.data;
                    window.updateChatUI('ORBIS', reply);
                } else {
                    window.updateChatUI('SYSTEM_ERROR', `যোগাযোগ ব্যর্থ হয়েছে: ${apiResult.message || apiResult.error}`);
                    window.globalEventBus?.emit('ModuleError', { module: 'Core', msg: apiResult.error || 'Unknown Backend Failure' });
                }
            } catch (err) {
                window.updateChatUI('SYSTEM_ERROR', `ক্রিটিক্যাল এরর: ${err.message}`);
                window.globalEventBus?.emit('ModuleError', { module: 'ExecutionChain', msg: err.message });
            } finally {
                window.ChatStateLock.isProcessing = false;
            }
        } else {
            window.printLog('ERR', 'Router and API Gateway both missing!');
            window.globalEventBus?.emit('ModuleError', { module: 'Dashboard', msg: 'Router & API Gateway Missing' });
            window.ChatStateLock.isProcessing = false;
        }
    }
};

// 🟢 SMART TIME & ADVANCED MULTI-AGENT UI LOGIC
window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    // ব্যাকএন্ড যদি ভুল করে অবজেক্ট পাঠায়, তাকে স্ট্রিং-এ কনভার্ট করা
    if (typeof message === 'object' && message !== null) {
        message = message.response || message.content || JSON.stringify(message);
    }

    const msgDiv = document.createElement('div');
    let timeString = '';
    const now = new Date();
    let msgDate = now;

    if (timestamp) {
        msgDate = new Date(timestamp);
    }

    const isToday = msgDate.getDate() === now.getDate() &&
                    msgDate.getMonth() === now.getMonth() &&
                    msgDate.getFullYear() === now.getFullYear();

    const timePart = msgDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) {
        timeString = timePart;
    } else {
        const datePart = msgDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); 
        timeString = `${datePart}, ${timePart}`;
    }

    let bubbleClass = 'msg-ai';
    let labelText = sender;
    
    if (sender === 'YOU') {
        bubbleClass = 'msg-user';
    } else if (typeof message === 'string' && message.includes('[Local Brain Active]')) {
        bubbleClass = 'msg-orbis-local'; 
        labelText = 'ORBIS (Local Brain)';
    } else if (sender === 'SYSTEM_ERROR' || sender === '🚨 SYSTEM') {
        bubbleClass = 'msg-system-error';
        labelText = '🚨 SYSTEM';
    } else {
        labelText = 'ORBIS (Core)';
    }

    msgDiv.className = `msg-bubble ${bubbleClass}`;
    msgDiv.innerHTML = `<span class="msg-label">${labelText}</span><div class="msg-body">${message}</div><span class="msg-time">${timeString}</span>`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// মেমোরি হিস্ট্রি রেন্ডার করার মাস্টার ফাংশন (ডুপ্লিকেট প্রতিরোধক সহ)
window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    // 🚨 ডুপ্লিকেট রেন্ডারিং চিরতরে বন্ধ করতে স্ক্রিন সম্পূর্ণ ক্লিয়ার করা হচ্ছে
    chatBox.innerHTML = '';
    window.printLog('INFO', `UI: Rendering ${historyArray.length} chat history nodes to screen...`);

    historyArray.forEach(item => {
        const sender = item.role === 'user' || item.sender === 'YOU' ? 'YOU' : 'ORBIS';
        const messageText = item.content || item.message || item.prompt; 
        const dbTime = item.created_at || item.timestamp; 
        
        if (messageText) {
            window.updateChatUI(sender, messageText, dbTime);
        }
    });

    // ড্যাশবোর্ডের অ্যাক্টিভ নোডস সংখ্যা লাইভ আপডেট করার জন্য ইভেন্ট ট্রিগার
    window.globalEventBus?.emit('MemoryRestored', historyArray);
};

// 🟢 অটো-হিলিং মেমোরি ইভেন্ট লিসেনার
if (!window.ChatUIInitialized) {
    document.addEventListener('DOMContentLoaded', async () => {
        window.printLog('INFO', 'System: Core Chat UI Mounted. Initializing Memory Recovery...');
        
        if (window.APIGateway && window.APIGateway.fetchHistory) {
            try {
                const response = await window.APIGateway.fetchHistory('default_user');
                if (response && (response.status === 'success' || response.success) && response.data) {
                    window.renderHistoryMessages(response.data);
                    window.printLog('OK', `Memory Recovery Successful! Active Messages Context: ${response.data.length}`);
                } else {
                    window.printLog('INFO', 'No historical session log found in storage. Fresh brain instance active.');
                }
            } catch (err) {
                window.printLog('ERR', `Memory Recovery Failed: ${err.message}`);
            }
        }
    });
    window.ChatUIInitialized = true; // গ্লোবাল লক লক করা হলো যাতে ডাবল বুটস্ট্র্যাপ না হয়
}
