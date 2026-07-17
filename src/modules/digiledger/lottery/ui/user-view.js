// 📝 user-view.js (UPDATED: Batch Pre-loader Engine)

window.LotteryUserUI = {
    db: {
        parties: JSON.parse(localStorage.getItem('dl_parties')) || [],
        saveParties: function(data) { localStorage.setItem('dl_parties', JSON.stringify(data)); this.parties = data; }
    },

    currentUser: { orb_id: 'ORB-ADMIN', name: 'Arkadip Saha', role: 'ADMIN', mahajan_name: null },

    // 🚀 BATCH PRE-LOADER: লটারি মডিউলে ঢোকার সাথে সাথে সব কানেক্ট হবে
    preloadModules: function() {
        const modules = [
            { name: 'LotterySalesApp', path: '/modules/digiledger/lottery/ui/lottery-app.js' },
            { name: 'LotteryPaymentApp', path: '/modules/digiledger/lottery/ui/payment-app.js' }
        ];

        modules.forEach(mod => {
            if (!window[mod.name]) {
                const script = document.createElement('script');
                script.src = mod.path + '?v=' + new Date().getTime();
                document.body.appendChild(script);
            }
        });
        console.log("[System] All modules pre-loaded and connected.");
    },

    mount: function() {
        // ১. আগে সব মডিউল লোড করে নিচ্ছি
        this.preloadModules();

        // ২. UI মাউন্ট করছি
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';
        
        // ... (আপনার আগের HTML কোডটি এখানে থাকবে)
        this.navigate('dashboard');
    },

    navigate: function(view) {
        const contentBox = document.getElementById('erp-dynamic-view');
        const backBtn = document.getElementById('erp-back-btn');

        // এখন আর আলাদা করে ফাইল ফেচ করতে হবে না, শুধু মাউন্ট করব!
        if (view === 'sales') {
            if (window.LotterySalesApp) {
                window.LotterySalesApp.mount(contentBox);
            } else {
                contentBox.innerHTML = "<h3>⏳ Loading Sales Module...</h3>";
            }
        } 
        else if (view === 'payment') {
            if (window.LotteryPaymentApp) {
                window.LotteryPaymentApp.mount(contentBox);
            } else {
                contentBox.innerHTML = "<h3>⏳ Loading Payment Module...</h3>";
            }
        }
        else {
            // ... (অন্যান্য রুট)
        }
    },
    // ... (বাকি ফাংশনগুলো একই থাকবে)
};
