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
                
                if (response.ok && result.success) {
                    let aiReply = result.response;
                    
                    // ==========================================
                    // 🚨 THE ERROR INTERCEPTOR (ম্যাজিক ছাঁকনি)
                    // ==========================================
                    if (typeof aiReply === 'string' && (aiReply.includes('[API Error]') || aiReply.includes('quota') || aiReply.includes('429'))) {
                        
                        window.printLog('ERR', 'API Quota/Error Detected!');
                        
                        // ড্যাশবোর্ডে লাল অ্যালার্ট পাঠানো এবং রাউটার ফ্রি করা
                        if (window.Dashboard && window.Dashboard.triggerError) {
                            window.Dashboard.triggerError('Gemini API', 'Quota Exceeded or Connection Error. Please wait a minute.', aiReply);
                            window.Dashboard.updateModuleState('router', 'ready'); 
                            window.Dashboard.updateWorkflow('wf-user'); 
                        }

                        // চ্যাট বক্সে হিজিবিজি না দেখিয়ে মানুষের ভাষার মেসেজ
                        return { 
                            status: 'success', 
                            data: 'দুঃখিত, গুগলের সার্ভারে এই মুহূর্তে একটু চাপ যাচ্ছে (Quota Overload)। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন।' 
                        };
                    }

                    // কোনো এরর না থাকলে স্বাভাবিক উত্তর যাবে
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
