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

// 🟢 আপডেটেড: এখন সে ডেটাবেসের পুরনো সময় (timestamp) রিসিভ করতে পারবে
window.updateChatUI = function(sender, message, timestamp = null) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    
    let timeString = '';
    
    // যদি ডেটাবেস থেকে পুরনো সময় আসে, সেটা কনভার্ট করবে। নাহলে বর্তমান সময় নেবে।
    if (timestamp) {
        const dateObj = new Date(timestamp);
        timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
        timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    msgDiv.className = `msg-bubble ${sender === 'YOU' ? 'msg-user' : 'msg-ai'}`;
    
    // মেসেজের শেষে টাইমস্ট্যাম্পের স্প্যান যুক্ত করা হলো
    msgDiv.innerHTML = `<span class="msg-label">${sender}</span>${message}<span class="msg-time">${timeString}</span>`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// ==========================================
// পেজ রিলোড দিলে মেমোরি প্রিন্ট করার ফাংশন
// ==========================================
window.renderHistoryMessages = function(historyArray) {
    if (!historyArray || !Array.isArray(historyArray)) return;
    
    window.printLog('INFO', 'UI: Rendering chat history to screen...');
    
    // ইতিহাস লুপ করে স্ক্রিনে বাবল হিসেবে দেখানো হচ্ছে
    historyArray.forEach(item => {
        const sender = item.role === 'user' ? 'YOU' : 'ORBIS';
        const messageText = item.content || item.message; 
        
        // 🟢 ডেটাবেসের আসল সময়টা পাঠানো হচ্ছে
        const dbTime = item.created_at; 
        
        window.updateChatUI(sender, messageText, dbTime);
    });
};
