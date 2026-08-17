import { resultsMockData } from '../data/resultsMockData';
import { filterResults } from '../utils/resultHelpers';

export const resultService = {
  /**
   * Fetch results list with optional filter parameters
   * Prepared for API integration: swap mock return with axios/fetch call
   */
  getResults: async (params = {}) => {
    // Simulate network delay for realistic async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));
    return filterResults(resultsMockData, params);
  },

  /**
   * Fetch single student result details by ID
   */
  getResultById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return resultsMockData.find((s) => s.id === id) || null;
  },

  /**
   * Export results analytics report
   */
  exportReport: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      success: true,
      message: 'Report generated successfully.',
      timestamp: new Date().toISOString(),
    };
  },
};

export default resultService;
