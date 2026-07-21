// 📝 user-view.js (ORBIS Integrated Version)

window.LotteryUserUI = {
    db: {
        parties: JSON.parse(localStorage.getItem('dl_parties')) || [],
        saveParties: function(data) { localStorage.setItem('dl_parties', JSON.stringify(data)); this.parties = data; }
    },

    currentUser: { orb_id: 'ORB-ADMIN', name: 'Arkadip Saha', role: 'ADMIN', mahajan_name: null },

    // 🚀 BATCH PRE-LOADER: লটারি মডিউলে ঢোকার সাথে সাথে সাব-মডিউল কানেক্ট হবে
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
        console.log("[System] Lottery sub-modules pre-loaded and connected.");
    },

    mount: function() {
        console.log("Lottery Module Mount Triggered!");
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
            // ফুলস্ক্রিন অ্যাপের মতো স্টাইল
            workspace.style.position = "absolute";
            workspace.style.top = "0";
            workspace.style.left = "0";
            workspace.style.width = "100%";
            workspace.style.height = "100vh";
            workspace.style.backgroundColor = "#f0f2f5";
            workspace.style.zIndex = "1000";
            workspace.style.overflowY = "auto";
            
            workspace.innerHTML = `
                <div style="background: #FF9933; color: white; padding: 15px 20px; display: flex; align-items: center; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100;">
                    <div id="erp-back-btn" onclick="if(window.orbisPlatform) window.orbisPlatform.unmountModule(); else window.LotteryUserUI.unmount();" style="cursor: pointer; font-size: 1.2rem; margin-right: 20px; padding: 5px;">
                        ← Back
                    </div>
                    <div style="font-size: 1.3rem; letter-spacing: 0.5px;">DigiLedger Lottery</div>
                </div>
                <div id="erp-dynamic-view" style="padding: 20px; padding-bottom: 50px;"></div>
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
                contentBox.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h3 style="color: #666;">⏳ Loading Sales Module...</h3>
                        <button onclick="window.LotteryUserUI.navigate('sales')" style="margin-top: 15px; padding: 10px 20px; background: #0056b3; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
                    </div>`;
            }
        } 
        else if (view === 'payment') {
            if (window.LotteryPaymentApp) {
                window.LotteryPaymentApp.mount(contentBox);
            } else {
                contentBox.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h3 style="color: #666;">⏳ Loading Payment Module...</h3>
                        <button onclick="window.LotteryUserUI.navigate('payment')" style="margin-top: 15px; padding: 10px 20px; background: #138808; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
                    </div>`;
            }
        }
        else if (view === 'dashboard') {
            contentBox.innerHTML = `
                <div style="text-align: center; max-width: 600px; margin: 0 auto; padding-top: 20px;">
                    <h2 style="color: #333; margin-bottom: 30px;">Workspace Area</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px;">
                        <div onclick="window.LotteryUserUI.navigate('sales')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; border: 2px solid transparent; transition: 0.3s;" onmouseover="this.style.borderColor='#FF9933'" onmouseout="this.style.borderColor='transparent'">
                            <div style="font-size: 3rem; margin-bottom: 15px;">🎟️</div>
                            <h3 style="margin: 0; color: #0056b3; font-size: 1.1rem;">Sales Entry</h3>
                        </div>
                        
                        <div onclick="window.LotteryUserUI.navigate('payment')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; border: 2px solid transparent; transition: 0.3s;" onmouseover="this.style.borderColor='#138808'" onmouseout="this.style.borderColor='transparent'">
                            <div style="font-size: 3rem; margin-bottom: 15px;">💰</div>
                            <h3 style="margin: 0; color: #138808; font-size: 1.1rem;">Payment</h3>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'block';
    }
};
