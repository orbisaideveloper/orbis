// js/ui-chat.js
window.dispatchToAI = function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value;
    if (!msg) return;

    window.printLog('INFO', 'Chat: Dispatching to Router...');
    
    if (typeof window.WorkflowRouter !== 'undefined') {
        window.WorkflowRouter.route({ type: 'CHAT_MESSAGE', content: msg });
    } else {
        window.printLog('ERR', 'Router not initialized!');
    }

    promptBox.value = '';
};

// 🟢 SMART TIME LOGIC (Today vs Older Dates)
window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    
    let timeString = '';
    const now = new Date();
    let msgDate = now; // ডিফল্টভাবে বর্তমান সময়

    // যদি ডেটাবেস থেকে আসল সময় আসে
    if (timestamp) {
        msgDate = new Date(timestamp);
    }

    // চেক করছি মেসেজটা আজকের কিনা
    const isToday = msgDate.getDate() === now.getDate() &&
                    msgDate.getMonth() === now.getMonth() &&
                    msgDate.getFullYear() === now.getFullYear();

    const timePart = msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        timeString = timePart; // আজকের হলে শুধু সময়
    } else {
        // আগের দিনের হলে শর্ট ডেট (যেমন: Jul 12) + সময়
        const datePart = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
        timeString = `${datePart}, ${timePart}`;
    }

    msgDiv.className = `msg-bubble ${sender === 'YOU' ? 'msg-user' : 'msg-ai'}`;
    msgDiv.innerHTML = `<span class="msg-label">${sender}</span>${message}<span class="msg-time">${timeString}</span>`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// মেমোরি প্রিন্ট করার ফাংশন
window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    
    window.printLog('INFO', 'UI: Rendering chat history to screen...');
    
    historyArray.forEach(item => {
        const sender = item.role === 'user' ? 'YOU' : 'ORBIS';
        const messageText = item.content || item.message; 
        
        // ডেটাবেসের আসল সময়টা পাঠানো হচ্ছে (যেটা আপাতত ব্যাকএন্ড থেকে আসছে না)
        const dbTime = item.created_at; 
        
        window.updateChatUI(sender, messageText, dbTime);
    });
};
