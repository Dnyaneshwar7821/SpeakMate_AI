import { schoolUsersMockData } from '../data/schoolUsersMockData';
import { filterSchoolUsers, calculateSchoolUserStats } from '../utils/schoolUserHelpers';

export const schoolUserService = {
  getSchoolUsers: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = filterSchoolUsers(schoolUsersMockData, filters);
        const stats = calculateSchoolUserStats(schoolUsersMockData);
        resolve({ data: filtered, stats, totalCount: filtered.length });
      }, 150);
    });
  },

  getSchoolUserById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = schoolUsersMockData.find((s) => s.id === id);
        if (student) {
          resolve(student);
        } else {
          reject(new Error('School user not found'));
        }
      }, 100);
    });
  },
};
