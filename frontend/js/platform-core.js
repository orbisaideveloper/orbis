// ==================================================================
// ORBIS PLATFORM CORE LOGIC (Sprint-1)
// Advanced Dynamic Loader / Micro-Frontend Architecture
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    const platformRoot = document.getElementById('orbis-platform-root');
    
    // যদি কোনো কারণে root না পাওয়া যায়, তাহলে এক্সিকিউশন থামিয়ে দেবে (Zero Breaking)
    if (!platformRoot) {
        console.warn("[ORBIS] Platform root not found. Defaulting to Core Cockpit.");
        return;
    }

    // State Management (কোন পেজটি এখন দেখানো হবে)
    let currentState = 'landing'; // অপশন: 'landing', 'login', 'dashboard'

    // ==========================================
    // 🎨 UI TEMPLATES & STYLES (Dynamic Injection)
    // ==========================================
    const styles = `
        <style>
            .platform-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f8fafc; color: #0f172a; text-align: center; padding: 20px; box-sizing: border-box; }
            .btn-primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; font-size: 1rem; border-radius: 6px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: background 0.3s; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); }
            .btn-primary:hover { background: #2563eb; }
            .btn-outline { background: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: bold; }
            .btn-outline:hover { background: #f1f5f9; border-color: #94a3b8; }
            
            .auth-box { background: white; padding: 35px 30px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
            .input-group { margin-bottom: 18px; text-align: left; }
            .input-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: #475569; }
            .input-group input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.2s; }
            .input-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            
            .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; max-width: 900px; margin-top: 30px; }
            .module-card { background: white; padding: 25px 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
            .module-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .module-icon { font-size: 2.5rem; margin-bottom: 15px; }
            .module-title { font-weight: bold; font-size: 1.15rem; margin-bottom: 8px; color: #1e293b; }
            .module-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 15px; line-height: 1.4; }
            
            .module-status { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-active { background: #dcfce7; color: #166534; }
            .status-soon { background: #fef08a; color: #854d0e; }
            
            .nav-top { position: absolute; top: 20px; right: 20px; display: flex; gap: 10px; align-items: center; }
            .user-badge { font-size: 0.85rem; font-weight: bold; color: #64748b; background: #e2e8f0; padding: 6px 12px; border-radius: 20px; }
        </style>
    `;

    const landingTemplate = `
        <div class="platform-container">
            <h1 style="font-size: 3.5rem; color: #0f172a; margin-bottom: 5px; font-weight: 900; letter-spacing: -1px;">ORBIS</h1>
            <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 40px; font-weight: 500;">The Lego Modular AI Business Platform</p>
            <button class="btn-primary" style="font-size: 1.1rem; padding: 14px 32px;" onclick="window.orbisPlatform.navigate('login')">Enter Platform ➔</button>
        </div>
    `;

    const loginTemplate = `
        <div class="platform-container">
            <div class="auth-box">
                <h2 style="margin-top: 0; color: #0f172a; font-size: 1.8rem;">Identity Gateway</h2>
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 25px;">Please verify your identity to continue.</p>
                
                <div class="input-group">
                    <label>Mobile Number (Primary)</label>
                    <input type="tel" id="auth-mobile" placeholder="+91 XXXXX XXXXX" required>
                </div>
                <div class="input-group">
                    <label>Email Address (Optional)</label>
                    <input type="email" id="auth-email" placeholder="user@orbis.ai">
                </div>
                
                <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="window.orbisPlatform.processLogin()">Secure Login</button>
                <button class="btn-outline" style="width: 100%; margin-top: 15px; border: none; background: transparent;" onclick="window.orbisPlatform.navigate('landing')">← Back to Home</button>
            </div>
        </div>
    `;

    const dashboardTemplate = `
        <div class="platform-container" style="justify-content: flex-start; padding-top: 80px;">
            <div class="nav-top">
                <span class="user-badge" id="display-user">User</span>
                <button class="btn-outline" onclick="window.orbisPlatform.logout()">Logout</button>
            </div>
            
            <h2 style="margin-bottom: 5px; font-size: 2.2rem; color: #0f172a;">Platform Modules</h2>
            <p style="color: #64748b; margin-bottom: 20px; font-size: 1.1rem;">Select a business module to launch</p>
            
            <div class="module-grid">
                <div class="module-card" onclick="window.orbisPlatform.launchModule('orchestrator')">
                    <div class="module-icon">🧠</div>
                    <div class="module-title">AI Orchestrator</div>
                    <div class="module-desc">Core cognitive engine, telemetry, and live execution bus.</div>
                    <div class="module-status status-active">Active</div>
                </div>

                <div class="module-card" onclick="window.orbisPlatform.launchModule('farmer')">
                    <div class="module-icon">🌾</div>
                    <div class="module-title">Farmer Brain</div>
                    <div class="module-desc">Intelligent agricultural management and analytics.</div>
                    <div class="module-status status-soon">Coming Soon</div>
                </div>

                <div class="module-card" onclick="window.orbisPlatform.launchModule('ledger')">
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
        // UI রেন্ডার করা
        render: function() {
            platformRoot.style.visibility = 'visible';
            platformRoot.style.opacity = '1';

            let htmlContent = styles;
            if (currentState === 'landing') htmlContent += landingTemplate;
            else if (currentState === 'login') htmlContent += loginTemplate;
            else if (currentState === 'dashboard') htmlContent += dashboardTemplate;

            platformRoot.innerHTML = htmlContent;

            // ড্যাশবোর্ডে ইউজার আইডি দেখানো
            if (currentState === 'dashboard') {
                const storedUser = sessionStorage.getItem('orbis_active_user') || 'Authorized User';
                document.getElementById('display-user').innerText = storedUser;
            }
        },

        // পেজ পরিবর্তন
        navigate: function(state) {
            currentState = state;
            this.render();
        },

        // লগইন প্রসেস
        processLogin: function() {
            const mobile = document.getElementById('auth-mobile').value;
            if (!mobile || mobile.length < 10) {
                alert("Please enter a valid mobile number.");
                return;
            }
            // Sprint-1 Mock Auth: সেশনে ডেটা সেভ করে ড্যাশবোর্ডে পাঠানো
            sessionStorage.setItem('orbis_active_user', mobile);
            console.log("[Platform Auth] Identity verified for:", mobile);
            this.navigate('dashboard');
        },

        // লগআউট প্রসেস
        logout: function() {
            sessionStorage.removeItem('orbis_active_user');
            console.log("[Platform Auth] Session terminated.");
            this.navigate('landing');
        },

        // মডিউল লঞ্চার (THE MAGIC)
        launchModule: function(moduleId) {
            if (moduleId === 'orchestrator') {
                console.log("[Platform Core] Launching AI Orchestrator. Disengaging Platform Layer...");
                
                // ফেড-আউট ট্রানজিশন দিয়ে ওভারলে সরিয়ে দেওয়া
                platformRoot.style.opacity = '0';
                
                setTimeout(() => {
                    platformRoot.style.visibility = 'hidden';
                    platformRoot.innerHTML = ''; // মেমরি ক্লিয়ার করা
                }, 500); // 0.5 সেকেন্ড ট্রানজিশনের পর হাইড হবে
                
            } else {
                // Future Modules Fallback
                alert("This module is currently in development.\nStatus: Coming Soon!");
            }
        }
    };

    // প্ল্যাটফর্ম ইনিশিয়ালাইজেশন
    window.orbisPlatform.render();
});
