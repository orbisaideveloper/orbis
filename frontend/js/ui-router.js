// js/ui-router.js - Workflow Router (Delegating everything to the Brain)

window.WorkflowRouter = {
    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload to ORBIS Core Brain...');
        if(window.EventBus) window.EventBus.emit('WorkflowStarted', payload);

        if (payload.type === 'CHAT_MESSAGE') {
            // ইউজারের মেসেজ স্ক্রিনে দেখানো
            window.updateChatUI('YOU', payload.content);

            // প্রসেসিং মেসেজ দেখানো
            window.updateChatUI('ORBIS', `ORBIS Core প্রসেস করছে...`);
            
            try {
                // কোনো ইন্টারসেপ্ট ছাড়া সরাসরি API Gateway এর মাধ্যমে ব্রেনে পাঠানো
                const response = await window.APIGateway.call('chat', { prompt: payload.content });
                
                if (response && response.status === 'success') {
                    // ব্রেন থেকে আসা আসল উত্তরটা দেখানো
                    window.updateChatUI('ORBIS', response.data || "রেসপন্স পাওয়া গেছে।");
                } else {
                    window.updateChatUI('ORBIS', `ত্রুটি: ${response.message || 'সিস্টেম কানেকশনে সমস্যা হচ্ছে।'}`);
                }
            } catch (err) {
                window.updateChatUI('ORBIS', `সিস্টেম এরর: ${err.message}`);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Connected to Core API.');
});
