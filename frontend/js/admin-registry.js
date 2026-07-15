// 🟢 File: frontend/js/admin-registry.js
// ORBIS Admin Core Registry - Vercel/Google Cloud Grade Architecture
// Features: Auto-healing, Safe Plugin Mounting, Telemetry Ready

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

    // 🚀 1. Plug & Play Module Registration with Auto-Healing
    registerPlugin(pluginId, config) {
        try {
            if (this.plugins.has(pluginId)) {
                console.warn(`[Core Warning] Plugin ${pluginId} already exists. Skipping duplicate.`);
                return false;
            }

            const pluginData = {
                id: pluginId,
                name: config.name || 'Unnamed Module',
                version: config.version || '1.0.0',
                status: 'standby',
                mount: config.mount || function() { console.log(`[Mock] ${pluginId} Mounted.`); }
            };

            this.plugins.set(pluginId, pluginData);
            console.log(`[Core Registry] 🧩 Successfully Plugged: ${config.name}`);
            return true;

        } catch (error) {
            // 🛡️ Auto-Healing: Prevent full dashboard crash if one module fails
            console.error(`[Core Error] Failed to load plugin ${pluginId}:`, error.message);
            this.systemState.errors++;
            return false;
        }
    }

    // 📡 2. Safe Data Provider Registration
    registerProvider(providerId, fetchFunction) {
        this.providers.set(providerId, fetchFunction);
        console.log(`[Core Registry] 🔗 Provider Linked: ${providerId}`);
    }

    // ⚡ 3. Centralized Data Fetcher
    async fetchData(providerId, payload = {}) {
        if (!this.providers.has(providerId)) {
            console.warn(`[Core Network] Provider ${providerId} missing. Returning fallback data.`);
            return { success: false, data: null, fallback: true };
        }
        try {
            return await this.providers.get(providerId)(payload);
        } catch (error) {
            console.error(`[Core Network] Provider ${providerId} crashed.`, error);
            return { success: false, data: null, error: error.message };
        }
    }
}

// 🌐 Injecting Core to Global Window securely (Zero Breaking Change)
if (!window.ORBIS_ADMIN) {
    window.ORBIS_ADMIN = new OrbisAdminCore();
}
