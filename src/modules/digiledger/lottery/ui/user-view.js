// File: src/modules/digiledger/lottery/ui/user-view.js
// 🎟️ DigiLedger Lottery: User Micro-Frontend

window.LotteryUserUI = {
    // 🟢 এই ফাংশনটা কল হলেই লটারি মডিউল স্ক্রিনে ভেসে উঠবে
    mount: function() {
        // ১. মেইন ড্যাশবোর্ড লুকিয়ে ফেলা
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        // ২. লটারির জন্য নিজস্ব ওয়ার্কস্পেস তৈরি করা (যদি না থাকে)
        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            document.body.appendChild(workspace);
        }
        
        // ৩. ওয়ার্কস্পেস ভিজিবল করা এবং ডিজাইন ইনজেক্ট করা
        workspace.style.display = 'block';
        workspace.innerHTML = `
            <style>
                /* 🎨 সম্পূর্ণ স্বাধীন CSS: বাইরের কোনো ডিজাইনের সাথে ধাক্কা খাবে না */
                .lottery-app-container { 
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                    background: #f8fafc; z-index: 99999; overflow-y: auto; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .lottery-top-nav { 
                    background: #ffffff; padding: 15px 20px; display: flex; 
                    align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    position: sticky; top: 0; z-index: 10;
                }
                .btn-back-dash { 
                    background: #e2e8f0; color: #0f172a; border: none; padding: 8px 16px; 
                    border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem;
                }
                .lottery-main-content { padding: 20px; max-width: 600px; margin: 0 auto; }
                .ticket-card { 
                    background: white; padding: 25px; border-radius: 12px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; border: 1px solid #e2e8f0;
                }
                .buy-btn {
                    background: #10b981; color: white; border: none; padding: 12px 30px;
                    border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;
                    margin-top: 15px; width: 100%; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                }
            </style>

            <div class="lottery-app-container">
                <div class="lottery-top-nav">
                    <button class="btn-back-dash" onclick="window.LotteryUserUI.unmount()">← Back</button>
                    <h2 style="margin:0; color: #0f172a; font-size: 1.2rem;">🎟️ DigiLedger Lottery</h2>
                </div>

                <div class="lottery-main-content">
                    <div class="ticket-card">
                        <h1 style="font-size: 3rem; margin: 0 0 10px 0;">🎰</h1>
                        <h3 style="margin:0; color: #0f172a; font-size: 1.4rem;">Today's Mega Draw</h3>
                        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px;">
                            Secure your digital ticket directly to your mobile number.
                        </p>
                        <button class="buy-btn" onclick="alert('Ticket purchasing backend logic will connect here!')">Buy Ticket Now</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 🔴 এই ফাংশনটা কল হলে লটারি মডিউল বন্ধ হয়ে আবার ড্যাশবোর্ডে ফিরে যাবে
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';

        const platformRoot = document.getElementById('orbis-platform-root');
        // display: flex ছিল প্ল্যাটফর্মের অরিজিনাল স্টাইল
        if (platformRoot) platformRoot.style.display = 'flex'; 
    }
};
