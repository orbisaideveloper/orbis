// js/ui-api.js - Direct API Gateway
window.APIGateway = {
    // এখানে তোমার রেন্ডারে যেভাবে API Key দেওয়া আছে, সেই অনুযায়ী এটি কল করবে
    // যেহেতু তুমি বলেছ এটি রেন্ডারে নরমাল ফাইলে কনফিগার করা আছে, 
    // আমরা সরাসরি এন্ডপয়েন্ট কল করব।
    
    call: async function(endpoint, data) {
        window.printLog('INFO', `API: Calling ${endpoint}...`);
        
        try {
            // রেন্ডারের সাথে কমিউনিকেশন করার জন্য তোমার আগের সেই এন্ডপয়েন্টটি ব্যবহার করো
            // আমি এখানে একটা স্ট্যান্ডার্ড এন্ডপয়েন্ট দিচ্ছি, তোমার যদি অন্য কিছু থাকে তবে সেটি বসিয়ে দিও
            const response = await fetch('/api/gemini', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                return { status: 'success', data: result };
            } else {
                return { status: 'error', message: result.error?.message || 'API Error' };
            }
        } catch (error) {
            window.printLog('ERR', `API Gateway: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }
};
