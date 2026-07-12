// js/ui-router.js - Workflow Router (Brain-Integrated)
import { DecisionManager } from '../src/brain/decision/DecisionManager.js';

const brain = new DecisionManager();

window.WorkflowRouter = {
    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload to Brain...');
        window.EventBus.emit('WorkflowStarted', payload);

        if (payload.type === 'CHAT_MESSAGE') {
            window.updateChatUI('YOU', payload.content);

            // ব্রেইনকে জিজ্ঞেস করছি সিদ্ধান্ত নেওয়ার জন্য
            const decision = brain.evaluateTask('CHAT', payload.content);

            if (decision.type === 'INTERNAL') {
                // অরবিস নিজেই উত্তর দেবে (ইন্টারনাল কমান্ড)
                const internalResponse = `অরবিস সিস্টেম: '${payload.content}' কমান্ডটি সফলভাবে প্রসেস করা হয়েছে। সিস্টেম এখন পুরোপুরি সচল।`;
                window.updateChatUI('ORBIS', internalResponse);
            } else {
                // জেমিনি বা অন্য প্রোভাইডারকে কল করার সিমুলেশন
                window.updateChatUI('ORBIS', `প্রোভাইডার '${decision.name}'-এর কাছে রিকোয়েস্ট পাঠানো হচ্ছে...`);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router & Brain Integrated.');
});
