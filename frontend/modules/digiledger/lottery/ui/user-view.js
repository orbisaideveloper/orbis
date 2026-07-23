// 📝 user-view.js (DigiLedger Premium Dashboard - Indian Theme)

window.LotteryUserUI = {
    // 🟢 1. Preload Modules
    preloadModules: function() {
        const modules = [
            { name: 'LotterySalesApp', path: '/modules/digiledger/lottery/ui/lottery-app.js' },
            { name: 'LotteryPaymentApp', path: '/modules/digiledger/lottery/ui/payment-app.js' },
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

    // 🟢 2. Dynamic Greeting Logic
    getGreeting: function() {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 শুভ সকাল';
        if (hour < 17) return '☀️ শুভ দুপুর';
        if (hour < 20) return '🌇 শুভ সন্ধ্যা';
        return '🌙 শুভ রাত্রি';
    },

    // 🟢 3. Main Mount Function
    mount: function() {
        this.preloadModules();
        
        // Hide ORBIS root if exists
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
            workspace.style.backgroundColor = "#FAFAFA"; // Pure clean white-ish bg
            workspace.style.zIndex = "1000";
            workspace.style.overflowY = "auto";
            workspace.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
            
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';

        // ইউজারের নাম (ব্যাকএন্ড থেকে রিয়েল নাম আসবে, আপাতত ডেমো)
        const currentUserName = "Super Admin"; 

        workspace.innerHTML = `
            <style>
                /* Premium Animations & Glass Effects */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-up { animation: fadeUp 0.6s ease-out forwards; }
                
                /* Sidebar Styles */
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
                }
                .sidebar-overlay.active { display: block; opacity: 1; }
                
                /* Indian Theme Colors */
                :root {
                    --saffron: #FF9933; --saffron-light: #FFF4EB; --saffron-dark: #CC7A29;
                    --green: #138808; --green-light: #E8F5E9; --green-dark: #0F6B06;
                    --white: #FFFFFF; --text-main: #333333; --text-muted: #666666;
                }

                /* Mobile Friendly Action Grid */
                .app-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 25px;
                }
                .app-card {
                    background: var(--white); border-radius: 16px; padding: 20px 15px;
                    text-align: center; cursor: pointer; border: 1px solid #eee;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: 0.2s;
                }
                .app-card:active { transform: scale(0.95); }
                .app-card .icon { font-size: 2.5rem; margin-bottom: 10px; }
                .app-card .title { font-size: 14px; font-weight: 700; color: var(--text-main); }
                
                /* Summary Cards */
                .summary-card {
                    flex: 1; border-radius: 16px; padding: 18px; position: relative; overflow: hidden;
                }
                .sc-saffron { background: var(--saffron-light); border: 1px solid rgba(255,153,51,0.3); }
                .sc-green { background: var(--green-light); border: 1px solid rgba(19,136,8,0.3); }
            </style>

            <!-- Sidebar Menu -->
            <div class="sidebar-overlay" id="dl-overlay"></div>
            <div id="dl-sidebar">
                <div style="background: linear-gradient(135deg, var(--saffron), #ffb366); padding: 30px 20px; color: white;">
                    <h2 style="margin: 0;">DigiLedger</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Lottery Management System</p>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px; font-size: 16px; color: var(--text-main);">
                    <div style="cursor:pointer; padding:10px; border-radius:8px;" onclick="window.LotteryUserUI.navigate('dashboard'); window.LotteryUserUI.toggleSidebar();">🏠 Home / Dashboard</div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px;">⚙️ Settings</div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px;">👤 My Profile</div>
                    <div style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 20px;"></div>
                    <div style="cursor:pointer; padding:10px; border-radius:8px; color: #dc3545;" onclick="window.LotteryUserUI.unmount()">🚪 Exit Module</div>
                </div>
            </div>

            <!-- Main App Content -->
            <div id="dl-dynamic-view" style="padding-bottom: 50px;">
                <!-- Dashboard content will be injected here via navigate('dashboard') -->
            </div>
        `;

        // Event listener for overlay click to close sidebar
        document.getElementById('dl-overlay').addEventListener('click', this.toggleSidebar);
        
        // Load initial view
        this.navigate('dashboard');
    },

    // 🟢 4. Sidebar Toggle Logic
    toggleSidebar: function() {
        const sidebar = document.getElementById('dl-sidebar');
        const overlay = document.getElementById('dl-overlay');
        if(sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    },

    // 🟢 5. Navigation Router
    navigate: function(view) {
        const contentBox = document.getElementById('dl-dynamic-view');
        if (!contentBox) return; 

        if (view === 'sales') {
            window.LotterySalesApp ? window.LotterySalesApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px;'>⏳ Loading Sales...</h3>";
        } 
        else if (view === 'payment') {
            window.LotteryPaymentApp ? window.LotteryPaymentApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px;'>⏳ Loading Payment...</h3>";
        }
        else if (view === 'dispatch') {
            window.LotteryDispatchApp ? window.LotteryDispatchApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px;'>⏳ Loading Dispatch...</h3>";
        }
        else if (view === 'ledger') {
            contentBox.innerHTML = `
                <div style="padding: 20px;">
                    <div onclick="window.LotteryUserUI.navigate('dashboard')" style="cursor: pointer; font-size: 1.2rem; color: #333; margin-bottom:20px;">← Back to Home</div>
                    <div style="text-align: center; padding: 50px; background: white; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <h2 style="color: #6f42c1;">📊 Party Ledger</h2>
                        <p style="color: #666;">Data binding is in progress...</p>
                    </div>
                </div>
            `;
        }
        else if (view === 'dashboard') {
            const userName = "Rahul Das"; // ডাইনামিক নাম এখানে আসবে
            const greeting = this.getGreeting();

            contentBox.innerHTML = `
                <!-- Top Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--white); position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="window.LotteryUserUI.toggleSidebar()" style="background: none; border: none; font-size: 1.5rem; color: var(--text-main); cursor: pointer; padding: 0;">☰</button>
                    </div>
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--green), #22c55e); color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.2rem; box-shadow: 0 4px 8px rgba(19, 136, 8, 0.2);">
                        ${userName.charAt(0)}
                    </div>
                </div>

                <div style="padding: 20px; max-width: 600px; margin: 0 auto;" class="animate-up">
                    
                    <!-- Grand Welcome Section -->
                    <div style="margin-bottom: 25px;">
                        <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px;">${greeting},</span>
                        <h1 style="margin: 5px 0 0 0; font-size: 2rem; color: var(--text-main); background: linear-gradient(90deg, var(--saffron) 0%, var(--green) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            ${userName}!
                        </h1>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 0.9rem;">Here is your business overview today.</p>
                    </div>

                    <!-- Live Accounting Summary (Saffron & Green) -->
                    <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                        <!-- Saffron Card: Market Due -->
                        <div class="summary-card sc-saffron">
                            <div style="font-size: 0.8rem; color: var(--saffron-dark); font-weight: 700; text-transform: uppercase;">মার্কেটে বাকি</div>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--saffron); margin-top: 5px;">₹ 1,25,400</div>
                            <div style="position: absolute; right: -10px; bottom: -15px; opacity: 0.1; font-size: 4rem;">📉</div>
                        </div>
                        
                        <!-- Green Card: Net Payable -->
                        <div class="summary-card sc-green">
                            <div style="font-size: 0.8rem; color: var(--green-dark); font-weight: 700; text-transform: uppercase;">পেমেন্ট দিতে হবে</div>
                            <div style="font-size: 1.6rem; font-weight: 800; color: var(--green); margin-top: 5px;">₹ 45,000</div>
                            <div style="position: absolute; right: -10px; bottom: -15px; opacity: 0.1; font-size: 4rem;">📈</div>
                        </div>
                    </div>

                    <!-- Action Modules Grid -->
                    <h3 style="margin: 0; color: var(--text-main); font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 10px;">Quick Actions</h3>
                    
                    <div class="app-grid">
                        <div class="app-card" onclick="window.LotteryUserUI.navigate('sales')" style="border-top: 3px solid #3b82f6;">
                            <div class="icon">🎟️</div>
                            <div class="title">Single Sales Entry</div>
                        </div>
                        
                        <div class="app-card" onclick="window.LotteryUserUI.navigate('dispatch')" style="border-top: 3px solid var(--saffron);">
                            <div class="icon">🚀</div>
                            <div class="title">Bulk Dispatch</div>
                        </div>

                        <div class="app-card" onclick="window.LotteryUserUI.navigate('payment')" style="border-top: 3px solid var(--green);">
                            <div class="icon">💰</div>
                            <div class="title">Settle Payment</div>
                        </div>

                        <div class="app-card" onclick="window.LotteryUserUI.navigate('ledger')" style="border-top: 3px solid #8b5cf6;">
                            <div class="icon">📊</div>
                            <div class="title">Party Ledger</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // 🟢 6. Unmount
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'block';
    }
};
