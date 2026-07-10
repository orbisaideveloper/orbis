/**
 * DevelopmentReviewEngine: Automates the review process by aggregating
 * data from CI/CD pipelines, test coverage, and code quality tools.
 */
export class ReviewEngine {
  constructor() {
    this.reviewHistory = [];
  }

  /**
   * Generates a comprehensive development review report.
   * @param {Object} metrics - Data containing test, architecture, and security metrics.
   * @returns {Object} A structured review report.
   */
  generateReview(metrics) {
    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Metrics data is required to generate a review.');
    }

    const { jestPassed, sonarBugs, architectureCompliant } = metrics;
    
    let status = 'approved';
    let feedback = [];

    // Rule 1: All Jest tests must pass
    if (jestPassed === false) {
      status = 'rejected';
      feedback.push('Jest tests failed. Code must not be deployed.');
    }

    // Rule 2: Zero bugs allowed in SonarQube
    if (sonarBugs > 0) {
      status = 'rejected';
      feedback.push(`SonarQube detected ${sonarBugs} bug(s). Fix immediately.`);
    }

    // Rule 3: Must follow Lego architecture
    if (architectureCompliant === false) {
      status = 'rejected';
      feedback.push('Architecture violation detected. Ensure strict modularity.');
    }

    if (status === 'approved') {
      feedback.push('All infrastructure checks passed. Ready for next phase.');
    }

    const report = {
      timestamp: new Date().toISOString(),
      status,
      feedback,
      metrics
    };

    this.reviewHistory.push(report);
    return report;
  }
}
