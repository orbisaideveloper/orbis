import { expect, test, describe, beforeEach } from '@jest/globals';
import { SystemHealthDashboard } from './SystemHealthDashboard.js';

describe('STEP 05: System Health Dashboard', () => {
  let healthDashboard;

  beforeEach(() => {
    healthDashboard = new SystemHealthDashboard();
  });

  test('should generate infrastructure health report with all required metrics', () => {
    const health = healthDashboard.getInfrastructureHealth();

    // Verify Core Status
    expect(health.overall_status).toBe('HEALTHY');

    // Verify CI/CD & Security Pipelines
    expect(health.pipelines.github_actions).toBeDefined();
    expect(health.pipelines.sonar_qube).toBeDefined();
    expect(health.pipelines.code_ql).toBeDefined();
    expect(health.pipelines.dependabot).toBeDefined();

    // Verify Code Quality & Testing
    expect(health.testing.jest_tests).toBeDefined();
    expect(health.testing.eslint).toBeDefined();

    // Verify System Metrics
    expect(health.system_metrics.memory_status).toBeDefined();
    expect(health.system_metrics.api_status).toBeDefined();
  });

  test('should format and print health report correctly without errors', () => {
    // Verifying it successfully builds the console output
    expect(() => healthDashboard.printHealthReport()).not.toThrow();
  });
});
