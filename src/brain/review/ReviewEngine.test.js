import { jest } from '@jest/globals';
import { ReviewEngine } from './ReviewEngine.js';

describe('ReviewEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new ReviewEngine();
  });

  test('should approve review if all metrics are perfect', () => {
    const metrics = {
      jestPassed: true,
      sonarBugs: 0,
      architectureCompliant: true
    };
    
    const report = engine.generateReview(metrics);
    expect(report.status).toBe('approved');
    expect(report.feedback[0]).toContain('All infrastructure checks passed');
  });

  test('should reject review if tests fail or bugs exist', () => {
    const badMetrics = {
      jestPassed: false,
      sonarBugs: 2,
      architectureCompliant: true
    };
    
    const report = engine.generateReview(badMetrics);
    expect(report.status).toBe('rejected');
    expect(report.feedback.length).toBe(2); // Should flag both Jest and Sonar issues
  });

  test('should throw error if no metrics provided', () => {
    expect(() => {
      engine.generateReview(null);
    }).toThrow('Metrics data is required');
  });
});
