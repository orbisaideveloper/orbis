// js/ui-router.js - Workflow Router (Updated API Call Simulation)

window.WorkflowRouter = {
    // অরবিসের নিজস্ব কমান্ড লিস্ট
    internalCommands: ['health', 'telemetry', 'workflow', 'memory', 'status', 'logs', 'verify', 'update'],

    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload to Brain...');
        
        if(window.EventBus) {
            window.EventBus.emit('WorkflowStarted', payload);
        }

        if (payload.type === 'CHAT_MESSAGE') {
            // ইউজার মেসেজ ডিসপ্লে করা
            window.updateChatUI('YOU', payload.content);

            // ব্রেইন লজিক: চেক করা হচ্ছে এটা ইন্টারনাল কমান্ড কি না
            const msg = payload.content.toLowerCase();
            const isInternal = this.internalCommands.some(cmd => msg.includes(cmd));

            setTimeout(() => {
                if (isInternal) {
                    // অরবিসের নিজস্ব রিপ্লাই
                    window.updateChatUI('ORBIS', `সিস্টেম প্রসেসড: '${payload.content}' কমান্ডটি সফলভাবে রান করেছে।`);
                } else {
                    // প্রোভাইডারকে কল করার সিগন্যাল
                    window.updateChatUI('ORBIS', `প্রোভাইডার 'Gemini'-এর কাছে রিকোয়েস্ট পাঠানো হচ্ছে...`);
                    
                    // ২ সেকেন্ড পর জেমিনির রিপ্লাই সিমুলেশন (আসল API কানেক্ট করার আগ পর্যন্ত)
                    setTimeout(() => {
                        window.updateChatUI('ORBIS (Gemini API)', `হ্যালো! আমি অরবিস। আপনার মেসেজ "${payload.content}" আমি রিসিভ করেছি। (Note: Real API needs to be connected next)`);
                        window.printLog('OK', 'API Response Received.');
                    }, 2000);
                }
            }, 500);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Initialized.');
});
