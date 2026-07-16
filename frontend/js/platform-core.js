// ==================================================================
// ORBIS PLATFORM CORE LOGIC (Sprint-1.1 - Added Routing & Layer Control)
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    const platformRoot = document.getElementById('orbis-platform-root');
    const chatLayout = document.querySelector('.main-layout'); // 🟢 AI Chat Container

    // 🟢 বাই-ডিফল্ট AI Chat লুকিয়ে রাখা হলো, যাতে পেছনের স্ক্রিন সামনে না আসে
    if (chatLayout) chatLayout.style.display = 'none';

    // অ্যাডমিন বাইপাস
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cockpit_mode') === 'true') {
        if (platformRoot) platformRoot.style.display = 'none';
        if (chatLayout) chatLayout.style.display = 'flex'; // শুধু অ্যাডমিনের জন্য চ্যাট ওপেন
        return; 
    }

    if (!platformRoot) return;

    const activeUser = localStorage.getItem('orbis_active_user');
    let currentState = activeUser ? 'dashboard' : 'landing';

    let localSystemVersion = localStorage.getItem('orbis_system_version') || '1.4.2';
    let localModules = { farmer: 'Coming Soon', ledger: 'Active' };

    let heartbeatInterval = null;
    function startHeartbeat(currentModule = 'Dashboard') {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        const sendPulse = async () => {
            const mobile = localStorage.getItem('orbis_active_user');
            const name = localStorage.getItem('orbis_user_name');
            if (mobile && name) {
                try {
                    const response = await fetch('/api/admin/heartbeat', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mobile, name, currentModule })
                    });
                    const data = await response.json();
                    if (data.success && data.systemState) {
                        if (data.systemState.version !== localSystemVersion) {
                            localStorage.setItem('orbis_system_version', data.systemState.version);
                            window.location.reload(true); 
                        }
                    }
                } catch(e) {}
            }
        };
        sendPulse(); 
        heartbeatInterval = setInterval(sendPulse, 15000); 
    }
    function stopHeartbeat() { if (heartbeatInterval) clearInterval(heartbeatInterval); }

    const styles = `
        <style>
            :root { --saffron: #FF9933; --white: #FFFFFF; --green: #138808; --navy: #0f172a; --gray-light: transparent; }
            .platform-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--gray-light); color: var(--navy); text-align: center; padding: 20px; box-sizing: border-box; }
            .btn-primary { background: var(--saffron); color: var(--white); border: none; padding: 12px 24px; font-size: 1rem; border-radius: 6px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: background 0.3s; box-shadow: 0 4px 6px rgba(255, 153, 51, 0.3); }
            .btn-outline { background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(5px); border: 2px solid var(--saffron); color: var(--saffron); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: bold; }
            .auth-box { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); padding: 35px 30px; border-radius: 12px; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.15); border-top: 5px solid var(--saffron); width: 100%; max-width: 400px; }
            .input-group { margin-bottom: 18px; text-align: left; }
            .input-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: #475569; }
            .input-group input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; background: rgba(255,255,255,0.9); }
            .phone-group { display: flex; align-items: center; }
            .phone-prefix { background: rgba(241, 245, 249, 0.9); padding: 12px; border: 1px solid #cbd5e1; border-right: none; border-radius: 6px 0 0 6px; font-weight: bold; color: var(--navy); user-select: none; }
            .phone-input { border-radius: 0 6px 6px 0 !important; }
            .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; max-width: 900px; margin-top: 30px; }
            .module-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); padding: 25px 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(226, 232, 240, 0.8); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; border-bottom: 4px solid var(--green); }
            .module-icon { font-size: 2.5rem; margin-bottom: 15px; }
            .module-title { font-weight: bold; font-size: 1.15rem; margin-bottom: 8px; color: var(--navy); }
            .module-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 15px; line-height: 1.4; }
            .module-status { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-active { background: #dcfce7; color: var(--green); border: 1px solid var(--green); }
            .status-soon { background: #fef08a; color: #854d0e; border: 1px solid #eab308; }
            .nav-top { position: absolute; top: 20px; right: 20px; display: flex; gap: 10px; align-items: center; }
            .nav-left { position: absolute; top: 20px; left: 20px; }
            .user-badge { font-size: 0.85rem; font-weight: bold; color: var(--navy); background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        </style>
    `;

    const landingTemplate = `<div class="platform-container"><h1 style="font-size: 4rem; color: var(--navy); margin-bottom: 5px; font-weight: 900; letter-spacing: -1px;">ORBIS</h1><p style="font-size: 1.2rem; color: #64748b; margin-bottom: 40px; font-weight: 500; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">The Lego Modular AI Business Platform</p><button class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;" onclick="window.orbisPlatform.navigate('login')">Enter Platform ➔</button></div>`;
    const loginTemplate = `<div class="platform-container"><div class="auth-box"><h2 style="margin-top: 0; color: var(--navy); font-size: 1.8rem;">Identity Gateway</h2><p style="color: #64748b; font-size: 0.95rem; margin-bottom: 25px;">Please verify your identity to continue.</p><div class="input-group"><label>Full Name</label><input type="text" id="auth-name" placeholder="Enter your full name"></div><div class="input-group"><label>Mobile Number</label><div class="phone-group"><span class="phone-prefix">+91</span><input type="tel" id="auth-mobile" class="phone-input" placeholder="XXXXX XXXXX" maxlength="10"></div></div><button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.orbisPlatform.processLogin()">Secure Login</button><button class="btn-outline" style="width: 100%; margin-top: 15px; border: none; background: transparent; color: #64748b;" onclick="window.orbisPlatform.navigate('landing')">← Back to Home</button></div></div>`;
    
    const getDashboardTemplate = () => `
        <div class="platform-container" style="justify-content: flex-start; padding-top: 80px;">
            <div class="nav-top">
                <span class="user-badge" id="display-user">User</span>
                <button class="btn-outline" onclick="window.orbisPlatform.logout()">Logout</button>
            </div>
            <h2 style="margin-bottom: 5px; font-size: 2.2rem; color: var(--navy);">Platform Modules</h2>
            <div class="module-grid">
                <div class="module-card" onclick="window.orbisPlatform.launchModule('orchestrator')">
                    <div class="module-icon">🧠</div><div class="module-title">AI Orchestrator</div>
                    <div class="module-status status-active">Active</div>
                </div>
                <div class="module-card" onclick="alert('Farmer Brain Coming Soon!')">
                    <div class="module-icon">🌾</div><div class="module-title">Farmer Brain</div>
                    <div class="module-status status-soon">Coming Soon</div>
                </div>
                <div class="module-card" style="border-bottom-color: var(--green);" onclick="window.orbisPlatform.navigate('digiledger-hub')">
                    <div class="module-icon">📒</div><div class="module-title">DigiLedger</div>
                    <div class="module-status status-active">Active</div>
                </div>
            </div>
        </div>
    `;

    const getDigiLedgerHubTemplate = () => `
        <div class="platform-container" style="justify-content: flex-start; padding-top: 80px;">
            <div class="nav-left">
                <button class="btn-outline" style="background: rgba(255,255,255,0.9);" onclick="window.orbisPlatform.navigate('dashboard')">← Main Menu</button>
            </div>
            <h2 style="margin-bottom: 5px; font-size: 2.2rem; color: var(--navy);">DigiLedger Hub</h2>
            <div class="module-grid">
                <div class="module-card" style="border-bottom-color: var(--green);" onclick="window.orbisPlatform.mountLotteryModule()">
                    <div class="module-icon">🎟️</div><div class="module-title">Lottery Core</div>
                    <div class="module-status status-active">Active</div>
                </div>
                <div class="module-card" style="opacity: 0.7;" onclick="alert('Pharmacy Coming Soon')">
                    <div class="module-icon">💊</div><div class="module-title">Pharmacy</div>
                    <div class="module-status status-soon">Coming Soon</div>
                </div>
            </div>
        </div>
    `;

    window.orbisPlatform = {
        render: function() {
            platformRoot.style.display = 'block';
            platformRoot.style.visibility = 'visible';
            platformRoot.style.opacity = '1';
            
            if (chatLayout) chatLayout.style.display = 'none';

            let htmlContent = styles;
            if (currentState === 'landing') htmlContent += landingTemplate;
            else if (currentState === 'login') htmlContent += loginTemplate;
            else if (currentState === 'dashboard') htmlContent += getDashboardTemplate();
            else if (currentState === 'digiledger-hub') htmlContent += getDigiLedgerHubTemplate();

            platformRoot.innerHTML = htmlContent;

            if (currentState === 'dashboard') {
                const storedName = localStorage.getItem('orbis_user_name') || 'Authorized User';
                document.getElementById('display-user').innerText = `Welcome, ${storedName.split(' ')[0]} 👋`;
            }
        },

        navigate: function(state, pushHistory = true) {
            currentState = state;
            this.render();
            // 🟢 মোবাইলের ব্যাক বাটনের জন্য ব্রাউজার হিস্ট্রি পুশ করা
            if (pushHistory) history.pushState({ page: state }, "", `?view=${state}`);
        },

        processLogin: function() {
            const name = document.getElementById('auth-name').value.trim();
            const mobile = document.getElementById('auth-mobile').value.trim();
            if (!name || mobile.length < 10) return alert("Valid name and 10-digit mobile required.");
            
            if (!localStorage.getItem('orbis_uid')) localStorage.setItem('orbis_uid', 'ORB-' + Math.random().toString(36).substring(2, 6).toUpperCase());
            localStorage.setItem('orbis_active_user', mobile);
            localStorage.setItem('orbis_user_name', name);
            this.navigate('dashboard');
            startHeartbeat('Dashboard');
        },

        logout: function() {
            localStorage.removeItem('orbis_active_user');
            localStorage.removeItem('orbis_user_name');
            stopHeartbeat();
            this.navigate('landing');
        },

        launchModule: function(moduleId) {
            if (moduleId === 'orchestrator') {
                startHeartbeat('AI Orchestrator'); 
                platformRoot.style.opacity = '0';
                setTimeout(() => { 
                    platformRoot.style.display = 'none'; 
                    if (chatLayout) chatLayout.style.display = 'flex'; // 🟢 শুধুমাত্র এখানেই AI চ্যাট খুলবে
                }, 300); 
            }
        },

        mountLotteryModule: function() {
            console.log("[ORBIS] Mounting Lottery Module...");
            startHeartbeat('Lottery Module');
            
            // 🟢 মোবাইলের ব্যাক বাটনের জন্য লটারি পেজটিকে হিস্ট্রিতে সেভ করা
            history.pushState({ page: 'lottery-app' }, "", "?view=lottery");
            
            platformRoot.style.opacity = '0';
            setTimeout(() => { 
                platformRoot.style.display = 'none'; 
                
                if (!document.getElementById('orbis-lottery-module')) {
                    const script = document.createElement('script');
                    script.id = 'orbis-lottery-module';
                    
                    // 🟢 FIX: পাথ আপডেট করা হলো সার্ভারের নতুন রাউটিং অনুযায়ী
                    script.src = '/assets/lottery/js/user-view.js'; 
                    
                    script.onerror = () => {
                        alert("Error 404: লটারি ফাইলটি পাওয়া যাচ্ছে না! সার্ভারের (server.js) রাউটিং চেক করতে হবে।");
                        window.orbisPlatform.unmountModule();
                    };
                    
                    document.body.appendChild(script);
                } else {
                    if (window.LotteryUserUI && typeof window.LotteryUserUI.mount === 'function') {
                        window.LotteryUserUI.mount();
                    }
                }
            }, 300);
        },

        unmountModule: function() {
            console.log("[ORBIS] Unmounting module...");
            startHeartbeat('Dashboard');
            // লটারির পেজ হাইড করা
            const workspace = document.getElementById('lottery-user-workspace');
            if (workspace) workspace.style.display = 'none';
            
            this.navigate('digiledger-hub', false);
        }
    };

    // 🟢 মোবাইলের হার্ডওয়্যার (Hardware) Back Button কন্ট্রোলার
    window.addEventListener('popstate', (event) => {
        const workspace = document.getElementById('lottery-user-workspace');
        if (event.state && event.state.page) {
            if (event.state.page !== 'lottery-app' && workspace) {
                workspace.style.display = 'none'; // লটারি থেকে ব্যাক করলে লটারি হাইড হবে
            }
            if (event.state.page !== 'lottery-app') {
                currentState = event.state.page;
                window.orbisPlatform.render();
            }
        } else {
            if (localStorage.getItem('orbis_active_user')) {
                if (workspace) workspace.style.display = 'none';
                currentState = 'dashboard';
                window.orbisPlatform.render();
            }
        }
    });

    history.replaceState({ page: currentState }, "", `?view=${currentState}`);
    window.orbisPlatform.render();
    if (currentState === 'dashboard') startHeartbeat('Dashboard');
});
