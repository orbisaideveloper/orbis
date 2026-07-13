// js/ui-core.js
window.printLog = function(level, msg) {
    const logBox = document.getElementById('log-box');
    if (!logBox) return;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logEntry = document.createElement('div');
    logEntry.className = 'log-line';
    logEntry.innerHTML = `<span style="opacity:0.6">[${time}]</span> <strong style="color:${level === 'ERR' ? '#ff4d4d' : '#138808'}">${level}:</strong> ${msg}`;
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight;
};

// তোমার CSS-এর সাথে ম্যাচ করার জন্য এই টগল ফাংশনটি একদম ঠিক আছে
window.toggleSidebar = function() {
    const sidebar = document.getElementById('dev-sidebar');
    if (sidebar.style.display === 'flex') {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    window.printLog('OK', 'Core Engine Initialized.');

    // ==========================================
    // 🟢 NEW: পেজ লোড হলেই মেমোরি থেকে ডেটা টানা হচ্ছে
    // ==========================================
    if (window.APIGateway && window.APIGateway.fetchHistory) {
        window.printLog('INFO', 'System: Loading permanent memory from Supabase...');
        
        const response = await window.APIGateway.fetchHistory('default_user');
        
        if (response.status === 'success' && response.data && response.data.length > 0) {
            window.printLog('OK', `System: Found ${response.data.length} previous messages.`);
            
            // ⚠️ এখানেই মেসেজগুলো চ্যাটবক্সে প্রিন্ট করার লজিক বসবে
            // যা আমরা ui-chat.js ফাইলে পাব।
            if (window.renderHistoryMessages) {
                window.renderHistoryMessages(response.data);
            }
        } else {
            window.printLog('INFO', 'System: No previous memory found. Starting fresh.');
        }
    }
});
