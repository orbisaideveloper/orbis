// 🟢 File: frontend/js/admin-registry.js
// ORBIS Admin Core Registry - Vercel/Google Cloud Grade Architecture

class OrbisAdminCore {
    constructor() {
        this.plugins = new Map();
        this.providers = new Map();
        this.systemState = {
            isReady: false,
            errors: 0,
            lastBoot: new Date().toISOString()
        };
        this.init();
    }

    init() {
        console.log('[ORBIS ADMIN CORE] Booting Futuristic Architecture...');
        this.systemState.isReady = true;
    }

    // 🚀 1. Plug & Play Module Registration
    registerPlugin(pluginId, config) {
        try {
            if (this.plugins.has(pluginId)) return false;
            
            // 🟢 UPDATED: Captures all UI data from the plugin config
            const pluginData = { id: pluginId, ...config }; 
            
            this.plugins.set(pluginId, pluginData);
            console.log(`[Core Registry] 🧩 Successfully Plugged: ${config.name}`);
            return true;

        } catch (error) {
            this.systemState.errors++;
            return false;
        }
    }

    // 📡 2. Safe Data Provider Registration
    registerProvider(providerId, fetchFunction) {
        this.providers.set(providerId, fetchFunction);
    }

    // ⚡ 3. Centralized Data Fetcher
    async fetchData(providerId, payload = {}) {
        if (!this.providers.has(providerId)) {
            return { success: false, data: null, fallback: true };
        }
        try {
            return await this.providers.get(providerId)(payload);
        } catch (error) {
            return { success: false, data: null, error: error.message };
        }
    }
}

// 🌐 Injecting Core to Global Window securely
if (!window.ORBIS_ADMIN) {
    window.ORBIS_ADMIN = new OrbisAdminCore();
}
