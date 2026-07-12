// js/ui-chat.js - Chat Engine (Optimized for Event Bus)

window.dispatchToAI = function() {
    const promptBox = document.getElementById('prompt-box');
    const msg = promptBox.value;
    if (!msg) return;

    window.printLog('INFO', 'Chat: Dispatching message to Router...');
    
    // UI থেকে ডাটা সরাসরি রাউটারে পাঠানো হচ্ছে
    // এটি এখন আর সরাসরি চ্যাট ফাংশন কল করবে না, বরং ইভেন্ট বাসের মাধ্যমে কাজ করবে
    window.WorkflowRouter.route({
        type: 'CHAT_MESSAGE',
        content: msg
    });

    // ইনপুট বক্স পরিষ্কার করা
    promptBox.value = '';
};

// চ্যাট ডিসপ্লে আপডেট করার ফাংশন
window.updateChatUI = function(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-bubble ${sender === 'YOU' ? 'msg-user' : 'msg-ai'}`;
    msgDiv.innerHTML = `<span class="msg-label">${sender}</span>${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Chat Engine Initialized & Connected to Router.');
});
