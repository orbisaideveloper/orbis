// js/ui-router.js - Workflow Router (Final Synchronization)

window.WorkflowRouter = {
    internalCommands: ['health', 'telemetry', 'workflow', 'memory', 'status', 'logs', 'verify', 'update'],

    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload...');
        if(window.EventBus) window.EventBus.emit('WorkflowStarted', payload);

        if (payload.type === 'CHAT_MESSAGE') {
            window.updateChatUI('YOU', payload.content);

            const msg = payload.content.toLowerCase();
            const isInternal = this.internalCommands.some(cmd => msg.includes(cmd));

            if (isInternal) {
                window.updateChatUI('ORBIS', `সিস্টেম প্রসেসড: '${payload.content}' কমান্ডটি সচল।`);
            } else {
                window.updateChatUI('ORBIS', `Gemini-এর সাথে যোগাযোগ করা হচ্ছে...`);
                
                try {
                    // API Gateway কল করছে
                    const response = await window.APIGateway.call('gemini', { prompt: payload.content });
                    
                    if (response && response.status === 'success') {
                        // '.text' বাদ দেওয়া হয়েছে, এখন সরাসরি response.data বসবে
                        window.updateChatUI('ORBIS', response.data || "রেসপন্স পাওয়া গেছে।");
                    } else {
                        window.updateChatUI('ORBIS', `ত্রুটি: ${response.message || 'API কানেকশনে সমস্যা হচ্ছে।'}`);
                    }
                } catch (err) {
                    window.updateChatUI('ORBIS', `সিস্টেম এরর: ${err.message}`);
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Connected to API.');
});
