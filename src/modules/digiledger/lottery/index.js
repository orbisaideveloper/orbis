window.LotteryModule = {
    // এই ফাংশনটাই মেইন ORBIS-এর module-loader কল করবে
    mount: function() {
        console.log("🚀 Lottery Micro-App is booting up...");
        
        // ORBIS-এর মেইন কন্টেইনার ধরছি
        const workspace = document.getElementById('orbis-workspace') || document.querySelector('.main-content');
        
        if (!workspace) {
            console.error("❌ Error: ORBIS Workspace container not found!");
            return;
        }
        
        // কন্টেইনার ক্লিয়ার করা
        workspace.innerHTML = '';
        
        // টেস্টিংয়ের জন্য বেসিক UI ইনজেক্ট করা হচ্ছে
        workspace.innerHTML = `
            <div class="lottery-module-container" style="padding: 20px; color: #fff; background: #1a1a2e; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif;">
                <h1 style="color: #4CAF50; margin-bottom: 10px;">🎟️ Lottery Module Hooked Successfully!</h1>
                <p style="font-size: 18px;">Status: Phase 1 & Phase 2 Complete.</p>
                <div style="margin-top: 20px; padding: 15px; border: 1px solid #333; border-radius: 8px; background: #111;">
                    <p style="color: #aaa; margin: 0;">Next Step: Injecting the real UI...</p>
                </div>
            </div>
        `;
    }
};

    // কনসোল দেখার টুল ইনজেক্ট করা হচ্ছে
(function () {
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.body.appendChild(script);
    script.onload = function () { eruda.init() };
})();

window.LotteryModule = {
    mount: function() {
        console.log("🚀 Lottery Micro-App is booting up...");
        
        const workspace = document.getElementById('orbis-workspace') || document.querySelector('.main-content');
        
        if (!workspace) {
            console.error("❌ Error: ORBIS Workspace container not found!");
            return;
        }
        
        workspace.innerHTML = `
            <div class="lottery-module-container" style="padding: 20px; color: #fff; background: #1a1a2e; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif;">
                <h1 style="color: #4CAF50; margin-bottom: 10px;">🎟️ Lottery Module Hooked Successfully!</h1>
                <p style="font-size: 18px;">যদি আপনি এই লেখাটি দেখতে পান, তার মানে সব ঠিক আছে!</p>
            </div>
        `;
    }
};
