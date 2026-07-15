// ==================================================================
// ORBIS PLATFORM CORE LOGIC (Sprint-1)
// Advanced Dynamic Loader & Persistent Authentication
// Theme: Indian National Flag (Saffron, White, Green)
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    const platformRoot = document.getElementById('orbis-platform-root');
    
    // 🟢 MAGIC: ADMIN COCKPIT BYPASS
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cockpit_mode') === 'true') {
        if (platformRoot) {
            platformRoot.style.display = 'none';
            platformRoot.innerHTML = '';
        }
        console.log("[ORBIS] Admin Cockpit Mode Active. Public Identity Gateway Bypassed.");
        return; 
    }

    if (!platformRoot) {
        console.warn("[ORBIS] Platform root not found. Defaulting to Core Cockpit.");
        return;
    }

    const activeUser = localStorage.getItem('orbis_active_user');
    let currentState = activeUser ? 'dashboard' : 'landing';

    // ==========================================
    // 📡 TELEMETRY HEARTBEAT (LIVE RADAR PING)
    // ==========================================
    let heartbeatInterval = null;

    function startHeartbeat(currentModule = 'Dashboard') {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        
        const sendPulse = () => {
            const mobile = localStorage.getItem('orbis_active_user');
            const name = localStorage.getItem('orbis_user_name');
            if (mobile && name) {
                // Send silent background ping to the server
                fetch('/api/admin/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile, name, currentModule })
                }).catch(e => {}); // Ignore network errors so user isn't disturbed
            }
        };

        sendPulse(); // Send immediately on load/switch
        heartbeatInterval = setInterval(sendPulse, 30000); // Ping every 30 seconds
    }

    function stopHeartbeat() {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
    }

    // ==========================================
    // 🎨 UI TEMPLATES & STYLES (Tricolor Theme)
    // ==========================================
    const styles = `
        <style>
            :root { --saffron: #FF9933; --white: #FFFFFF; --green: #138808; --navy: #0f172a; --gray-light: #f8fafc; }
            .platform-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--gray-light); color: var(--navy); text-align: center; padding: 20px; box-sizing: border-box; }
            .btn-primary { background: var(--saffron); color: var(--white); border: none; padding: 12px 24px; font-size: 1rem; border-radius: 6px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: background 0.3s; box-shadow: 0 4px 6px rgba(255, 153, 51, 0.3); }
            .btn-primary:hover { background: #e68a2e; }
            .btn-outline { background: transparent; border: 2px solid var(--saffron); color: var(--saffron); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: bold; }
            .btn-outline:hover { background: var(--saffron); color: var(--white); }
            .auth-box { background: var(--white); padding: 35px 30px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-top: 5px solid var(--saffron); width: 100%; max-width: 400px; }
            .input-group { margin-bottom: 18px; text-align: left; }
            .input-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: #475569; }
            .input-group input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.2s; }
            .input-group input:focus { outline: none; border-color: var(--saffron); box-shadow: 0 0 0 3px rgba(255, 153, 51, 0.2); }
            .phone-group { display: flex; align-items: center; }
            .phone-prefix { background: #f1f5f9; padding: 12px; border: 1px solid #cbd5e1; border-right: none; border-radius: 6px 0 0 6px; font-weight: bold; color: var(--navy); user-select: none; }
            .phone-input { border-radius: 0 6px 6px 0 !important; }
            .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; max-width: 900px; margin-top: 30px; }
            .module-card { background: var(--white); padding: 25px 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; border-bottom: 4px solid var(--green); }
            .module-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .module-icon { font-size: 2.5rem; margin-bottom: 15px; }
            .module-title { font-weight: bold; font-size: 1.15rem; margin-bottom: 8px; color: var(--navy); }
            .module-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 15px; line-height: 1.4; }
            .module-status { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-active { background: #dcfce7; color: var(--green); border: 1px solid var(--green); }
            .status-soon { background: #fef08a; color: #854d0e; border: 1px solid #eab308; }
            .nav-top { position: absolute; top: 20px; right: 20px; display: flex; gap: 10px; align-items: center; }
            .user-badge { font-size: 0.85rem; font-weight: bold; color: var(--white); background: var(--green); padding: 6px 12px; border-radius: 20px; }
        </style>
    `;

    const landingTemplate = `
        <div class="platform-container">
            <h1 style="font-size: 4rem; color: var(--navy); margin-bottom: 5px; font-weight: 900; letter-spacing: -1px;">ORBIS</h1>
            <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 40px; font-weight: 500;">The Lego Modular AI Business Platform</p>
            <button class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;" onclick="window.orbisPlatform.navigate('login')">Enter Platform ➔</button>
        </div>
    `;

    const loginTemplate = `
        <div class="platform-container">
            <div class="auth-box">
                <h2 style="margin-top: 0; color: var(--navy); font-size: 1.8rem;">Identity Gateway</h2>
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 25px;">Please verify your identity to continue.</p>
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" id="auth-name" placeholder="Enter your full name" required autocomplete="name">
                </div>
                <div class="input-group">
                    <label>Mobile Number (Primary)</label>
                    <div class="phone-group">
                        <span class="phone-prefix">+91</span>
                        <input type="tel" id="auth-mobile" class="phone-input" placeholder="XXXXX XXXXX" maxlength="10" required autocomplete="tel-national" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                    </div>
                </div>
                <div class="input-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-email" placeholder="user@example.com" autocomplete="email">
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.orbisPlatform.processLogin()">Secure Login</button>
                <button class="btn-outline" style="width: 100%; margin-top: 15px; border: none; background: transparent; color: #64748b;" onclick="window.orbisPlatform.navigate('landing')">← Back to Home</button>
            </div>
        </div>
    `;

    const dashboardTemplate = `
        <div class="platform-container" style="justify-content: flex-start; padding-top: 80px;">
            <div class="nav-top">
                <span class="user-badge" id="display-user">User</span>
                <button class="btn-outline" onclick="window.orbisPlatform.logout()">Logout</button>
            </div>
            <h2 style="margin-bottom: 5px; font-size: 2.2rem; color: var(--navy);">Platform Modules</h2>
            <p style="color: #64748b; margin-bottom: 20px; font-size: 1.1rem;">Select a business module to launch</p>
            <div class="module-grid">
                <div class="module-card" onclick="window.orbisPlatform.launchModule('orchestrator')">
                    <div class="module-icon">🧠</div>
                    <div class="module-title">AI Orchestrator</div>
                    <div class="module-desc">Core cognitive engine, telemetry, and live execution bus.</div>
                    <div class="module-status status-active">Active</div>
                </div>
                <div class="module-card" style="border-bottom-color: var(--saffron);" onclick="window.orbisPlatform.launchModule('farmer')">
                    <div class="module-icon">🌾</div>
                    <div class="module-title">Farmer Brain</div>
                    <div class="module-desc">Intelligent agricultural management and analytics.</div>
                    <div class="module-status status-soon">Coming Soon</div>
                </div>
                <div class="module-card" style="border-bottom-color: var(--saffron);" onclick="window.orbisPlatform.launchModule('ledger')">
                    <div class="module-icon">📒</div>
                    <div class="module-title">DigiLedger</div>
                    <div class="module-desc">Secure financial tracking and database synchronization.</div>
                    <div class="module-status status-soon">Coming Soon</div>
                </div>
            </div>
        </div>
    `;

    // ==========================================
    // ⚙️ CORE LOGIC & NAVIGATION
    // ==========================================
    window.orbisPlatform = {
        render: function() {
            platformRoot.style.visibility = 'visible';
            platformRoot.style.opacity = '1';

            let htmlContent = styles;
            if (currentState === 'landing') htmlContent += landingTemplate;
            else if (currentState === 'login') htmlContent += loginTemplate;
            else if (currentState === 'dashboard') htmlContent += dashboardTemplate;

            platformRoot.innerHTML = htmlContent;

            if (currentState === 'dashboard') {
                const storedName = localStorage.getItem('orbis_user_name') || 'Authorized User';
                document.getElementById('display-user').innerText = storedName;
            }
        },

        navigate: function(state) {
            currentState = state;
            this.render();
        },

        processLogin: function() {
            const name = document.getElementById('auth-name').value.trim();
            const mobile = document.getElementById('auth-mobile').value.trim();
            const email = document.getElementById('auth-email').value.trim();

            if (!name) return alert("Please enter your full name.");
            if (!mobile || mobile.length < 10) return alert("Please enter a valid 10-digit mobile number.");

            localStorage.setItem('orbis_active_user', mobile);
            localStorage.setItem('orbis_user_name', name);
            if(email) localStorage.setItem('orbis_user_email', email);

            console.log("[Platform Auth] Identity verified and session saved for:", name);
            this.navigate('dashboard');
            
            // 🟢 Start Heartbeat upon login
            startHeartbeat('Dashboard');
        },

        logout: function() {
            localStorage.removeItem('orbis_active_user');
            localStorage.removeItem('orbis_user_name');
            localStorage.removeItem('orbis_user_email');
            
            console.log("[Platform Auth] Session terminated.");
            stopHeartbeat(); // 🟢 Stop Heartbeat
            this.navigate('landing');
        },

        launchModule: function(moduleId) {
            if (moduleId === 'orchestrator') {
                console.log("[Platform Core] Launching AI Orchestrator...");
                startHeartbeat('AI Orchestrator'); // 🟢 Update radar with active module
                
                platformRoot.style.opacity = '0';
                setTimeout(() => {
                    platformRoot.style.visibility = 'hidden';
                    platformRoot.innerHTML = ''; 
                }, 500); 
            } else {
                alert("This module is currently in development.\nStatus: Coming Soon!");
            }
        }
    };

    // Initialize UI and Heartbeat if already logged in
    window.orbisPlatform.render();
    if (currentState === 'dashboard') {
        startHeartbeat('Dashboard');
    }
});
