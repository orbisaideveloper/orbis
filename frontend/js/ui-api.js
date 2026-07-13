// js/ui-api.js - Frontend API Gateway
window.APIGateway = {
    // ==========================================
    // 🟢 NEW: সার্ভার থেকে পুরনো চ্যাট (Memory) টেনে আনার ফাংশন
    // ==========================================
    fetchHistory: async function(sessionId = 'default_user') {
        window.printLog('INFO', `API: Fetching chat history...`);
        try {
            // আমাদের নতুন তৈরি করা রাস্তায় রিকোয়েস্ট যাচ্ছে
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

    // ==========================================
    // (আগের কোড) চ্যাট মেসেজ পাঠানোর ফাংশন
    // ==========================================
    call: async function(endpoint, data) {
        window.printLog('INFO', `API: Calling backend (/api/chat)...`);
        
        try {
            // সার্ভারের সঠিক রাউট /api/chat-এ রিকোয়েস্ট পাঠানো হচ্ছে
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) // এখানে { prompt: "..." } যাচ্ছে
            });

            const textResponse = await response.text();
            
            try {
                // রেসপন্সটাকে JSON এ কনভার্ট করার চেষ্টা
                const result = JSON.parse(textResponse);
                
                if (response.ok && result.success) {
                    // সার্ভার থেকে { success: true, response: "উত্তর" } আসছে
                    return { status: 'success', data: result.response };
                } else {
                    return { status: 'error', message: result.error || result.message || 'API Error' };
                }
            } catch (e) {
                // যদি JSON না হয়ে HTML আসে, তবে এরর ধরবে
                window.printLog('ERR', `API Gateway: HTML response received.`);
                return { status: 'error', message: 'সার্ভার থেকে সঠিক ডেটা আসেনি (Wrong Endpoint)' };
            }
        } catch (error) {
            window.printLog('ERR', `API Gateway: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }
};
