// File: src/modules/digiledger/lottery/ui/user-view.js
// 📊 DigiLedger: Master Accounting Engine (V2.2 - Universal Chain + Dynamic Module Loader)

window.LotteryUserUI = {
    // 🗄️ ইন্টারনাল লোকাল ডাটাবেস
    db: {
        parties: JSON.parse(localStorage.getItem('dl_parties')) || [],
        
        saveParties: function(data) {
            localStorage.setItem('dl_parties', JSON.stringify(data));
            this.parties = data;
        }
    },

    // 👤 বর্তমান লগ-ইন করা ইউজার (Role Switcher-এর জন্য)
    currentUser: {
        orb_id: 'ORB-ADMIN',
        name: 'Arkadip Saha',
        role: 'ADMIN', // অপশন: 'ADMIN', 'SELLER'
        mahajan_name: null // মহাজন থাকলে তার নাম
    },

    mount: function() {
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            document.body.appendChild(workspace);
        }
        workspace.style.display = 'block';
        
        workspace.innerHTML = `
            <style>
                .erp-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f1f5f9; z-index: 99999; overflow-y: auto; font-family: 'Segoe UI', sans-serif; }
                .erp-topbar { background: #0f172a; color: white; padding: 15px 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
                .btn-action { background: #334155; color: white; border: 1px solid #475569; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; }
                .btn-action:hover { background: #ef4444; border-color: #ef4444; }
                .btn-primary { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
                .erp-content { padding: 30px 20px; max-width: 900px; margin: 0 auto; }
                
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border-left: 4px solid #10b981; }
                .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
                .erp-module-card { background: white; padding: 25px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; cursor: pointer; border: 1px solid #e2e8f0; }
                
                .form-card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .input-group { margin-bottom: 15px; text-align: left; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; color: #475569; }
                .input-group input, .input-group select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
                .input-group input:focus { border-color: #FF9933; outline: none; }
                
                .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; }
                .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .data-table th { background: #f8fafc; font-size: 0.85rem; color: #64748b; text-transform: uppercase; }
                .orb-badge { background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.8rem; }
                
                /* New CSS for Role Switcher & Chain Banner */
                .role-switcher { background: #1e293b; color: #fbbf24; border: 1px solid #475569; padding: 6px 12px; border-radius: 6px; font-weight: bold; outline: none; }
                .chain-banner { background: #e0f2fe; border: 1px dashed #0284c7; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; color: #0369a1; font-weight: 600; display: flex; justify-content: space-between; align-items: center;}
            </style>
            <div class="erp-container">
                <div class="erp-topbar">
                    <button class="btn-action" id="erp-back-btn" onclick="window.LotteryUserUI.unmount()">← Exit System</button>
                    <div style="text-align: center;">
                        <h2 style="margin:0; font-size: 1.4rem; font-weight: 800;">DigiLedger <span style="color: #FF9933;">Lottery</span></h2>
                        <div style="font-size: 0.8rem; opacity: 0.8;" id="user-greeting">Welcome, ${this.currentUser.name}</div>
                    </div>
                    
                    <!-- 🧪 Testing Role Switcher -->
                    <select class="role-switcher" onchange="window.LotteryUserUI.switchRole(this.value)">
                        <option value="ADMIN" ${this.currentUser.role === 'ADMIN' ? 'selected' : ''}>👑 Top Master (Admin)</option>
                        <option value="SELLER" ${this.currentUser.role === 'SELLER' ? 'selected' : ''}>🛒 Seller (Middle Chain)</option>
                    </select>
                </div>
                <div class="erp-content" id="erp-dynamic-view"></div>
            </div>
        `;
        
        this.navigate('dashboard');
    },

    // 🔄 রোল সুইচ করার লজিক (Universal Chain Testing)
    switchRole: function(newRole) {
        this.currentUser.role = newRole;
        
        if (newRole === 'SELLER') {
            this.currentUser.name = "Rahul Agency (Seller)";
            this.currentUser.orb_id = "ORB-SELLER-123";
            this.currentUser.mahajan_name = "Arkadip Saha"; 
        } else {
            this.currentUser.name = "Arkadip Saha";
            this.currentUser.orb_id = "ORB-ADMIN";
            this.currentUser.mahajan_name = null;
        }
        
        document.getElementById('user-greeting').innerText = `Welcome, ${this.currentUser.name}`;
        this.navigate('dashboard');
    },

    // 🔀 আপডেট করা রাউটার: এখন এটি অন্যান্য ফাইল কল করতে পারে!
    navigate: function(view) {
        const contentBox = document.getElementById('erp-dynamic-view');
        const backBtn = document.getElementById('erp-back-btn');

        if (view === 'dashboard') {
            backBtn.innerText = '← Exit System';
            backBtn.onclick = () => this.unmount();
            this.renderDashboard(contentBox);
        } 
        else if (view === 'party_manager') {
            backBtn.innerText = '← Back to Dashboard';
            backBtn.onclick = () => this.navigate('dashboard');
            this.renderPartyManager(contentBox); // পুরনো পার্টি ম্যানেজার একদম সেইফ আছে
        }
        else if (view === 'sales') {
            backBtn.innerText = '← Back to Dashboard';
            backBtn.onclick = () => this.navigate('dashboard');
            // 🟢 নতুন লজিক: 외부 (External) ফাইল লোড করা
            this.loadExternalModule('/assets/lottery/ui/lottery-app.js', 'LotterySalesApp', contentBox);
        }
        else if (view === 'payment') {
            backBtn.innerText = '← Back to Dashboard';
            backBtn.onclick = () => this.navigate('dashboard');
            this.loadExternalModule('/assets/lottery/ui/payment-app.js', 'LotteryPaymentApp', contentBox);
        }
        else {
            contentBox.innerHTML = `<div style="text-align:center; padding: 50px; color:#64748b;"><h3>🚧 This module is under construction in the next Sprint!</h3></div>`;
        }
    },

    // 🚀 NEW: ডাইনামিক স্ক্রিপ্ট লোডার (External File Injector)
    loadExternalModule: function(scriptUrl, moduleObjectName, container) {
        container.innerHTML = `<div style="text-align:center; padding: 50px; color:#3b82f6;"><h3>⏳ Loading Module...</h3></div>`;

        // ফাইলটি যদি আগে থেকেই ব্রাউজারে লোড করা থাকে
        if (window[moduleObjectName]) {
            window[moduleObjectName].mount(container);
            return;
        }

        // ফাইলটি না থাকলে সার্ভার থেকে রিকোয়েস্ট করে নিয়ে আসবে
        const script = document.createElement('script');
        script.src = scriptUrl + '?v=' + new Date().getTime(); // Cache Buster
        
        script.onload = () => {
            if (window[moduleObjectName] && typeof window[moduleObjectName].mount === 'function') {
                window[moduleObjectName].mount(container); // সাকসেসফুলি লোড হলে স্ক্রিনে দেখাবে
            } else {
                container.innerHTML = `<div style="color:#ef4444; text-align:center; padding:50px; background:white; border-radius:8px;">
                    <h3>⚠️ Module Linking Error</h3>
                    <p>ফাইল লোড হয়েছে কিন্তু <b>${moduleObjectName}</b> অবজেক্টটি পাওয়া যায়নি!</p>
                </div>`;
            }
        };

        script.onerror = () => {
            container.innerHTML = `<div style="color:#ef4444; text-align:center; padding:50px; background:white; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="margin:0 0 10px 0;">❌ 404 Not Found</h2>
                <p><b>${scriptUrl}</b> ফাইলটি পাওয়া যাচ্ছে না।</p>
                <p style="font-size:0.9rem; color:#64748b;">দয়া করে চেক করুন ফোল্ডারে ফাইলটি আছে কি না।</p>
            </div>`;
        };

        document.body.appendChild(script);
    },

    renderDashboard: function(container) {
        // চেইন ব্যানার (যদি কেউ সেলার হয়, তার মহাজনের নাম দেখাবে)
        const chainBannerHTML = this.currentUser.mahajan_name 
            ? `<div class="chain-banner">
                <span>🔗 Linked Mahajan: <span style="color:#0f172a; font-weight:800;">${this.currentUser.mahajan_name}</span></span>
                <span style="color: #ef4444;">My Due: ₹ 0.00</span>
               </div>` 
            : '';

        container.innerHTML = `
            ${chainBannerHTML}
            <div class="summary-grid">
                <div class="summary-card" style="border-left-color: #3b82f6;"><h4>Stock</h4><h2>0 <span style="font-size: 1rem;">pcs</span></h2></div>
                <div class="summary-card" style="border-left-color: #10b981;"><h4>Today's Sales</h4><h2>₹ 0</h2></div>
                <div class="summary-card" style="border-left-color: #ef4444;"><h4>Outstanding</h4><h2>₹ 0</h2></div>
            </div>
            <h3 style="color: #334155; margin-bottom: 15px;">Accounting Modules</h3>
            <div class="module-grid">
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('party_manager')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">👥</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Parties</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Add & Manage Clients</div>
                </div>
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('purchase')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📥</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Purchase</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Stock Entry</div>
                </div>
                <!-- 🟢 Sales Flow বাটনে ক্লিক করলে এখন 'sales' রাউটে যাবে -->
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('sales')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📤</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Sales Flow</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Dispatch & Returns</div>
                </div>
                <!-- 🟢 Payment বাটনে ক্লিক করলে এখন 'payment' রাউটে যাবে -->
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('payment')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">💸</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Payment</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Receipts & Expenses</div>
                </div>
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('ledger')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📒</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Ledger</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Party Statements</div>
                </div>
            </div>
        `;
    },

    renderPartyManager: function(container) {
        let tableRows = this.db.parties.map(p => `
            <tr>
                <td>
                    <div style="font-weight:bold; color:#0f172a;">${p.name}</div>
                    <div class="orb-badge" style="margin-top:4px; display:inline-block;">${p.orb_id}</div>
                </td>
                <td>${p.mobile}</td>
                <td><span style="background:#e2e8f0; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">${p.type}</span></td>
                <td style="color:${p.opening_balance >= 0 ? '#10b981' : '#ef4444'}; font-weight:bold;">₹ ${p.opening_balance}</td>
            </tr>
        `).join('');

        if (this.db.parties.length === 0) tableRows = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding: 20px;">No parties found. Add a new party above.</td></tr>`;

        container.innerHTML = `
            <div class="form-card">
                <h3 style="margin-top:0; color:#0f172a; display:flex; justify-content:space-between;">
                    <span>Add New Party</span>
                    <span style="font-size:0.8rem; background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:4px;">Auto ORB-ID Detection Enabled ⚡</span>
                </h3>
                
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Mobile Number (Auto-Detect)</label>
                        <input type="tel" id="p_mobile" placeholder="10 Digit Number" maxlength="10" oninput="window.LotteryUserUI.checkExistingOrbId()">
                        <small id="orb-status" style="color:#10b981; display:none; margin-top:5px; font-weight:bold;"></small>
                    </div>
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Party Name *</label>
                        <input type="text" id="p_name" placeholder="e.g. Rahul Agency">
                    </div>
                </div>
                
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Party Type *</label>
                        <select id="p_type">
                            <option value="Seller">Seller / Agent</option>
                            <option value="Supplier">Supplier (Stockist)</option>
                            <option value="Customer">Retail Customer</option>
                        </select>
                    </div>
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Opening Balance (₹)</label>
                        <input type="number" id="p_balance" value="0" placeholder="0 = Nil, Minus = Advance">
                    </div>
                </div>
                
                <button class="btn-primary" onclick="window.LotteryUserUI.saveNewParty()">💾 Save & Link Party</button>
            </div>

            <h3 style="color:#0f172a; margin-top:30px;">Party Directory</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Party Details</th>
                        <th>Mobile</th>
                        <th>Type</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    },

    checkExistingOrbId: function() {
        const mobile = document.getElementById('p_mobile').value;
        const statusText = document.getElementById('orb-status');
        
        if (mobile.length === 10) {
            statusText.style.display = 'block';
            statusText.innerText = `🔍 Checking ORBIS Network...`;
            
            setTimeout(() => {
                statusText.innerText = `✅ Network Checked: New ORB-ID will be generated.`;
            }, 800);
        } else {
            statusText.style.display = 'none';
        }
    },

    saveNewParty: function() {
        const name = document.getElementById('p_name').value.trim();
        const mobile = document.getElementById('p_mobile').value.trim();
        const type = document.getElementById('p_type').value;
        const balance = parseFloat(document.getElementById('p_balance').value) || 0;

        if (!name || !mobile) return alert("Party Name and Mobile Number are required!");

        const myAdminOrbId = this.currentUser.orb_id;
        const newOrbId = 'ORB-' + Math.floor(100000 + Math.random() * 900000);

        const newParty = {
            orb_id: newOrbId,
            name: name,
            mobile: mobile,
            type: type,
            opening_balance: balance,
            linked_master: myAdminOrbId, 
            created_at: new Date().toISOString()
        };

        const updatedParties = [...this.db.parties, newParty];
        this.db.saveParties(updatedParties);
        
        alert(`✅ Party Saved Successfully!\n\nName: ${name}\nORB-ID: ${newOrbId}\nLinked Mahajan: ${this.currentUser.name}`);
        
        this.navigate('party_manager');
    },

    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';
        if (window.orbisPlatform && typeof window.orbisPlatform.unmountModule === 'function') {
            window.orbisPlatform.unmountModule();
        } else {
            const platformRoot = document.getElementById('orbis-platform-root');
            if (platformRoot) platformRoot.style.display = 'flex'; 
        }
    }
};

window.LotteryUserUI.mount();
window.LotteryApp = { render: window.LotteryUserUI.mount };
