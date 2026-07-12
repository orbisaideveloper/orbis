import crypto from 'crypto';

export class ExecutionTracer {
    // ১. ইউনিক ট্র্যাকিং আইডি তৈরি করা
    static generateTrackId() {
        return `REQ-${crypto.randomUUID().substring(0, 6).toUpperCase()}`;
    }

    // ২. প্রক্সি বা র‍্যাপার (Wrapper) তৈরি করা
    static wrap(targetObject, moduleName) {
        return new Proxy(targetObject, {
            get(target, propKey, receiver) {
                const originalMethod = target[propKey];
                
                // শুধুমাত্র ফাংশনগুলোকে আমরা ট্র্যাক করব
                if (typeof originalMethod === 'function') {
                    return async function (...args) {
                        // পেলোডের সাথে ট্র্যাকিং আইডি জুড়ে দেওয়া
                        const trackId = args[0]?.trackId || ExecutionTracer.generateTrackId();
                        if (args[0] && typeof args[0] === 'object' && !args[0].trackId) {
                            args[0].trackId = trackId;
                        }

                        const startTime = Date.now();
                        console.log(`[TRACE] 🟢 [${trackId}] Entered: ${moduleName} ➔ ${propKey}()`);

                        try {
                            // আসল ফাংশনটি চালানো হচ্ছে
                            const result = await originalMethod.apply(this, args);
                            const duration = Date.now() - startTime;
                            console.log(`[TRACE] ✅ [${trackId}] Success: ${moduleName} ➔ ${propKey}() [${duration}ms]`);
                            return result;
                        } catch (error) {
                            // কোথাও ক্র্যাশ করলে সাথে সাথে ধরে ফেলা
                            const duration = Date.now() - startTime;
                            console.log(`[TRACE] ❌ [${trackId}] FAILED: ${moduleName} ➔ ${propKey}() [${duration}ms]`);
                            console.error(`[TRACE] 🛑 [${trackId}] Error Details:`, error.message);
                            throw error; // সিস্টেমকে এররটি পাস করে দেওয়া, তবে আমরা ট্র্যাক করে ফেলেছি
                        }
                    };
                }
                return Reflect.get(target, propKey, receiver);
            }
        });
    }
}
