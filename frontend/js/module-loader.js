// js/module-loader.js - Central Module Loader
window.ModuleLoader = {
    init: function() {
        // রাউটারের পাঠানো নেভিগেশন ইভেন্ট শুনবে
        window.EventBus.on('NavigateTo', (data) => {
            this.loadModule(data.target);
        });
    },

    loadModule: async function(moduleName) {
        if (moduleName === 'home') {
            // হোম ভিউ রেন্ডার লজিক
            return;
        }

        // মডিউল রেজিস্ট্রি থেকে চেক করবে মডিউলটি আছে কি না
        const moduleConfig = window.ModuleRegistry.get(moduleName);
        
        if (moduleConfig) {
            window.printLog('INFO', `Loader: Loading module -> ${moduleName}`);
            // ডাইনামিক স্ক্রিপ্ট লোডিং
            this.injectScript(moduleConfig.scriptPath);
        } else {
            window.printLog('ERROR', `Loader: Module ${moduleName} not found in Registry.`);
        }
    },

    injectScript: function(path) {
        const script = document.createElement('script');
        script.src = path;
        document.body.appendChild(script);
    }
};
