// 📝 user-view.js (ORBIS Integrated Version - with 4 Modules)

window.LotteryUserUI = {
    preloadModules: function() {
        const modules = [
            { name: 'LotterySalesApp', path: '/modules/digiledger/lottery/ui/lottery-app.js' },
            { name: 'LotteryPaymentApp', path: '/modules/digiledger/lottery/ui/payment-app.js' },
            // নতুন Dispatch ফাইলটা প্রি-লোড করা হচ্ছে
            { name: 'LotteryDispatchApp', path: '/modules/digiledger/lottery/ui/DispatchWorkspace.js' } 
        ];

        modules.forEach(mod => {
            if (!window[mod.name]) {
                const script = document.createElement('script');
                script.src = mod.path + '?v=' + new Date().getTime();
                document.body.appendChild(script);
            }
        });
    },

    mount: function() {
        this.preloadModules();
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            workspace.style.position = "absolute";
            workspace.style.top = "0";
            workspace.style.left = "0";
            workspace.style.width = "100%";
            workspace.style.height = "100vh";
            workspace.style.backgroundColor = "#f0f2f5";
            workspace.style.zIndex = "1000";
            workspace.style.overflowY = "auto";
            
            workspace.innerHTML = `
                <div style="background: #FF9933; color: white; padding: 15px 20px; display: flex; align-items: center; font-weight: bold; position: sticky; top: 0; z-index: 100;">
                    <div id="erp-back-btn" onclick="if(window.orbisPlatform) window.orbisPlatform.unmountModule(); else window.LotteryUserUI.unmount();" style="cursor: pointer; font-size: 1.2rem; margin-right: 20px;">
                        ← Back
                    </div>
                    <div style="font-size: 1.3rem;">DigiLedger Lottery</div>
                    <div onclick="window.LotteryUserUI.navigate('dashboard')" style="margin-left: auto; cursor: pointer; font-size: 1.5rem;">🏠</div>
                </div>
                <div id="erp-dynamic-view" style="padding: 20px; padding-bottom: 50px;"></div>
            `;
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';
        this.navigate('dashboard');
    },

    navigate: function(view) {
        const contentBox = document.getElementById('erp-dynamic-view');
        if (!contentBox) return; 

        if (view === 'sales') {
            window.LotterySalesApp ? window.LotterySalesApp.mount(contentBox) : contentBox.innerHTML = "<h3>⏳ Loading...</h3>";
        } 
        else if (view === 'payment') {
            window.LotteryPaymentApp ? window.LotteryPaymentApp.mount(contentBox) : contentBox.innerHTML = "<h3>⏳ Loading...</h3>";
        }
        else if (view === 'dispatch') {
            // নতুন গ্লাস ডিজাইনের ডিসপ্যাচ
            window.LotteryDispatchApp ? window.LotteryDispatchApp.mount(contentBox) : contentBox.innerHTML = "<h3>⏳ Loading Dispatch...</h3>";
        }
        else if (view === 'ledger') {
            // পার্টি লেজারের ডামি পেজ (লজিক পরে যোগ করব)
            contentBox.innerHTML = `
                <div style="text-align: center; padding: 50px; background: white; border-radius: 12px;">
                    <h2 style="color: #6f42c1;">📊 Party Ledger</h2>
                    <p style="color: #666; font-size: 1.1rem;">Under Construction: Data binding is in progress...</p>
                    <button onclick="window.LotteryUserUI.navigate('dashboard')" style="margin-top: 20px; padding: 10px 20px; background: #FF9933; color: white; border: none; border-radius: 5px;">Go Back</button>
                </div>
            `;
        }
        else if (view === 'dashboard') {
            contentBox.innerHTML = `
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; margin-bottom: 30px;">Workspace Area</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px;">
                        
                        <!-- Sales Button -->
                        <div onclick="window.LotteryUserUI.navigate('sales')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer;">
                            <div style="font-size: 3rem; margin-bottom: 15px;">🎟️</div>
                            <h3 style="margin: 0; color: #0056b3; font-size: 1.1rem;">Sales Entry</h3>
                        </div>
                        
                        <!-- Payment Button -->
                        <div onclick="window.LotteryUserUI.navigate('payment')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer;">
                            <div style="font-size: 3rem; margin-bottom: 15px;">💰</div>
                            <h3 style="margin: 0; color: #138808; font-size: 1.1rem;">Payment</h3>
                        </div>

                        <!-- NEW: Dispatch / Bulk Entry -->
                        <div onclick="window.LotteryUserUI.navigate('dispatch')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; border: 2px solid #17a2b8;">
                            <div style="font-size: 3rem; margin-bottom: 15px;">🚀</div>
                            <h3 style="margin: 0; color: #17a2b8; font-size: 1.1rem;">Dispatch Grid</h3>
                        </div>

                        <!-- NEW: Party Ledger -->
                        <div onclick="window.LotteryUserUI.navigate('ledger')" style="background: white; padding: 30px 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer;">
                            <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                            <h3 style="margin: 0; color: #6f42c1; font-size: 1.1rem;">Party Ledger</h3>
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
