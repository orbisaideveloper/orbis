// js/module-registry.js - Single Source of Truth
window.ModuleRegistry = {
    // এখানে সব মডিউল রেজিস্টার হবে
    modules: {
        'lottery': {
            name: 'Lottery Module',
            scriptPath: '/modules/digiledger/lottery/ui/user-view.js',
            permissions: ['user', 'admin']
        },
        'farmer-brain': {
            name: 'Farmer Brain',
            scriptPath: '/modules/farmer-brain/ui/user-view.js',
            permissions: ['user']
        }
        // ভবিষ্যতে নতুন মডিউল এখানে শুধু একটা লাইন যোগ করলেই হবে!
    },

    get: function(moduleName) {
        return this.modules[moduleName] || null;
    }
};
