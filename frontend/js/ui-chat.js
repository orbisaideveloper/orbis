// js/ui-chat.js
window.dispatchToAI = function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value;
    if (!msg) return;

    window.printLog('INFO', 'Chat: Dispatching to Router...');
    
    // রাউটার চেক করা হচ্ছে
    if (typeof window.WorkflowRouter !== 'undefined') {
        window.WorkflowRouter.route({ type: 'CHAT_MESSAGE', content: msg });
    } else {
        window.printLog('ERR', 'Router not initialized!');
    }

    promptBox.value = '';
};

window.updateChatUI = function(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-bubble ${sender === 'YOU' ? 'msg-user' : 'msg-ai'}`;
    msgDiv.innerHTML = `<span class="msg-label">${sender}</span>${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// ==========================================
// 🟢 NEW: পেজ রিলোড দিলে মেমোরি প্রিন্ট করার ফাংশন
// ==========================================
window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    
    window.printLog('INFO', 'UI: Rendering chat history to screen...');
    
    // ইতিহাস লুপ করে স্ক্রিনে বাবল হিসেবে দেখানো হচ্ছে
    historyArray.forEach(item => {
        // ডেটাবেস থেকে পাওয়া role অনুযায়ী নাম সেট করা হচ্ছে
        const sender = item.role === 'user' ? 'YOU' : 'ORBIS';
        const messageText = item.content || item.message; // সেফটি চেক
        
        window.updateChatUI(sender, messageText);
    });
};
