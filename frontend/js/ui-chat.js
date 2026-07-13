// frontend/js/ui-chat.js
/**
 * UI Chat Module: Orchestrates real-time rendering, historical state-healing, 
 * and advanced multi-agent visual profiling.
 * Updated: Phase 8.0 - Autonomous Architecture & Multi-LLM Orchestration Ready.
 */

window.dispatchToAI = async function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value ? promptBox.value.trim() : '';
    if (!msg) return;

    window.printLog('INFO', 'Chat: Dispatching to Router...');
    
    // ১. অ্যাডভান্সড স্টেট লক: ইউজার মেসেজ পাঠানোর সাথে সাথে স্ক্রিনে দ্রুত অ্যাপেন্ড হবে
    window.updateChatUI('YOU', msg);
    promptBox.value = ''; // ইনপুট বক্স সাথে সাথে খালি করা হলো (UX উইন)

    if (typeof window.WorkflowRouter !== 'undefined') {
        window.WorkflowRouter.route({ type: 'CHAT_MESSAGE', content: msg });
    } else {
        // যদি ওয়ার্কফ্লো রাউটার সরাসরি না থাকে, তবে এপিআই গেটওয়ে দিয়ে ব্যাকএন্ডে রিকোয়েস্ট ফায়ার করবে
        if (window.APIGateway && window.APIGateway.call) {
            const apiResult = await window.APIGateway.call('/api/chat', { prompt: msg });
            if (apiResult.status === 'success') {
                window.updateChatUI('ORBIS', apiResult.data);
            } else {
                window.updateChatUI('SYSTEM_ERROR', `যোগাযোগ ব্যর্থ হয়েছে: ${apiResult.message}`);
            }
        } else {
            window.printLog('ERR', 'Router and API Gateway both missing!');
        }
    }
};

// 🟢 SMART TIME & ADVANCED MULTI-AGENT UI LOGIC
window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

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

    // 🟢 অ্যাডভান্সড মাল্টি-এআই স্টাইল ক্লাসিফায়ার (ভবিষ্যতে একাধিক AI পরিচালনা করার জন্য)
    let bubbleClass = 'msg-ai';
    let labelText = sender;
    
    if (sender === 'YOU') {
        bubbleClass = 'msg-user';
    } else if (typeof message === 'string' && message.includes('[Local Brain Active]')) {
        bubbleClass = 'msg-orbis-local'; // অর্বিসের নিজস্ব স্বায়ত্তশাসিত লোকাল মাইন্ডের জন্য স্পেশাল ডিজাইন ক্লাস
        labelText = 'ORBIS (Local Brain)';
    } else if (sender === 'SYSTEM_ERROR') {
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

// মেমোরি প্রিন্ট করার ফাংশন
window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    
    window.printLog('INFO', 'UI: Rendering chat history to screen...');
    
    // স্ক্রিন ডুপ্লিকেট মেসেজ এড়ানোর জন্য আগে চ্যাট বক্স ক্লিয়ার করে নেওয়া ভালো
    const chatBox = document.getElementById('chat-box');
    if (chatBox) chatBox.innerHTML = '';

    historyArray.forEach(item => {
        const sender = item.role === 'user' ? 'YOU' : 'ORBIS';
        // ডেটাবেসের ফিল্ডের ভিন্নতা হ্যান্ডেল করার জন্য সেফ গেটিং
        const messageText = item.content || item.message || item.prompt; 
        const dbTime = item.created_at || item.timestamp; 
        
        window.updateChatUI(sender, messageText, dbTime);
    });
};

// 🟢 🚨 NEW FEATURE: অটো-হিলিং মেমোরি ইভেন্ট লিসেনার (অটোমেটিক বুটস্ট্র্যাপ)
// পেজ খোলার সাথে সাথে এই সেলফ-এক্সিকিউটিং লুপটি ব্যাকএন্ড থেকে হিস্ট্রি এনে স্ক্রিনে সাজিয়ে দেবে
document.addEventListener('DOMContentLoaded', async () => {
    window.printLog('INFO', 'System: Core Chat UI Mounted. Initializing Memory Recovery...');
    
    if (window.APIGateway && window.APIGateway.fetchHistory) {
        const response = await window.APIGateway.fetchHistory('default_user');
        if (response.status === 'success' && response.data && response.data.length > 0) {
            window.renderHistoryMessages(response.data);
            window.printLog('OK', `Memory Recovery Successful! Active Messages Context: ${response.data.length}`);
        } else {
            window.printLog('INFO', 'No historical session log found in storage. Fresh brain instance active.');
        }
    }
});
