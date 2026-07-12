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
