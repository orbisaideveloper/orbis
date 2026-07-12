// js/ui-router.js - Workflow Router (Final Optimized Version)

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
                
                // জেমিনির জন্য সঠিক JSON স্ট্রাকচার
                const apiData = {
                    contents: [{ parts: [{ text: payload.content }] }]
                };
                
                try {
                    const response = await window.APIGateway.call('gemini', apiData);
                    
                    if (response.status === 'success') {
                        const aiText = response.data.candidates[0].content.parts[0].text;
                        window.updateChatUI('ORBIS (Gemini)', aiText);
                    } else {
                        window.updateChatUI('ORBIS', `ত্রুটি: ${response.message}`);
                    }
                } catch (err) {
                    window.updateChatUI('ORBIS', `সিস্টেম এরর: ${err.message}`);
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Ready.');
});
