// js/ui-api.js - Frontend API Gateway
window.APIGateway = {
    fetchHistory: async function(sessionId = 'default_user') {
        window.printLog('INFO', `API: Fetching chat history...`);
        try {
            const response = await fetch(`/api/history?sessionId=${sessionId}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                return { status: 'success', data: result.history };
            } else {
                return { status: 'error', message: result.error || 'Failed to fetch history' };
            }
        } catch (error) {
            window.printLog('ERR', `API Gateway (History): ${error.message}`);
            return { status: 'error', message: error.message };
        }
    },

    call: async function(endpoint, data) {
        window.printLog('INFO', `API: Calling backend (/api/chat)...`);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) 
            });

            const textResponse = await response.text();
            
            try {
                const result = JSON.parse(textResponse);
                
                // 🟢 যদি সার্ভার সফল (200 OK) রেসপন্স পাঠায়
                if (response.ok && result.success) {
                    let aiReply = result.response;
                    
                    // 🟢 স্মার্ট ছাঁকনি: যদি উত্তরটি সত্যি এরর মেসেজ হয় তবেই ড্যাশবোর্ড অ্যালার্ট দেবে
                    // আমরা এখন চেক করছি এটা কি জেমিনি এরর নাকি আমাদের ব্রেইনের তৈরি করা ফলব্যাক মেসেজ
                    const isSystemError = (typeof aiReply === 'string' && (aiReply.includes('[API Error]') || aiReply.includes('quota') || aiReply.includes('503')));
                    const isBrainFallback = (typeof aiReply === 'string' && aiReply.includes('[Local Brain Active]'));

                    if (isSystemError) {
                        window.printLog('ERR', 'API Quota/Error Detected!');
                        
                        if (window.Dashboard && window.Dashboard.triggerError) {
                            window.Dashboard.triggerError('Gemini API', 'Server busy/quota limit.', aiReply);
                            window.Dashboard.updateModuleState('router', 'ready'); 
                        }

                        // এরর হলে পুরনো হার্ডকোড করা মেসেজ না দেখিয়ে ব্রেইনের ফলব্যাক বা এরর ডিটেইলস দেখাবে
                        return { status: 'success', data: aiReply }; 
                    }

                    // 🟢 ব্রেইনের স্মার্ট উত্তর বা স্বাভাবিক উত্তর হলে সরাসরি পাস করবে
                    return { status: 'success', data: aiReply };

                } else {
                    return { status: 'error', message: result.error || result.message || 'API Error' };
                }
            } catch (e) {
                window.printLog('ERR', `API Gateway: HTML response received.`);
                return { status: 'error', message: 'সার্ভার থেকে সঠিক ডেটা আসেনি (Wrong Endpoint)' };
            }
        } catch (error) {
            window.printLog('ERR', `API Gateway: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }
};
