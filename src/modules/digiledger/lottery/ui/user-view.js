// File: src/modules/digiledger/lottery/ui/user-view.js
// 📊 DigiLedger: Master Accounting Engine (V2 - Internal Routing & Party Management)

window.LotteryUserUI = {
    // 🗄️ ইন্টারনাল লোকাল ডাটাবেস (Offline First Architecture)
    db: {
        parties: JSON.parse(localStorage.getItem('dl_parties')) || [],
        transactions: JSON.parse(localStorage.getItem('dl_txns')) || [],
        
        saveParties: function(data) {
            localStorage.setItem('dl_parties', JSON.stringify(data));
            this.parties = data;
        }
    },

    // 🟢 মডিউল স্টার্ট বাটন
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
        
        // বেসিক ফ্রেমওয়ার্ক ইনজেক্ট করা (যেখানে পেজগুলো বদলাবে)
        workspace.innerHTML = `
            <style>
                .erp-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f1f5f9; z-index: 99999; overflow-y: auto; font-family: 'Segoe UI', sans-serif; }
                .erp-topbar { background: #0f172a; color: white; padding: 15px 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
                .btn-action { background: #334155; color: white; border: 1px solid #475569; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; }
                .btn-action:hover { background: #ef4444; border-color: #ef4444; }
                .btn-primary { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
                .erp-content { padding: 30px 20px; max-width: 900px; margin: 0 auto; }
                
                /* Dashboard Cards */
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border-left: 4px solid #10b981; }
                .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
                .erp-module-card { background: white; padding: 25px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; cursor: pointer; border: 1px solid #e2e8f0; }
                
                /* Forms & Tables */
                .form-card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .input-group { margin-bottom: 15px; text-align: left; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; color: #475569; }
                .input-group input, .input-group select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
                
                .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; }
                .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .data-table th { background: #f8fafc; font-size: 0.85rem; color: #64748b; text-transform: uppercase; }
            </style>
            <div class="erp-container">
                <div class="erp-topbar">
                    <button class="btn-action" id="erp-back-btn" onclick="window.LotteryUserUI.unmount()">← Exit System</button>
                    <h2 style="margin:0; font-size: 1.4rem; font-weight: 800;">DigiLedger <span style="color: #FF9933;">Lottery</span></h2>
                    <div style="font-size: 0.9rem; opacity: 0.8;" id="erp-current-view">Dashboard</div>
                </div>
                <div class="erp-content" id="erp-dynamic-view">
                    <!-- Views will be injected here -->
                </div>
            </div>
        `;
        
        this.navigate('dashboard');
    },

    // 🔀 ইন্টারনাল রাউটার (মডিউলের ভেতরেই পেজ পরিবর্তন করার লজিক)
    navigate: function(view) {
        const contentBox = document.getElementById('erp-dynamic-view');
        const backBtn = document.getElementById('erp-back-btn');
        const viewTitle = document.getElementById('erp-current-view');

        if (view === 'dashboard') {
            backBtn.innerText = '← Exit System';
            backBtn.onclick = () => this.unmount();
            viewTitle.innerText = 'Admin Terminal';
            this.renderDashboard(contentBox);
        } 
        else if (view === 'party_manager') {
            backBtn.innerText = '← Back to Dashboard';
            backBtn.onclick = () => this.navigate('dashboard');
            viewTitle.innerText = 'Party Management';
            this.renderPartyManager(contentBox);
        }
        else {
            alert("This module is under construction in the next Sprint!");
        }
    },

    // 📊 ১. মেইন ড্যাশবোর্ড ভিউ
    renderDashboard: function(container) {
        container.innerHTML = `
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
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('sales')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📤</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Sales Flow</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Dispatch & Returns</div>
                </div>
                <div class="erp-module-card" onclick="window.LotteryUserUI.navigate('ledger')">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📒</div>
                    <div style="font-weight: bold; font-size: 1.1rem;">Ledger</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Party Statements</div>
                </div>
            </div>
        `;
    },

    // 👥 ২. পার্টি ম্যানেজমেন্ট ভিউ (Add Party & View List)
    renderPartyManager: function(container) {
        let tableRows = this.db.parties.map(p => `
            <tr>
                <td style="font-weight:bold;">${p.name}</td>
                <td>${p.mobile}</td>
                <td><span style="background:#e2e8f0; padding:3px 8px; border-radius:12px; font-size:0.75rem;">${p.type}</span></td>
                <td style="color:${p.opening_balance >= 0 ? '#10b981' : '#ef4444'}; font-weight:bold;">₹ ${p.opening_balance}</td>
            </tr>
        `).join('');

        if (this.db.parties.length === 0) tableRows = `<tr><td colspan="4" style="text-align:center; color:#64748b;">No parties added yet.</td></tr>`;

        container.innerHTML = `
            <div class="form-card">
                <h3 style="margin-top:0; color:#0f172a;">Add New Party</h3>
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Party Name *</label>
                        <input type="text" id="p_name" placeholder="e.g. Rahul Agency">
                    </div>
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Mobile Number</label>
                        <input type="text" id="p_mobile" placeholder="10 Digit Number">
                    </div>
                </div>
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Party Type *</label>
                        <select id="p_type">
                            <option value="Seller">Seller / Agent</option>
                            <option value="Supplier">Supplier (Stockist)</option>
                            <option value="Customer">Customer</option>
                        </select>
                    </div>
                    <div class="input-group" style="flex:1; min-width:200px;">
                        <label>Opening Balance (₹)</label>
                        <input type="number" id="p_balance" value="0" placeholder="0 = Nil, Minus = Advance">
                    </div>
                </div>
                <button class="btn-primary" onclick="window.LotteryUserUI.saveNewParty()">💾 Save Party</button>
            </div>

            <h3 style="color:#0f172a; margin-top:30px;">Party Directory</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Party Name</th>
                        <th>Mobile</th>
                        <th>Type</th>
                        <th>Opening Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    },

    // 💾 ডাটাবেসে পার্টি সেভ করার লজিক
    saveNewParty: function() {
        const name = document.getElementById('p_name').value.trim();
        const mobile = document.getElementById('p_mobile').value.trim();
        const type = document.getElementById('p_type').value;
        const balance = parseFloat(document.getElementById('p_balance').value) || 0;

        if (!name) return alert("Party Name is required!");

        const newParty = {
            id: 'PTY-' + Date.now(),
            name: name,
            mobile: mobile,
            type: type,
            opening_balance: balance,
            created_at: new Date().toISOString()
        };

        // লোকাল ডাটাবেসে পুশ করা এবং সেভ করা
        const updatedParties = [...this.db.parties, newParty];
        this.db.saveParties(updatedParties);
        
        // UI রিফ্রেশ করা
        this.navigate('party_manager');
    },

    // 🔴 এক্সিট লজিক
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
