import { jest } from '@jest/globals';
import { AgentPlanner } from './AgentPlanner.js';

describe('AgentPlanner', () => {
  let planner;

  beforeEach(() => {
    planner = new AgentPlanner();
  });

  test('should generate a generic execution plan for standard tasks', () => {
    const plan = planner.generatePlan('Write a python script');
    
    expect(plan.originalTask).toBe('Write a python script');
    expect(plan.status).toBe('planned');
    expect(plan.steps.length).toBe(3);
    expect(plan.steps[0].action).toBe('Analyze Request');
  });

  test('should generate a specific execution plan for complex analytical tasks', () => {
    const plan = planner.generatePlan('Analyze the server logs and create a report');
    
    expect(plan.steps.length).toBe(3);
    expect(plan.steps[0].action).toBe('Gather Data');
    expect(plan.steps[2].action).toBe('Generate Report');
  });

  test('should throw an error for empty task input', () => {
    expect(() => {
      planner.generatePlan('   ');
    }).toThrow('Task input cannot be empty.');
  });
});
