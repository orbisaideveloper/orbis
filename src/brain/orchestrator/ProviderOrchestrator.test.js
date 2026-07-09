import { ProviderOrchestrator } from './ProviderOrchestrator.js';

describe('ProviderOrchestrator Brick', () => {
  test('should route CODING task to Gemini', async () => {
    const orchestrator = new ProviderOrchestrator();
    const response = await orchestrator.executeTask('CODING', 'Write code');
    expect(response).toContain('Gemini');
  });
});
