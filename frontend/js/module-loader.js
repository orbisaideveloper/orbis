"use strict"; // Strict mode enabled

window.ModuleLoader = {
    
    // মডিউল লোড এবং UI টগল করার লজিক
    loadModule: async function(moduleName) {
        const chatSection = document.querySelector('.chat-section');
        const topNav = document.querySelector('.top-nav');

        if (moduleName === 'lottery' || moduleName.includes('lottery')) {
            // লটারি হলে চ্যাট এবং হেডার দুটোই হাইড হবে
            if (chatSection) chatSection.style.display = 'none';
            if (topNav) topNav.style.display = 'none';
        } else {
            // অন্যথায় আবার আগের মতো দেখাবে
            if (chatSection) chatSection.style.display = '';
            if (topNav) topNav.style.display = 'flex';
        }

        if (moduleName === 'home') {
            return;
        }

        // মডিউলের পাথ তৈরি করা (আপনার প্রজেক্টের ফোল্ডার স্ট্রাকচার অনুযায়ী পরিবর্তন হতে পারে)
        const scriptPath = `/modules/${moduleName}/${moduleName}.js`; 
        this.injectScript(scriptPath);
    },

    // স্ক্রিপ্ট ইনজেক্ট এবং ক্যাশ ক্লিয়ারিং লজিক
    injectScript: function(path) {
        const script = document.createElement('script');
        
        // 🚀 Cache Buster: প্রতিবার লোড হওয়ার সময় ফাইলের নামের শেষে নতুন টাইমস্ট্যাম্প বসিয়ে দেবে
        // ফলে ব্রাউজার পুরনো ক্যাশ ধরে রাখতে পারবে না!
        const cacheBuster = new Date().getTime(); 
        script.src = `${path}?v=${cacheBuster}`;
        
        script.onload = () => console.log(`✅ Successfully loaded: ${path}`);
        
        script.onerror = () => {
            // স্ক্রিপ্ট লোড হতে ফেইল করলে আমরা ইচ্ছা করে একটি Error থ্রো করছি, 
            // যাতে আপনার index.html-এ বসানো 'Global Error Catcher' এটা ধরে ফেলে এবং স্ক্রিনে লাল দাগ দেখায়।
            throw new Error(`System Error: Failed to load module script from path: ${path}`);
        };
        
        document.body.appendChild(script);
    }
};
