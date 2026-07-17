// 📝 user-view.js (UPDATED: Robust Mount Engine)

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
        // ১. সব মডিউল প্রিলোড করা
        this.preloadModules();

        // ২. মেইন প্ল্যাটফর্ম হাইড করা
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        // ৩. ওয়ার্কস্পেস তৈরি বা আপডেট করা
        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            workspace.innerHTML = `
                <div id="erp-back-btn" style="padding: 10px; cursor: pointer; background: #eee;">← Back</div>
                <div id="erp-dynamic-view"></div>
            `;
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';
        
        // ৪. ড্যাশবোর্ড নেভিগেট করা
        this.navigate('dashboard');
    },

    navigate: function(view) {
        const contentBox = document.getElementById('erp-dynamic-view');
        if (!contentBox) return; // নিরাপত্তা চেক

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
        else if (view === 'dashboard') {
            contentBox.innerHTML = "<h3>Welcome to Lottery Dashboard</h3><button onclick='window.LotteryUserUI.navigate(\"sales\")'>Sales</button>";
        }
    },
    
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'block';
    }
};
