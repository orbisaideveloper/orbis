/**
 * Lottery Micro-App
 * File: bootstrap.js
 * Status: Standalone Mount Ready
 */

// ১. কনসোল দেখার টুল ইনজেকশন (Eruda)
(function () {
    if (typeof eruda === 'undefined') {
        eruda.init();
    }
})();

document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Standalone Lottery App is booting up...");
    
    // ORBIS-এর ড্যাশবোর্ডের বদলে আমরা নিজস্ব কন্টেইনার ব্যবহার করছি
    const standaloneContainer = document.getElementById('lottery-standalone-root');
    
    if (!standaloneContainer) {
        console.error("❌ Error: Standalone root container not found!");
        return;
    }

    // ২. লটারি মডিউল মাউন্ট করা (লজিক অপরিবর্তিত)
    if (window.LotterySalesApp && typeof window.LotterySalesApp.mount === 'function') {
        window.LotterySalesApp.mount(standaloneContainer);
        console.log("✅ Lottery Module successfully mounted in Standalone Mode.");
    } else {
        console.error("❌ Error: LotterySalesApp logic not found.");
    }
});
