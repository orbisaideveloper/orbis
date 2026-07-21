console.log("Lottery Module Script Loaded Successfully!"); // 🟢 Fixed uppercase 'C'

window.LotteryUserUI = {
    // এই mount ফাংশনটাই আমাদের ModuleLoader খুঁজছিল!
    mount: function() {
        console.log("Lottery Module Mount Triggered!");
        
        const lotteryHTML = `
            <div style="padding: 30px; text-align: center; color: #333; background: #ffffff; border-radius: 12px; margin: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h2 style="color: #0056b3; margin-bottom: 10px;">🎉 Welcome to ORBIS Lottery!</h2>
                <p style="font-size: 16px; color: #666;">The Lottery workspace is now completely live and connected.</p>
                
                <div style="margin-top: 25px;">
                    <button onclick="alert('System Ready for Action!')" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Initialize Ledger
                    </button>
                    <button onclick="window.orbisPlatform.unmountModule()" style="padding: 12px 24px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Close & Back
                    </button>
                </div>
            </div>
        `;

        // লটারির জন্য একটি নির্দিষ্ট ওয়ার্কস্পেস কন্টেইনার তৈরি বা খোঁজা হচ্ছে
        let workspace = document.getElementById("lottery-user-workspace");
        
        if (!workspace) {
            // কন্টেইনার না থাকলে বডির ওপর একদম ফুল স্ক্রিন একটা লেয়ার তৈরি হবে
            workspace = document.createElement("div");
            workspace.id = "lottery-user-workspace";
            workspace.style.position = "absolute";
            workspace.style.top = "0";
            workspace.style.left = "0";
            workspace.style.width = "100%";
            workspace.style.height = "100vh";
            workspace.style.backgroundColor = "#f8f9fa";
            workspace.style.zIndex = "1000"; // সবার ওপরে দেখানোর জন্য
            workspace.style.overflowY = "auto";
            workspace.style.paddingTop = "20px";
            document.body.appendChild(workspace);
        }
        
        // এবার লটারির ডিজাইনটা কন্টেইনারে বসিয়ে সেটাকে দৃশ্যমান করা হলো
        workspace.innerHTML = lotteryHTML;
        workspace.style.display = "block";
    }
};
