// frontend/js/ui-api.js - Frontend API Gateway
/**
 * APIGateway: Manages synchronous communication with ORBIS Core Backend.
 * Updated: Phase 8.0 - Safe Payload Mapping & Autonomous Log Interception.
 */
window.APIGateway = {
    fetchHistory: async function(sessionId = 'default_user') {
        window.printLog('INFO', `API: Fetching chat history...`);
        try {
            const response = await fetch(`/api/history?sessionId=${sessionId}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                // গ্লোবাল ইভেন্ট বাসে জানিয়ে দেওয়া যে মেমোরি লোড হয়েছে
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
            // 🟢 ফিক্স: ব্যাকএন্ডের server.js এর সাথে সামঞ্জস্য রেখে পেলোড প্রম্পট ম্যাপিং নিশ্চিত করা হলো
            const payload = {
                prompt: typeof data === 'string' ? data : (data.prompt || data.content)
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });

            const textResponse = await response.text();
            
            try {
                const result = JSON.parse(textResponse);
                
                if (response.ok && result.success) {
                    let aiReply = result.response;
                    
                    // চেক করা হচ্ছে এটি কি এরর মেসেজ নাকি আমাদের লোকাল ব্রেইনের তৈরি করা স্বায়ত্তশাসিত মেসেজ
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
                        // 🟢 ফিক্স: লোকাল ব্রেইন অ্যাক্টিভ হলে ড্যাশবোর্ডে সাকসেস লগ পুশ হবে, ব্ল্যাক হোলে আটকাবে না
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
