// js/ui-events.js - Global Event Bus for decoupled communication

window.EventBus = {
    events: {},
    
    // Subscribe to an event (লিসেন করার জন্য)
    on: function(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    },
    
    // Publish an event (সিগন্যাল পাঠানোর জন্য)
    emit: function(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
        window.printLog('INFO', `Event Emitted: [${eventName}]`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Global Event Bus Initialized.');
});

// ========================================================
// 📱 UX Magic: Click outside to close Dashboard
// ========================================================
document.addEventListener('click', (event) => {
    const sidebar = document.getElementById('dev-sidebar');
    const chatSection = document.querySelector('.chat-section');
    
    // শুধু মোবাইলের স্ক্রিনে কাজ করবে (৯০০ পিক্সেলের কম)
    if (window.innerWidth <= 900 && sidebar && sidebar.style.display !== 'none') {
        // চ্যাট বক্সের ওপর ক্লিক করলে সাইডবার বন্ধ হবে
        if (chatSection.contains(event.target)) {
            if (typeof window.toggleSidebar === 'function') {
                window.toggleSidebar();
            } else {
                sidebar.style.display = 'none';
            }
            window.printLog('INFO', 'UX: Sidebar dismissed by click-outside.');
        }
    }
});
