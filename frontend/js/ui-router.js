// js/ui-router.js - Workflow Router (Delegating everything to the Brain) & Module Loader

window.WorkflowRouter = {
    route: async function(payload) {
        window.printLog('INFO', 'Router: Directing payload to ORBIS Core Brain...');
        if(window.EventBus) window.EventBus.emit('WorkflowStarted', payload);

        if (payload.type === 'CHAT_MESSAGE') {
            // ইউজারের মেসেজ স্ক্রিনে দেখানো
            window.updateChatUI('YOU', payload.content);

            // প্রসেসিং মেসেজ দেখানো
            window.updateChatUI('ORBIS', `ORBIS Core প্রসেস করছে...`);
            
            try {
                // কোনো ইন্টারসেপ্ট ছাড়া সরাসরি API Gateway এর মাধ্যমে ব্রেনে পাঠানো
                const response = await window.APIGateway.call('chat', { prompt: payload.content });
                
                if (response && response.status === 'success') {
                    // ব্রেন থেকে আসা আসল উত্তরটা দেখানো
                    window.updateChatUI('ORBIS', response.data || "রেসপন্স পাওয়া গেছে।");
                } else {
                    window.updateChatUI('ORBIS', `ত্রুটি: ${response.message || 'সিস্টেম কানেকশনে সমস্যা হচ্ছে।'}`);
                }
            } catch (err) {
                window.updateChatUI('ORBIS', `সিস্টেম এরর: ${err.message}`);
            }
        }
    }
};

// 🔌 ORBIS Universal Module Loader (Plug & Play System for Apps like Lottery)
window.ModuleRouter = {
    init: function() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        // পেজ রিলোড হলেও যেন সঠিক মডিউলে থাকে তার জন্য load ইভেন্ট
        window.addEventListener('load', this.handleRoute.bind(this)); 
    },

    handleRoute: function() {
        const hash = window.location.hash;
        const platformRoot = document.getElementById('orbis-platform-root');
        const mainLayout = document.querySelector('.main-layout');

        if (hash === '#lottery') {
            window.printLog('INFO', 'Router: Switching to Lottery Module...');
            
            // মেইন চ্যাট লেআউট লুকিয়ে প্ল্যাটফর্ম রুট ওপেন করা
            if (mainLayout) mainLayout.style.display = 'none';
            if (platformRoot) platformRoot.style.display = 'block';

            // লটারি মডিউল আগে থেকে লোড না থাকলে ডায়নামিক্যালি কল করা (Lazy Load)
            if (!window.LotteryUserUI) {
                window.printLog('WARN', 'Router: Lottery script not found in memory. Fetching from network...');
                const script = document.createElement('script');
                // আপনার লটারি ফাইলের সঠিক অ্যাড্রেস
                script.src = '/modules/digiledger/lottery/ui/user-view.js'; 
                document.body.appendChild(script);
            } else {
                // আগে থেকেই মেমোরিতে থাকলে শুধু মাউন্ট করা
                window.LotteryUserUI.mount();
            }
        } else if (hash === '' || hash === '#home') {
            window.printLog('INFO', 'Router: Returning to Main ORBIS Interface...');
            
            // ব্যাক করলে বা হোমে ফিরে এলে লটারি মডিউল আনমাউন্ট করে চ্যাট ভিউ ফিরিয়ে আনা
            if (window.LotteryUserUI && typeof window.LotteryUserUI.unmount === 'function') {
                window.LotteryUserUI.unmount();
            }
            if (platformRoot) platformRoot.style.display = 'none';
            if (mainLayout) mainLayout.style.display = 'flex'; 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Workflow Router Connected to Core API.');
    
    // Module Router ইনিশিয়ালাইজ করা
    window.ModuleRouter.init();
});
