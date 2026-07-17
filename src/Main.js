import { TaskProcessor } from './TaskProcessor.js';

const processor = new TaskProcessor();

async function runTest() {
  console.log("--- ORBIS Testing & Refinement ---");
  
  const codingResult = await processor.routeTask("Write a Python script", "CODING");
  console.log(codingResult);

  const visionResult = await processor.routeTask("Analyze this image", "VISION");
  console.log(visionResult);
}

await runTest();

// ==================================================================
// 🚀 ORBIS MODULE MANAGER (Plug & Play Gateway)
// ==================================================================
// এই অংশটি সম্পূর্ণ স্বাধীন। এটি TaskProcessor-এর কোনো কাজে বাধা দেবে না।
// এর কাজ শুধু লটারি বা অন্যান্য মাইক্রো-মডিউলগুলোকে ডায়নামিকভাবে কল করা।

if (typeof window !== 'undefined') {
    window.OrbisApp = {
        mountModule: function(moduleName) {
            if (moduleName === 'lottery') {
                console.log("[ORBIS Core] Initiating Lottery Module (Black Box)...");
                
                // লটারির মেইন এন্ট্রি পয়েন্টকে কল করা হচ্ছে
                const scriptUrl = '/assets/lottery/ui/user-view.js?v=' + new Date().getTime(); // Cache Buster
                
                const script = document.createElement('script');
                script.src = scriptUrl;
                
                script.onload = () => {
                    console.log("[ORBIS Core] 🟢 Lottery Module Loaded Successfully.");
                };
                
                script.onerror = () => {
                    console.error("[ORBIS Core] 🔴 Failed to load Lottery Module at:", scriptUrl);
                };
                
                document.body.appendChild(script);
            }
        }
    };

    // URL চেক করে অটোমেটিক মডিউল লোড করা (যেমন: আপনারডোমেন.com/?view=lottery)
    window.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'lottery' || window.location.hash === '#lottery') {
            window.OrbisApp.mountModule('lottery');
        }
    });
}
