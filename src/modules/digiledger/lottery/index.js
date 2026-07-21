/**
 * Lottery Micro-App
 * File: index.js
 * Status: Debug & Mount Ready
 */

// ১. কনসোল দেখার টুল ইনজেকশন (Eruda)
(function () {
    if (typeof eruda === 'undefined') {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = function () { eruda.init(); };
    }
})();

// ২. মডিউল মাউন্টিং লজিক
window.LotteryModule = {
    mount: function() {
        console.log("🚀 Lottery Micro-App is booting up...");
        
        // ORBIS-এর মেইন কন্টেইনার খোঁজা
        const workspace = document.getElementById('orbis-workspace') || document.querySelector('.main-content');
        
        if (!workspace) {
            console.error("❌ Error: ORBIS Workspace container not found!");
            return;
        }
        
        // কন্টেইনার ক্লিয়ার করে নতুন UI ইনজেক্ট করা
        workspace.innerHTML = `
            <div class="lottery-module-container" style="padding: 20px; color: #fff; background: #1a1a2e; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif;">
                <h1 style="color: #4CAF50; margin-bottom: 10px;">🎟️ Lottery Module Hooked!</h1>
                <p style="font-size: 18px;">সিস্টেম সচল আছে এবং লটারি মডিউল লোড হয়েছে।</p>
                <div style="margin-top: 20px; padding: 10px; background: #333; border-radius: 5px;">
                    <small>Debug Status: Active</small>
                </div>
            </div>
        `;
        console.log("✅ Lottery Module successfully mounted to workspace.");
    }
};
