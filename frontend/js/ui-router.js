// js/ui-router.js - Workflow Router (Brain-Integrated without Module Import)

window.WorkflowRouter = {
    // অরবিসের নিজস্ব কমান্ড লিস্ট (DecisionManager-এর মতো)
    internalCommands: ['health', 'telemetry', 'workflow', 'memory', 'status', 'logs', 'verify', 'update'],

    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload to Brain...');
        
        if(window.EventBus) {
            window.EventBus.emit('WorkflowStarted', payload);
        }

        if (payload.type === 'CHAT_MESSAGE') {
            window.updateChatUI('YOU', payload.content);

            // ব্রেইন লজিক: চেক করা হচ্ছে এটা ইন্টারনাল কমান্ড কি না
            const msg = payload.content.toLowerCase();
            const isInternal = this.internalCommands.some(cmd => msg.includes(cmd));

            setTimeout(() => {
                if (isInternal) {
                    // অরবিস নিজেই উত্তর দেবে (ইন্টারনাল কমান্ড)
                    const internalResponse = `অরবিস সিস্টেম: '${payload.content}' কমান্ডটি সফলভাবে প্রসেস করা হয়েছে। সিস্টেম এখন পুরোপুরি সচল।`;
                    window.updateChatUI('ORBIS', internalResponse);
                } else {
                    // জেমিনি বা অন্য প্রোভাইডারকে কল করার সিমুলেশন
                    window.updateChatUI('ORBIS', `প্রোভাইডার 'Gemini'-এর কাছে রিকোয়েস্ট পাঠানো হচ্ছে...`);
                }
            }, 500); // হালকা ডিলে দেওয়া হলো যাতে রিয়েলিস্টিক লাগে
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router & Brain Integrated.');
});
