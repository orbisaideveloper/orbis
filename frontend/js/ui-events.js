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
