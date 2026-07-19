// frontend/js/ui-api.js - Frontend API Gateway
/**
 * APIGateway: Manages synchronous communication with ORBIS Core Backend.
 * Updated: Phase 8.1 - Added Security Token for API Gateway
 */
window.APIGateway = {
    // 🟢 হেল্পার: টোকেন নেওয়ার জন্য
    getHeaders: function() {
        const headers = { 'Content-Type': 'application/json' };
        
        // Optional Chaining added for cleaner code
        const token = window.StorageEngine?.getAuthToken?.();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        return headers;
    },

    fetchHistory: async function(sessionId = 'default_user') {
        window.printLog('INFO', `API: Fetching chat history...`);
        try {
            const response = await fetch(`/api/history?sessionId=${sessionId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Optional Chaining applied
                window.globalEventBus?.emit?.('MemoryRestored', result.history);
                return { status: 'success', data: result.history };
            } 
            
            return { status: 'error', message: result.error || 'Failed to fetch history' };
            
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

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload) 
            });

            const textResponse = await response.text();
            
            // 🟢 ফিক্স: Complexity কমানোর জন্য বাকি প্রসেসিং হেল্পার ফাংশনে পাঠানো হলো
            return this._handleChatResponse(response, textResponse);
            
        } catch (error) {
            window.printLog('ERR', `API Gateway: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    },

    // --- Private Helper Methods (To reduce Cognitive Complexity) ---

    _handleChatResponse: function(response, textResponse) {
        try {
            const result = JSON.parse(textResponse);
            
            if (!response.ok || !result.success) {
                const errMsg = result.error || result.message || 'API Error';
                window.printLog('ERR', `API Error: ${errMsg}`);
                return { status: 'error', message: errMsg };
            }
            
            return this._processSuccessfulReply(result.response);
            
        } catch (error) {
            // 🟢 ফিক্স: Catch ব্লকে error অবজেক্টটি ব্যবহার করে exception handle করা হলো
            window.printLog('ERR', `API Gateway Parse Error: ${error.message}`);
            return { status: 'error', message: 'সার্ভার থেকে সঠিক ডেটা আসেনি (Wrong Endpoint)' };
        }
    },

    _processSuccessfulReply: function(aiReply) {
        const isString = typeof aiReply === 'string';
        const isSystemError = isString && (aiReply.includes('[API Error]') || aiReply.includes('quota') || aiReply.includes('503'));
        const isBrainFallback = isString && aiReply.includes('[Local Brain Active]');

        if (isSystemError) {
            window.printLog('ERR', 'API Quota/Error Detected!');
            
            // 🟢 ফিক্স: SonarCloud-এর পরামর্শ অনুযায়ী Optional Chaining (?.) ব্যবহার করা হলো
            window.Dashboard?.triggerError?.('Gemini API', 'Server busy/quota limit.', aiReply);
            window.Dashboard?.updateModuleState?.('router', 'ready');
            
            return { status: 'success', data: aiReply }; 
        }

        if (isBrainFallback) {
            window.printLog('OK', 'Core: Local Autonomous Mind responded successfully.');
        } else {
            window.printLog('OK', 'Core: Response generated and dispatched successfully.');
        }

        return { status: 'success', data: aiReply };
    }
};
