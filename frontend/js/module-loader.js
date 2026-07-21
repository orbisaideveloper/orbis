window.ModuleLoader = {
    // মডিউল লোড এবং UI টগল করার লজিক
    loadModule: function(moduleName) {
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

        if (moduleName === 'home') return;

        // মডিউল রেজিস্ট্রি থেকে সঠিক পাথ টেনে আনা হচ্ছে
        let scriptPath = '';
        if (window.ModuleRegistry && window.ModuleRegistry.get(moduleName)) {
            scriptPath = window.ModuleRegistry.get(moduleName).scriptPath;
        } else {
            // EXTENSION: নতুন মডিউল স্ট্রাকচারের পাথ সেট করা হলো
            scriptPath = moduleName === 'lottery' 
                ? '/src/modules/digiledger/lottery/index.js' 
                : `/modules/${moduleName}/${moduleName}.js`;
        }

        this.injectScript(scriptPath, moduleName);
    },

    // স্ক্রিপ্ট ইনজেক্ট এবং সঠিক সময়ে মাউন্ট করার লজিক
    injectScript: function(path, moduleName) {
        // যদি স্ক্রিপ্ট আগে থেকেই লোড করা থাকে, তবে আবার লোড না করে সরাসরি মাউন্ট করবে
        if (document.querySelector(`script[src^="${path.split('?')[0]}"]`)) {
            this.triggerMount(moduleName);
            return;
        }

        const script = document.createElement('script');
        const cacheBuster = new Date().getTime(); 
        script.src = `${path}?v=${cacheBuster}`;
        
        script.onload = () => {
            console.log(`✅ Successfully loaded: ${path}`);
            // আসল ম্যাজিক: ফাইল পুরোপুরি ডাউনলোড হওয়ার পরই মাউন্ট ট্রিগার হবে
            this.triggerMount(moduleName);
        };
        
        script.onerror = () => {
            console.error(`❌ System Error: Failed to load module script from path: ${path}`);
        };
        
        document.body.appendChild(script);
    },

    // মডিউল স্ক্রিনে রেন্ডার করার ফাংশন
    triggerMount: function(moduleName) {
        if (moduleName === 'lottery') {
            // EXTENSION: নতুন Micro-App আর্কিটেকচার সাপোর্ট
            if (typeof window.LotteryModule !== 'undefined' && typeof window.LotteryModule.mount === 'function') {
                window.LotteryModule.mount();
            } 
            // OLD LOGIC PRESERVED: পুরানো ফাইল সাপোর্ট (যাতে ক্র্যাশ না করে)
            else if (typeof window.LotteryUserUI !== 'undefined' && typeof window.LotteryUserUI.mount === 'function') {
                window.LotteryUserUI.mount();
            }
        }
    }
};
