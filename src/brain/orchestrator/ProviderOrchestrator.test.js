import { ProviderOrchestrator } from './ProviderOrchestrator.js';

describe('ProviderOrchestrator', () => {
  test('should return response', async () => {
    const orchestrator = new ProviderOrchestrator();
    const response = await orchestrator.executeTask('CODING', 'Test');
    expect(response).toBeDefined();
  });
});
