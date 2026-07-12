// js/ui-router.js - Workflow Router (Integrated with existing API Gateway)

window.WorkflowRouter = {
    // অরবিসের নিজস্ব ইন্টারনাল কমান্ডস
    internalCommands: ['health', 'telemetry', 'workflow', 'memory', 'status', 'logs', 'verify', 'update'],

    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload...');
        
        // ইভেন্ট বাসকে জানানো হচ্ছে
        if(window.EventBus) window.EventBus.emit('WorkflowStarted', payload);

        if (payload.type === 'CHAT_MESSAGE') {
            // ইউজার মেসেজ ডিসপ্লে করা
            window.updateChatUI('YOU', payload.content);

            const msg = payload.content.toLowerCase();
            const isInternal = this.internalCommands.some(cmd => msg.includes(cmd));

            if (isInternal) {
                // ইন্টারনাল কমান্ড হলে অরবিস নিজেই রিপ্লাই দিবে
                window.updateChatUI('ORBIS', `সিস্টেম প্রসেসড: '${payload.content}' কমান্ডটি সচল।`);
            } else {
                // এক্সটার্নাল মেসেজ হলে তোমার আগের তৈরি APIGateway কে কল করবে
                window.updateChatUI('ORBIS', `Gemini-এর সাথে যোগাযোগ করা হচ্ছে...`);
                
                try {
                    // তোমার আগের বানানো APIGateway কে কল করা হচ্ছে
                    const response = await window.APIGateway.call('gemini', { prompt: payload.content });
                    
                    if (response && response.status === 'success') {
                        // তোমার এপিআই থেকে আসা ডেটা ডিসপ্লে করা
                        window.updateChatUI('ORBIS', response.data || "রেসপন্স পাওয়া গেছে।");
                    } else {
                        window.updateChatUI('ORBIS', `ত্রুটি: এপিআই থেকে ডেটা পাওয়া যায়নি।`);
                    }
                } catch (err) {
                    window.updateChatUI('ORBIS', `সিস্টেম এরর: ${err.message}`);
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Connected to API Gateway.');
});
