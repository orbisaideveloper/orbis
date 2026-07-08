import { BrainController } from './BrainController.js';

describe('BrainController', () => {
  let controller;

  beforeEach(() => {
    controller = new BrainController();
  });

  test('should initialize with default config', () => {
    const config = controller.getActiveConfig();
    expect(config.memoryEnabled).toBe(false);
  });

  test('should update config dynamically', () => {
    controller.updateConfig({ memoryEnabled: true });
    expect(controller.getActiveConfig().memoryEnabled).toBe(true);
  });
});
