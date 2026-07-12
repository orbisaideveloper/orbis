import crypto from 'crypto';
import { addLog } from '../telemetry.js'; // 🟢 নতুন: লগ বাস্কেট ইমপোর্ট করা হলো

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
                        
                        console.log(`[TRACE] 🟢 ${enterMsg}`);
                        addLog('INFO', enterMsg); // 🟢 বাস্কেটে মেসেজ পাঠানো হলো

                        try {
                            const result = await originalMethod.apply(this, args);
                            const duration = Date.now() - startTime;
                            const successMsg = `[${trackId}] Success: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            console.log(`[TRACE] ✅ ${successMsg}`);
                            addLog('OK', successMsg); // 🟢 বাস্কেটে মেসেজ পাঠানো হলো
                            return result;
                        } catch (error) {
                            const duration = Date.now() - startTime;
                            const failMsg = `[${trackId}] FAILED: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            console.log(`[TRACE] ❌ ${failMsg}`);
                            console.error(`[TRACE] 🛑 [${trackId}] Error Details:`, error.message);
                            addLog('ERROR', failMsg); // 🟢 বাস্কেটে মেসেজ পাঠানো হলো
                            throw error;
                        }
                    };
                }
                return Reflect.get(target, propKey, receiver);
            }
        });
    }
}
