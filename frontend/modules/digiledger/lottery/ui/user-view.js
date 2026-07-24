// 📝 user-view.js (DigiLedger Premium Dashboard - Indian Flag Glassmorphism & i18n)

window.LotteryUserUI = {
    // 🟢 0. App Version Control
    APP_VERSION: "v1.2.0 (Premium Glassmorphism Build)",
    
    // Global Language State ('en', 'bn', 'hi')
    currentLang: localStorage.getItem('lms_lang') || 'bn', 

    // 🟢 1. Preload Modules with Cache Busting
    preloadModules: function() {
        const timestamp = new Date().getTime(); 
        const modules = [
            { name: 'LotterySalesApp', path: '/modules/digiledger/lottery/ui/lottery-app.js' },
            { name: 'LotteryPaymentApp', path: '/modules/digiledger/lottery/ui/payment-app.js' },
            { name: 'LotteryDispatchApp', path: '/modules/digiledger/lottery/ui/DispatchWorkspace.js' },
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

    // 🟢 3. Universal Top Navigation for Inner Pages (Glassmorphism Styled)
    getTopNavBar: function(pageTitle) {
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background: rgba(255,255,255,0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid rgba(255,255,255,0.4); box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                <button onclick="window.LotteryUserUI.navigate('dashboard')" style="background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s;">
                    <span style="font-size: 1.2rem; color: #2C3E50;">◀</span>
                </button>
                <h2 style="margin: 0; font-size: 1.1rem; color: #2C3E50; font-weight: 700; letter-spacing: 0.5px;">${pageTitle}</h2>
                <button onclick="window.LotteryUserUI.navigate('dashboard')" style="background: rgba(255,153,51,0.15); border: 1px solid rgba(255,153,51,0.3); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(255,153,51,0.1);">
                    <span style="font-size: 1.2rem;">🏠</span>
                </button>
            </div>
        `;
    },

    // 🟢 4. Main Mount Function (Core Shell & Sidebar)
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
            // Core Base Background (Ice White)
            workspace.style.backgroundColor = "#F8F9FA"; 
            workspace.style.zIndex = "1000";
            workspace.style.overflow = "hidden"; // No Scroll globally for Dashboard feel
            workspace.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
            
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';

        workspace.innerHTML = `
            <style>
                :root {
                    --lms-saffron: #FF9933; --lms-saffron-glow: rgba(255, 153, 51, 0.15); --lms-saffron-border: rgba(255, 153, 51, 0.4);
                    --lms-green: #138808; --lms-green-glow: rgba(19, 136, 8, 0.15); --lms-green-border: rgba(19, 136, 8, 0.4);
                    --lms-glass-bg: rgba(255, 255, 255, 0.65);
                    --lms-text-dark: #2C3E50; --lms-text-muted: #7F8C8D;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .lms_animate_up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                /* Abstract Background Shapes */
                .lms_bg_shape_1 { position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: var(--lms-saffron-glow); border-radius: 50%; filter: blur(50px); z-index: 0; pointer-events: none;}
                .lms_bg_shape_2 { position: absolute; bottom: -50px; left: -50px; width: 300px; height: 300px; background: var(--lms-green-glow); border-radius: 50%; filter: blur(60px); z-index: 0; pointer-events: none;}

                /* Sidebar */
                #dl-sidebar {
                    position: fixed; top: 0; left: -280px; width: 260px; height: 100vh;
                    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(255,255,255,0.6); box-shadow: 4px 0 25px rgba(0,0,0,0.05);
                    transition: left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); z-index: 2000; display: flex; flex-direction: column;
                }
                #dl-sidebar.active { left: 0; }
                .sidebar-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.3); z-index: 1999; display: none; opacity: 0;
                    transition: opacity 0.3s ease; backdrop-filter: blur(3px);
                }
                .sidebar-overlay.active { display: block; opacity: 1; }
                
                /* Container for Inner Views */
                #dl-dynamic-view {
                    position: relative; z-index: 1; height: 100%; overflow-y: auto; overflow-x: hidden;
                    padding-bottom: 20px;
                }
            </style>

            <div class="lms_bg_shape_1"></div>
            <div class="lms_bg_shape_2"></div>

            <div class="sidebar-overlay" id="dl-overlay"></div>
            <div id="dl-sidebar">
                <div style="background: linear-gradient(135deg, rgba(255,153,51,0.9), rgba(255,179,102,0.9)); padding: 30px 20px; color: white; border-bottom: 2px solid var(--lms-green);">
                    <h2 style="margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">DigiLedger</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Lottery Management System</p>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px; font-size: 15px; color: var(--lms-text-dark); flex-grow: 1;">
                    <div style="cursor:pointer; padding:10px; border-radius:12px; background: rgba(0,0,0,0.03);" onclick="window.LotteryUserUI.navigate('dashboard'); window.LotteryUserUI.toggleSidebar();">🏠 Home / Dashboard</div>
                    <div style="cursor:pointer; padding:10px; border-radius:12px; hover:background:rgba(0,0,0,0.03);">⚙️ Settings</div>
                    <div style="cursor:pointer; padding:10px; border-radius:12px;">👤 My Profile</div>
                    <div style="border-top: 1px solid rgba(0,0,0,0.05); margin-top: 10px; padding-top: 20px;"></div>
                    <div style="cursor:pointer; padding:10px; border-radius:12px; color: #E74C3C; font-weight: 600;" onclick="window.LotteryUserUI.unmount()">🚪 Exit Module</div>
                </div>
                <div style="padding: 15px; text-align: center; color: var(--lms-text-muted); font-size: 11px; border-top: 1px solid rgba(0,0,0,0.05);">
                    ${this.APP_VERSION}
                </div>
            </div>

            <div id="dl-dynamic-view"></div>
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

    // 🟢 6. Dynamic i18n Language Toggle Logic
    toggleLanguage: function() {
        // Cycle between bn -> hi -> en -> bn
        if (this.currentLang === 'bn') this.currentLang = 'hi';
        else if (this.currentLang === 'hi') this.currentLang = 'en';
        else this.currentLang = 'bn';

        localStorage.setItem('lms_lang', this.currentLang);
        this.applyLanguage();
    },

    applyLanguage: function() {
        const langBtn = document.getElementById('lms_lang_btn');
        if(langBtn) {
            let langText = this.currentLang === 'bn' ? 'বাং' : (this.currentLang === 'hi' ? 'हिं' : 'Off');
            langBtn.innerHTML = `🌐 Eng | ${langText} ▾`;
        }

        document.querySelectorAll('.lms_title_local').forEach(el => {
            if (this.currentLang === 'en') {
                el.style.display = 'none';
            } else {
                el.style.display = 'block';
                el.textContent = el.getAttribute(`data-${this.currentLang}`);
            }
        });
    },

    // 🟢 7. Navigation Router (Merged with Glassmorphism)
    navigate: function(view) {
        const contentBox = document.getElementById('dl-dynamic-view');
        if (!contentBox) return; 
        
        window.scrollTo(0, 0);

        // Keep existing external app routes exactly as they were
        if (view === 'sales') { window.LotterySalesApp ? window.LotterySalesApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Sales...</h3>"; } 
        else if (view === 'payment') { window.LotteryPaymentApp ? window.LotteryPaymentApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Payment...</h3>"; }
        else if (view === 'dispatch') { window.LotteryDispatchApp ? window.LotteryDispatchApp.mount(contentBox) : contentBox.innerHTML = "<h3 style='padding:20px; text-align:center;'>⏳ Loading Dispatch...</h3>"; }
        else if (view === 'partymaster') {
            if (window.PartyMaster && typeof window.PartyMaster.mount === 'function') { window.PartyMaster.mount(contentBox);
            } else {
                contentBox.innerHTML = `${this.getTopNavBar("Party Master Error")}
                    <div style="padding:20px; text-align:center; color: #dc3545;"><h3>⚠️ Module Not Found!</h3></div>`;
            }
        }
        else if (view === 'ledger') {
            contentBox.innerHTML = `${this.getTopNavBar("Party Ledger")}
                <div style="padding: 20px;" class="lms_animate_up"><div style="text-align: center; padding: 50px 20px; background: var(--lms-glass-bg); border-radius: 20px; border: 1px solid rgba(255,255,255,0.8);"><h2>📊 Ledger Records Loading...</h2></div></div>`;
        }
        else if (view === 'stock') {
            contentBox.innerHTML = `${this.getTopNavBar("Live Stock")}
                <div style="padding: 20px;" class="lms_animate_up"><div style="text-align: center; padding: 50px 20px; background: var(--lms-glass-bg); border-radius: 20px; border: 1px solid rgba(255,255,255,0.8);"><h2>📦 Inventory Loading...</h2></div></div>`;
        }
        else if (view === 'report') {
            contentBox.innerHTML = `${this.getTopNavBar("Day Reports")}
                <div style="padding: 20px;" class="lms_animate_up"><div style="text-align: center; padding: 50px 20px; background: var(--lms-glass-bg); border-radius: 20px; border: 1px solid rgba(255,255,255,0.8);"><h2>📑 Reports Loading...</h2></div></div>`;
        }
        else if (view === 'dashboard') {
            const userName = "Rahul Das"; 
            const greeting = this.getGreeting();

            contentBox.innerHTML = `
                <style>
                    /* Dashboard Specific CSS */
                    .lms_dashboard_inner { padding: 15px; max-width: 600px; margin: 0 auto; }
                    .lms_topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                    .lms_menu_btn { font-size: 24px; cursor: pointer; color: var(--lms-text-dark); background: none; border: none; padding: 0; }
                    .lms_lang_toggle { background: var(--lms-glass-bg); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.8); font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.02); color: var(--lms-text-dark);}
                    .lms_profile_icon { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--lms-green), #22c55e); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 4px 10px var(--lms-green-glow); }

                    /* Top Summary Cards (Merged with old Market Due data) */
                    .lms_summary_row { display: flex; gap: 12px; margin-bottom: 20px; }
                    .lms_summary_card {
                        flex: 1; background: var(--lms-glass-bg); backdrop-filter: blur(16px);
                        border-radius: 16px; padding: 15px; border: 1px solid var(--lms-saffron-border);
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: relative; overflow: hidden;
                    }
                    .lms_summary_card:nth-child(2) { border-color: var(--lms-green-border); }
                    .lms_summary_card h4 { margin: 0; font-size: 11px; color: var(--lms-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;}
                    .lms_summary_card h2 { margin: 5px 0 0 0; font-size: 20px; font-weight: 800; color: var(--lms-saffron); }
                    .lms_summary_card:nth-child(2) h2 { color: var(--lms-green); }
                    .lms_summary_icon { position: absolute; right: -5px; bottom: -10px; opacity: 0.1; font-size: 3.5rem; }

                    /* Grid / Alive Cards */
                    .lms_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 20px;}
                    .lms_action_card {
                        background: var(--lms-glass-bg); backdrop-filter: blur(16px);
                        border: 1px solid rgba(255,255,255,0.9); border-radius: 16px; padding: 15px 10px;
                        text-align: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative; overflow: hidden;
                    }
                    .lms_action_card:hover, .lms_action_card:active {
                        transform: scale(1.02) translateY(-3px); box-shadow: 0 12px 25px rgba(0,0,0,0.06);
                        border-color: var(--lms-green-border);
                    }
                    .lms_action_card::after {
                        content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
                        transform: skewX(-25deg); transition: 0.5s;
                    }
                    .lms_action_card:hover::after { left: 150%; }

                    .lms_action_card .icon { font-size: 26px; margin-bottom: 6px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));}
                    .lms_action_card .title_en { font-size: 13px; font-weight: 700; color: var(--lms-text-dark); margin: 0; }
                    .lms_action_card .lms_title_local { font-size: 11px; font-weight: 600; color: var(--lms-text-muted); margin-top: 4px; display: none; }
                    
                    .lms_full_card { grid-column: span 2; }
                </style>

                <div class="lms_dashboard_inner lms_animate_up">
                    <!-- Top Bar -->
                    <div class="lms_topbar">
                        <button class="lms_menu_btn" onclick="window.LotteryUserUI.toggleSidebar()">☰</button>
                        <button class="lms_lang_toggle" id="lms_lang_btn" onclick="window.LotteryUserUI.toggleLanguage()">🌐 Eng | বাং ▾</button>
                        <div class="lms_profile_icon">${userName.charAt(0)}</div>
                    </div>

                    <!-- Greetings -->
                    <div style="margin-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: var(--lms-text-dark);">
                            <span style="font-weight:600; font-size:16px; color:var(--lms-text-muted);">${greeting},</span><br>
                            ${userName}!
                        </h1>
                    </div>

                    <!-- Top Summary (Replaced with old data logic, styled new) -->
                    <div class="lms_summary_row">
                        <div class="lms_summary_card" onclick="window.LotteryUserUI.navigate('ledger')">
                            <h4 class="lms_title_en">Market Due</h4>
                            <h4 class="lms_title_local" data-bn="মার্কেটে বাকি" data-hi="बाज़ार का बकाया">মার্কেটে বাকি</h4>
                            <h2>₹ 1,25,400</h2>
                            <div class="lms_summary_icon">📉</div>
                        </div>
                        <div class="lms_summary_card" onclick="window.LotteryUserUI.navigate('payment')">
                            <h4 class="lms_title_en">Payable Amount</h4>
                            <h4 class="lms_title_local" data-bn="পেমেন্ট দিতে হবে" data-hi="देय राशि">পেমেন্ট দিতে হবে</h4>
                            <h2>₹ 45,000</h2>
                            <div class="lms_summary_icon">📈</div>
                        </div>
                    </div>

                    <div style="font-size: 12px; font-weight: 800; color: var(--lms-text-muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">⚡ Quick Actions</div>

                    <!-- App Grid Mapped to Old Routes -->
                    <div class="lms_grid">
                        
                        <!-- Route: partymaster -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('partymaster')">
                            <span class="icon">👥</span>
                            <h3 class="title_en">Add Party Master</h3>
                            <p class="lms_title_local" data-bn="(মহাজন/পার্টি)" data-hi="(पार्टी जोड़ें)">(মহাজন/পার্টি)</p>
                        </div>

                        <!-- Route: sales -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('sales')">
                            <span class="icon">🎟️</span>
                            <h3 class="title_en">Sales Entry</h3>
                            <p class="lms_title_local" data-bn="(খুচরো বিক্রেতা)" data-hi="(बिक्री प्रवेश)">(খুচরো বিক্রেতা)</p>
                        </div>

                                            <!-- Route: dispatch -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('dispatch')">
                            <span class="icon">🚀</span>
                            <h3 class="title_en">Bulk Dispatch</h3>
                            <p class="lms_title_local" data-bn="(একসাথে পাঠানো)" data-hi="(थोक प्रेषण)">(একসাথে পাঠানো)</p>
                        </div>

                        <!-- Route: stock -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('stock')">
                            <span class="icon">📦</span>
                            <h3 class="title_en">Live Stock</h3>
                            <p class="lms_title_local" data-bn="(বর্তমান স্টক)" data-hi="(लाइव स्टॉक)">(বর্তমান স্টক)</p>
                        </div>

                        <!-- Route: payment -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('payment')">
                            <span class="icon">💰</span>
                            <h3 class="title_en">Settle Payment</h3>
                            <p class="lms_title_local" data-bn="(পেমেন্ট/লেনদেন)" data-hi="(भुगतान)">(পেমেন্ট/লেনদেন)</p>
                        </div>

                        <!-- Route: ledger -->
                        <div class="lms_action_card" onclick="window.LotteryUserUI.navigate('ledger')">
                            <span class="icon">📒</span>
                            <h3 class="title_en">Party Ledger</h3>
                            <p class="lms_title_local" data-bn="(খতিয়ান/বকেয়া)" data-hi="(खाता बही)">(খতিয়ান/বকেয়া)</p>
                        </div>

                        <!-- Route: report (Full Width) -->
                        <div class="lms_action_card lms_full_card" onclick="window.LotteryUserUI.navigate('report')">
                            <span class="icon" style="display:inline-block; margin-right:5px; font-size:20px;">📑</span>
                            <h3 class="title_en" style="display:inline-block; font-size:15px; margin-bottom: 5px;">Day Reports</h3>
                            <p class="lms_title_local" data-bn="(সারাদিনের হিসাব)" data-hi="(दैनिक रिपोर्ट)" style="display:inline-block; margin-left:5px; margin-top:0;">(সারাদিনের হিসাব)</p>
                            
                            <!-- Static display chips for visual appeal -->
                            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
                                <span style="background: var(--lms-green); color: white; border-radius: 10px; padding: 3px 8px; font-size: 10px; font-weight: 700;">Today</span>
                                <span style="background: rgba(0,0,0,0.05); color: var(--lms-text-muted); border-radius: 10px; padding: 3px 8px; font-size: 10px; font-weight: 600;">Weekly</span>
                            </div>
                        </div>

                    </div>
                </div>
            `;
            
            // Apply language state immediately after rendering the dashboard
            this.applyLanguage();
        }
    },
    
    // 🟢 8. Unmount Module
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'block';
    }
};
