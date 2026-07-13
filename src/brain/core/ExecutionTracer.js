import crypto from 'crypto';
import { addLog } from '../telemetry.js'; 

export class ExecutionTracer {
    static generateTrackId() {
        return `REQ-${crypto.randomUUID().substring(0, 6).toUpperCase()}`;
    }

    static wrap(targetObject, moduleName) {
        return new Proxy(targetObject, {
            get(target, propKey, receiver) {
                const originalMethod = target[propKey];
                
                if (typeof originalMethod === 'function') {
                    return async function (...args) {
                        const trackId = args[0]?.trackId || ExecutionTracer.generateTrackId();
                        if (args[0] && typeof args[0] === 'object' && !args[0].trackId) {
                            args[0].trackId = trackId;
                        }

                        const startTime = Date.now();
                        const enterMsg = `[${trackId}] Entered: ${moduleName} ➔ ${propKey}()`;
                        
                        // 🟢 সেফটি বাইপাস: লগ ফেইল করলেও মূল কাজ বন্ধ হবে না
                        try { addLog('INFO', enterMsg); } catch(e) {}

                        try {
                            const result = await originalMethod.apply(this, args);
                            const duration = Date.now() - startTime;
                            const successMsg = `[${trackId}] Success: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            try { addLog('OK', successMsg); } catch(e) {}
                            return result;
                        } catch (error) {
                            const duration = Date.now() - startTime;
                            const failMsg = `[${trackId}] FAILED: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            try { addLog('ERR', failMsg); } catch(e) {}
                            throw error;
                        }
                    };
                }
                return Reflect.get(target, propKey, receiver);
            }
        });
    }
}
