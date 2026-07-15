// frontend/js/ui-api.js - Frontend API Gateway
/**
 * APIGateway: Manages synchronous communication with ORBIS Core Backend.
 * Updated: Phase 8.1 - Added Security Token for API Gateway
 */
window.APIGateway = {
    // 🟢 হেল্পার: টোকেন নেওয়ার জন্য
    getHeaders: function() {
        const headers = { 'Content-Type': 'application/json' };
        if (window.StorageEngine) {
            const token = window.StorageEngine.getAuthToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    fetchHistory: async function(sessionId = 'default_user') {
        window.printLog('INFO', `API: Fetching chat history...`);
        try {
            // 🟢 ফিক্স: Authorization হেডার যুক্ত করা হলো
            const response = await fetch(`/api/history?sessionId=${sessionId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                if (window.globalEventBus) {
                    window.globalEventBus.emit('MemoryRestored', result.history);
                }
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
            const payload = {
                prompt: typeof data === 'string' ? data : (data.prompt || data.content)
            };

            // 🟢 ফিক্স: Authorization হেডার যুক্ত করা হলো
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload) 
            });

            const textResponse = await response.text();
            
            try {
                const result = JSON.parse(textResponse);
                
                if (response.ok && result.success) {
                    let aiReply = result.response;
                    
                    const isSystemError = (typeof aiReply === 'string' && (aiReply.includes('[API Error]') || aiReply.includes('quota') || aiReply.includes('503')));
                    const isBrainFallback = (typeof aiReply === 'string' && aiReply.includes('[Local Brain Active]'));

                    if (isSystemError) {
                        window.printLog('ERR', 'API Quota/Error Detected!');
                        if (window.Dashboard && window.Dashboard.triggerError) {
                            window.Dashboard.triggerError('Gemini API', 'Server busy/quota limit.', aiReply);
                            window.Dashboard.updateModuleState('router', 'ready'); 
                        }
                        return { status: 'success', data: aiReply }; 
                    }

                    if (isBrainFallback) {
                        window.printLog('OK', 'Core: Local Autonomous Mind responded successfully.');
                    } else {
                        window.printLog('OK', 'Core: Response generated and dispatched successfully.');
                    }

                    return { status: 'success', data: aiReply };

                } else {
                    window.printLog('ERR', `API Error: ${result.error || result.message}`);
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
