import { jest } from '@jest/globals';
import { AgentPlanner } from './AgentPlanner.js';

describe('AgentPlanner', () => {
  let planner;

  beforeEach(() => {
    planner = new AgentPlanner();
  });

  test('should generate a generic execution plan with capabilities', () => {
    const plan = planner.generatePlan('Write a python script');
    
    expect(plan.originalTask).toBe('Write a python script');
    expect(plan.status).toBe('planned');
    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].capability).toBe('general_logic');
  });

  test('should generate a specific execution plan for analytical tasks', () => {
    const plan = planner.generatePlan('Analyze the server logs');
    
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0].capability).toBe('data_processing');
    expect(plan.steps[1].capability).toBe('analytical_reasoning');
  });

  test('should throw an error for empty task input', () => {
    expect(() => {
      planner.generatePlan('   ');
    }).toThrow('Task input cannot be empty.');
  });
});
