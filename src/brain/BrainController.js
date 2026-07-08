import config from './brain_config.json';

class BrainController {
  constructor() {
    this.config = config;
  }

  getSystemStatus() {
    return this.config.status;
  }
}

export default BrainController;
