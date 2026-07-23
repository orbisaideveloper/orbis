// 📝 user-view.js (DigiLedger Premium Dashboard - Indian Theme)

window.LotteryUserUI = {
    // 🟢 0. App Version Control (Updated for Party Master integration)
    APP_VERSION: "v1.1.2 (Premium Build)",

    // 🟢 1. Preload Modules with Cache Busting
    preloadModules: function() {
        const timestamp = new Date().getTime(); 
        const modules = [
            { name: 'LotterySalesApp', path: '/modules/digiledger/lottery/ui/lottery-app.js' },
            { name: 'LotteryPaymentApp', path: '/modules/digiledger/lottery/ui/payment-app.js' },
            { name: 'LotteryDispatchApp', path: '/modules/digiledger/lottery/ui/DispatchWorkspace.js' },
            // 🟢 UPDATED: Party Master ফাইলটা এখন মেইন রুট (Global Shared Registry) থেকে লোড হচ্ছে
            { name: 'PartyMaster', path: '/js/party-master.js' } 
        ];

        modules.forEach(mod => {
            if (!window[mod.name]) {
                const script = document.createElement('script');
                script.src = mod.path + '?v=' + timestamp;
                document.body.appendChild(script);
            }
        });
    },

    // 🟢 2. Dynamic Greeting Logic
    getGreeting: function() {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 শুভ সকাল';
        if (hour < 17) return '☀️ শুভ দুপুর';
        if (hour < 20) return '🌇 শুভ সন্ধ্যা';
        return '🌙 শুভ রাত্রি';
    },

    // 🟢 3. Universal Top Navigation for Inner Pages
    getTopNavBar: function(pageTitle) {
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.05);">
                <button onclick="window.LotteryUserUI.navigate('dashboard')" style="background: #ffffff; border: 1px solid #eee; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <span style="font-size: 1.2rem; color: #333;">◀</span>
                </button>
                <h2 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: 700; letter-spacing: 0.5px;">${pageTitle}</h2>
                <button onclick="window.LotteryUserUI.navigate('dashboard')" style="background: var(--saffron-light); border: 1px solid rgba(255,153,51,0.2); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(255,153,51,0.15);">
                    <span style="font-size: 1.2rem;">🏠</span>
                </button>
            </div>
        `;
    },

    // 🟢 4. Main Mount Function
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
            workspace.style.backgroundColor = "#FAFAFA"; 
            workspace.style.zIndex = "1000";
            workspace.style.overflowY = "auto";
            workspace.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
            
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';

        workspace.innerHTML = `
            <style>
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-up { animation: fadeUp 0.6s ease-out forwards; }
                
                #dl-sidebar {
                    position: fixed; top: 0; left: -280px; width: 260px; height: 100vh;
                    background: #ffffff; box-shadow: 4px 0 15px rgba(0,0,0,0.05);
                    transition: left 0.3s ease-in-out; z-index: 2000; display: flex; flex-direction: column;
                }
                #dl-sidebar.active { left: 0; }
                .sidebar-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.4); z-index: 1999; display: none; opacity: 0;
                    transition: opacity 0.3s ease;
                    backdrop-filter: blur(3px);
                }
                .sidebar-overlay.active { display: block; opacity: 1; }
                
                :root {
                    --saffron: #FF9933; --saffron-light: #FFF4EB; --saffron-dark: #CC7A29;
                    --green: #138808; --green-light: #E8F5E9; --green-dark: #0F6B06;
                    --white: #FFFFFF; --text-main: #333333; --text-muted: #666666;
                }

                .app-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px;
                }
                .app-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px; padding: 22px 10px;
                    text-align: center; cursor: pointer; 
                    border: 1px solid rgba(255,255,255,0.8);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.5);
                    transition: all 0.2s ease-out; position: relative; overflow: hidden;
                }
                .app-card::before {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px;
                }
                .app-card:active { transform: translateY(3px) scale(0.96); box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
                .app-card .icon { font-size: 2.8rem; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
                .app-card .title { font-size: 13px; font-weight: 700; color: var(--text-main); letter-spacing: 0.2px; }
                
                .card-sales::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
                .card-dispatch::before { background: linear-gradient(90deg, var(--saffron), #fbbf24); }
                .card-payment::before { background: linear-gradient(90deg, var(--green), #34d399); }
                .card-ledger::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
                .card-stock::before { background: linear-gradient(90deg, #ec4899, #f472b6); }
                .card-report::before { background: linear-gradient(90deg, #14b8a6, #2dd4bf); }
                /* 🟢 NEW: Styling for Party Master Card */
                .card-partymaster::before { background: linear-gradient(90deg, #f43f5e, #f97316); } 
                
                .summary-card {
                    flex: 1; border-radius: 16px; padding: 18px; position: relative; overflow: hidden;
                }
                .sc-saffron { background: var(--saffron-light); border: 1px solid rgba(255,153,51,0.3); }
                .sc-green { background: var(--green-light); border: 1px solid rgba(19,136,8,0.3); }
            </style>

            <div class="sidebar-overlay" id="dl-overlay"></div>
            <div id="dl-sidebar">
                <div style="background: linear-gradient(135deg, var(--saffron), #ffb366); padding: 30px 20px; color: white;">
                    <h2 style="margin: 0;">DigiLedger</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Lottery Management System</p>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px; font-size: 16px; color: var(--text-main); flex-grow: 1;">
                    <div style="cursor:pointer; padding:10px; border-radius:8px;" onclick="window.LotteryUserUI.navigate('dashboard'); window.LotteryUserUI.toggleSidebar();">🏠 Home / Dashboard</div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px;">⚙️ Settings</div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px;">👤 My Profile</div>
                    <div style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 20px;"></div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px; color: #dc3545;" onclick="window.LotteryUserUI.unmount()">🚪 Exit Module</div>
                </div>
                <div style="padding: 15px; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #eee;">
                    ${this.APP_VERSION}
                </div>
            </div>

            <div id="dl-dynamic-view" style="padding-bottom: 50px;"></div>
        `;

        document.getElementById('dl-overlay').addEventListener('click', () => this.toggleSidebar());
        this.navigate('dashboard');
    },

    // 🟢 5. Sidebar Toggle Logic
    toggleSidebar: function() {
        const sidebar = document.getElementById('dl-sidebar');
        const overlay = document.getElementById('dl-overlay');
        if(sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    },

    // 🟢 6. Navigation Router (Added Route for Party Master)
    navigate: function(view) {
        const contentBox = document.getElementById('dl-dynamic-view');
        if (!contentBox) return; 
        
        window.scrollTo(0, 0);

        if (view === 'sales') {
            window.LotterySalesApp ? window.LotterySalesApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Sales...</h3>";
        } 
        else if (view === 'payment') {
            window.LotteryPaymentApp ? window.LotteryPaymentApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Payment...</h3>";
        }
        else if (view === 'dispatch') {
            window.LotteryDispatchApp ? window.LotteryDispatchApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Dispatch...</h3>";
        }
        // 🟢 NEW: Route for Party Master
        else if (view === 'partymaster') {
            if (window.PartyMaster && typeof window.PartyMaster.mount === 'function') {
                window.PartyMaster.mount(contentBox);
            } else {
                contentBox.innerHTML = `
                    ${this.getTopNavBar("Party Master Error")}
                    <div style="padding:20px; text-align:center; color: #dc3545; background: white; margin: 20px; border-radius: 12px; border: 1px solid #f5c6cb;">
                        <h3>⚠️ Party Master Module Not Found!</h3>
                        <p>Please ensure party-master.js is loaded correctly.</p>
                    </div>`;
            }
        }
        else if (view === 'ledger') {
            contentBox.innerHTML = `
                ${this.getTopNavBar("Party Ledger")}
                <div style="padding: 20px;" class="animate-up">
                    <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #eee;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                        <h2 style="color: #333; margin-bottom: 10px;">Ledger Records</h2>
                        <p style="color: #888; font-size: 0.95rem;">Database connection is being established...</p>
                    </div>
                </div>
            `;
        }
        else if (view === 'stock') {
            contentBox.innerHTML = `
                ${this.getTopNavBar("Live Stock")}
                <div style="padding: 20px;" class="animate-up">
                    <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #eee;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📦</div>
                        <h2 style="color: #333; margin-bottom: 10px;">Stock Inventory</h2>
                        <p style="color: #888; font-size: 0.95rem;">Inventory tracking system loading...</p>
                    </div>
                </div>
            `;
        }
        else if (view === 'report') {
            contentBox.innerHTML = `
                ${this.getTopNavBar("Day Reports")}
                <div style="padding: 20px;" class="animate-up">
                    <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #eee;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📑</div>
                        <h2 style="color: #333; margin-bottom: 10px;">Daily Reports</h2>
                        <p style="color: #888; font-size: 0.95rem;">Compiling today's business data...</p>
                    </div>
                </div>
            `;
        }
        else if (view === 'dashboard') {
            const userName = "Rahul Das"; 
            const greeting = this.getGreeting();

            contentBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="window.LotteryUserUI.toggleSidebar()" style="background: none; border: none; font-size: 1.6rem; color: var(--text-main); cursor: pointer; padding: 0;">☰</button>
                    </div>
                    <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--green), #22c55e); color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.2rem; box-shadow: 0 4px 10px rgba(19, 136, 8, 0.25);">
                        ${userName.charAt(0)}
                    </div>
                </div>

                <div style="padding: 20px; max-width: 600px; margin: 0 auto;" class="animate-up">
                    
                    <div style="margin-bottom: 25px;">
                        <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px;">${greeting},</span>
                        <h1 style="margin: 5px 0 0 0; font-size: 2.2rem; color: var(--text-main); background: linear-gradient(90deg, var(--saffron) 0%, var(--green) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${userName}!
                        </h1>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 0.95rem;">Here is your business overview today.</p>
                    </div>

                    <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                        <div class="summary-card sc-saffron">
                            <div style="font-size: 0.75rem; color: var(--saffron-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">মার্কেটে বাকি</div>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--saffron); margin-top: 5px;">₹ 1,25,400</div>
                            <div style="position: absolute; right: -10px; bottom: -15px; opacity: 0.1; font-size: 4rem;">📉</div>
                        </div>
                        
                        <div class="summary-card sc-green">
                            <div style="font-size: 0.75rem; color: var(--green-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">পেমেন্ট দিতে হবে</div>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--green); margin-top: 5px;">₹ 45,000</div>
                            <div style="position: absolute; right: -10px; bottom: -15px; opacity: 0.1; font-size: 4rem;">📈</div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                        <h3 style="margin: 0; color: var(--text-main); font-size: 1.2rem; font-weight: 700;">Quick Actions</h3>
                    </div>
                    
                    <div class="app-grid">
                        <div class="app-card card-sales" onclick="window.LotteryUserUI.navigate('sales')">
                            <div class="icon">🎟️</div>
                            <div class="title">Sales Entry</div>
                        </div>
                        
                        <div class="app-card card-dispatch" onclick="window.LotteryUserUI.navigate('dispatch')">
                            <div class="icon">🚀</div>
                            <div class="title">Bulk Dispatch</div>
                        </div>

                        <!-- 🟢 NEW: Add Party Master Card (Inserted prominently) -->
                        <div class="app-card card-partymaster" onclick="window.LotteryUserUI.navigate('partymaster')">
                            <div class="icon">👥</div>
                            <div class="title">Add Party Master</div>
                        </div>

                        <div class="app-card card-payment" onclick="window.LotteryUserUI.navigate('payment')">
                            <div class="icon">💰</div>
                            <div class="title">Settle Payment</div>
                        </div>

                        <div class="app-card card-ledger" onclick="window.LotteryUserUI.navigate('ledger')">
                            <div class="icon">📊</div>
                            <div class="title">Party Ledger</div>
                        </div>

                        <div class="app-card card-stock" onclick="window.LotteryUserUI.navigate('stock')">
                            <div class="icon">📦</div>
                            <div class="title">Live Stock</div>
                        </div>

                        <div class="app-card card-report" onclick="window.LotteryUserUI.navigate('report')">
                            <div class="icon">📑</div>
                            <div class="title">Day Reports</div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 35px; color: #bbb; font-size: 12px; font-weight: 500;">
                        DigiLedger ${this.APP_VERSION}
                    </div>
                </div>
            `;
        }
    },
    
    // 🟢 7. Unmount
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'block';
    }
};
