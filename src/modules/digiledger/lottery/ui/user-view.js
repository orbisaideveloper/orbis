// File: src/modules/digiledger/lottery/ui/user-view.js
// 📊 DigiLedger: Lottery Master Dashboard (ERP)

window.LotteryUserUI = {
    // 🟢 মডিউল স্টার্ট বাটন
    mount: function() {
        // ১. মেইন ড্যাশবোর্ড লুকিয়ে ফেলা
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        // ২. লেজারের জন্য নিজস্ব ওয়ার্কস্পেস তৈরি করা
        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            document.body.appendChild(workspace);
        }
        
        // ৩. ওয়ার্কস্পেস ভিজিবল করা এবং ERP ড্যাশবোর্ড ইনজেক্ট করা
        workspace.style.display = 'block';
        workspace.innerHTML = `
            <style>
                /* 🎨 Professional Dashboard CSS */
                .erp-container { 
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                    background: #f1f5f9; z-index: 99999; overflow-y: auto; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .erp-topbar { 
                    background: #0f172a; color: white; padding: 15px 25px; 
                    display: flex; align-items: center; justify-content: space-between; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10;
                }
                .btn-exit { 
                    background: #334155; color: white; border: 1px solid #475569; padding: 8px 15px; 
                    border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;
                }
                .btn-exit:hover { background: #ef4444; border-color: #ef4444; }
                
                .erp-content { padding: 30px 20px; max-width: 900px; margin: 0 auto; }
                
                /* Business Summary Cards */
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .summary-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border-left: 4px solid #10b981; }
                .summary-card h4 { margin: 0 0 10px 0; color: #64748b; font-size: 0.9rem; text-transform: uppercase; }
                .summary-card h2 { margin: 0; color: #0f172a; font-size: 1.8rem; }
                
                /* Module Grid (The Main Buttons) */
                .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
                .erp-module-card { 
                    background: white; padding: 25px 20px; border-radius: 12px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; 
                    cursor: pointer; transition: all 0.2s; border: 1px solid #e2e8f0;
                }
                .erp-module-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: #cbd5e1; }
                .module-icon { font-size: 2.5rem; margin-bottom: 15px; display: inline-block; padding: 15px; background: #f8fafc; border-radius: 50%; }
                .module-title { font-weight: bold; font-size: 1.1rem; color: #1e293b; margin-bottom: 5px; }
                .module-desc { font-size: 0.8rem; color: #64748b; }
            </style>

            <div class="erp-container">
                <!-- Top Navigation -->
                <div class="erp-topbar">
                    <button class="btn-exit" onclick="window.LotteryUserUI.unmount()">← Exit System</button>
                    <h2 style="margin:0; font-size: 1.4rem; font-weight: 800; letter-spacing: 1px;">DigiLedger <span style="color: #FF9933;">Lottery</span></h2>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Admin Terminal</div>
                </div>

                <div class="erp-content">
                    
                    <!-- Quick Business Overview -->
                    <h3 style="color: #334155; margin-bottom: 15px; font-size: 1.2rem;">Business Health (Today)</h3>
                    <div class="summary-grid">
                        <div class="summary-card" style="border-left-color: #3b82f6;">
                            <h4>Stock Available</h4>
                            <h2>12,500 <span style="font-size: 1rem; color: #64748b;">pcs</span></h2>
                        </div>
                        <div class="summary-card" style="border-left-color: #10b981;">
                            <h4>Today's Sales</h4>
                            <h2>₹ 45,200</h2>
                        </div>
                        <div class="summary-card" style="border-left-color: #ef4444;">
                            <h4>Total Outstanding</h4>
                            <h2>₹ 1,12,000</h2>
                        </div>
                    </div>

                    <!-- Master Control Menu -->
                    <h3 style="color: #334155; margin-bottom: 15px; font-size: 1.2rem; margin-top: 40px;">Accounting Modules</h3>
                    <div class="module-grid">
                        
                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Purchase')">
                            <div class="module-icon">📥</div>
                            <div class="module-title">Purchase</div>
                            <div class="module-desc">Stock entry from supplier</div>
                        </div>

                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Sales')">
                            <div class="module-icon">📤</div>
                            <div class="module-title">Sales Flow</div>
                            <div class="module-desc">Dispatch & Returns (Table)</div>
                        </div>

                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Payment')">
                            <div class="module-icon">💸</div>
                            <div class="module-title">Payments</div>
                            <div class="module-desc">Receipts & Expenses</div>
                        </div>

                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Ledgers')">
                            <div class="module-icon">📒</div>
                            <div class="module-title">Party Ledgers</div>
                            <div class="module-desc">Statements & Outstanding</div>
                        </div>

                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Stock')">
                            <div class="module-icon">📦</div>
                            <div class="module-title">Inventory</div>
                            <div class="module-desc">Live Stock Tracking</div>
                        </div>

                        <div class="erp-module-card" onclick="window.LotteryUserUI.openSubModule('Reports')">
                            <div class="module-icon">📊</div>
                            <div class="module-title">Reports</div>
                            <div class="module-desc">Daily & Monthly Analytics</div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    },

    // 🟢 সাব-মডিউল ওপেন করার লজিক (ভবিষ্যতে এখানেই Sales/Purchase এর কোড কানেক্ট হবে)
    openSubModule: function(moduleName) {
        alert(`🚀 Opening [${moduleName}] Module...\n\n(এই বাটনে ক্লিক করলে ${moduleName}-এর আসল পেজটি লোড হবে। এর ডিজাইন আমরা পরবর্তী ধাপে করবো।)`);
    },

    // 🔴 এক্সিট বাটন: মডিউল বন্ধ হয়ে আবার ORBIS ড্যাশবোর্ডে ফিরে যাবে
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

// 🟢 স্ক্রিপ্টটি ইনজেক্ট হওয়ামাত্রই যেন UI অটোমেটিক চালু হয়
window.LotteryUserUI.mount();

// 🟢 প্ল্যাটফর্ম কোর-এর আগের রেন্ডার কমান্ডের সাথে সংযোগ রাখার জন্য (Bridge)
window.LotteryApp = { render: window.LotteryUserUI.mount };
