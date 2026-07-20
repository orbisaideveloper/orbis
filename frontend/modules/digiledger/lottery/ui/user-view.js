console.log("Lottery Module Script Loaded Successfully!");

const lotteryHTML = `
    <div style="padding: 30px; text-align: center; color: #333; background: #ffffff; border-radius: 12px; margin: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #0056b3; margin-bottom: 10px;">🎉 Welcome to ORBIS Lottery!</h2>
        <p style="font-size: 16px; color: #666;">The Lottery workspace is now completely live and connected.</p>
        
        <div style="margin-top: 25px;">
            <button onclick="alert('System Ready for Action!')" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                Initialize Ledger
            </button>
            <button onclick="window.location.reload()" style="padding: 12px 24px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                Close & Back to Chat
            </button>
        </div>
    </div>
`;

// index.html-এ থাকা আসল কন্টেইনারে মডিউলটি বসাচ্ছি
const platformRoot = document.getElementById("orbis-platform-root");

if (platformRoot) {
    platformRoot.innerHTML = lotteryHTML;
} else {
    console.error("Error: 'orbis-platform-root' not found in index.html!");
}
