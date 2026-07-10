import { jest } from '@jest/globals';
import { BrainHub } from './index.js';

describe('Brain Module Index', () => {
  test('should correctly export BrainHub', () => {
    expect(BrainHub).toBeDefined();
    
    // টেস্ট করে দেখা হচ্ছে যে BrainHub ঠিকমতো ইনিশিয়ালাইজ হচ্ছে কি না
    const hub = new BrainHub();
    expect(hub).toBeInstanceOf(BrainHub);
    expect(hub.processRequest).toBeDefined();
  });
});
