// js/ui-api.js - Central API Gateway
window.APIGateway = {
    apiKey: "তোমার_API_KEY", // এখানে রেন্ডারের কি-টি দাও

    call: async function(endpoint, data) {
        window.printLog('INFO', `API: Calling ${endpoint}...`);
        
        // এখানে তোমার আগের সেই ইউআরএলটি বসাও যা তোমার জন্য কাজ করেছিল
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                return { status: 'success', data: result };
            } else {
                return { status: 'error', message: result.error?.message || 'Unknown Error' };
            }
        } catch (error) {
            window.printLog('ERR', `API: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }
};
