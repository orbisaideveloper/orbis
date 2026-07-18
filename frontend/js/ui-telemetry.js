// frontend/js/ui-telemetry.js - User Layer Passive Observer
/**
 * * CHAPTER 3: Admin Diagnostics Migration Complete
 * ALL X-Ray and Admin UI rendering has been strictly stripped from this UI module.
 * User Layer is now restricted to ONLY reading from window.ORBIS_SHARED.
 */

window.ORBIS_SHARED = window.ORBIS_SHARED || {};

window.readTelemetryState = function() {
    // 🛡️ STRICT RULE: User layer only reads from the Single Source of Truth
    const currentPlatformState = window.ORBIS_SHARED.telemetry?.snapshot;
    if (!currentPlatformState) return null;
    
    // UI can react to data here if needed, but NO Admin DOM manipulation is allowed.
    return currentPlatformState;
};

console.log("✔️ [USER LAYER] ui-telemetry.js sanitized. All diagnostic DOM mutations migrated to Admin Dashboard.");
