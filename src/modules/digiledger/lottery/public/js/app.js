// ORBIS Lottery Module Logic
console.log("Lottery Module Loaded Successfully");

function startLottery() {
    const randomNum = Math.floor(Math.random() * 1000);
    const resultDiv = document.getElementById('result');
    if(resultDiv) {
        resultDiv.innerHTML = `<h3 style="margin: 0;">Lucky Number: <span style="color: #ef4444; font-size: 2rem;">${randomNum}</span></h3>`;
    }
}

// ==================================================================
// 🚀 ORBIS MODULE CONNECTOR (Plug & Play)
// ==================================================================
// ড্যাশবোর্ডের 'Sales Flow' বাটনে ক্লিক করলে এই mount ফাংশনটি কল হবে
window.LotterySalesApp = {
    mount: function(container) {
        // ড্যাশবোর্ডের কন্টেইনারের ভেতরে আপনার লটারির ডিজাইন ইনজেক্ট করা হচ্ছে
        container.innerHTML = `
            <div style="background: white; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🎟️</div>
                <h2 style="color: #0f172a; margin-top: 0;">Lottery Sales Flow</h2>
                <p style="color: #64748b; margin-bottom: 25px;">Generate a random lucky number for the dispatch entry.</p>
                
                <button class="btn-primary" onclick="startLottery()" style="font-size: 1.1rem; padding: 12px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    🎲 Draw Lucky Number
                </button>
                
                <!-- রেজাল্ট দেখানোর জায়গা -->
                <div id="result" style="margin-top: 30px; color: #10b981; min-height: 50px;"></div>
            </div>
        `;
        
        console.log("[LotterySalesApp] Successfully mounted inside ERP Dashboard.");
    }
};
