import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiUrl = () => `${getConfig().LMS_BASE_URL}/api/custom/v1/leaderboard`;

// Demo data for when API is not available
const generateDemoGradesData = (limit = 10) => ({
  students: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    user_id: i + 1,
    username: `student${i + 1}`,
    full_name: `Học viên ${i + 1}`,
    average_grade: (95 - i * 3 - Math.random() * 2).toFixed(2),
    total_assignments: 25,
    completed_assignments: 25 - i,
    position: i + 1,
  })),
  summary: {
    total_students: 150,
    average_grade: 78.5,
    highest_grade: 95.8,
    lowest_grade: 45.2,
  },
});

const generateDemoProgressData = (period = 'all', limit = 10) => ({
  students: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    user_id: i + 1,
    username: `student${i + 1}`,
    full_name: `Học viên ${i + 1}`,
    progress_percent: (98 - i * 4 - Math.random() * 3).toFixed(1),
    completed_units: 45 - i * 2,
    total_units: 50,
    avg_time_per_unit: 15 + i * 2,
    position: i + 1,
  })),
  period,
  total_students: 150,
});

/**
 * Get top students by grades
 * @param {string} courseId - Course ID
 * @param {number} limit - Number of students to return (default: 10, max: 100)
 * @returns {Promise} API response
 */
export async function getTopGrades(courseId, limit = 10) {
  try {
    const url = `${getApiUrl()}/top-grades/${courseId}/`;
    const params = new URLSearchParams({ limit: String(limit) });
    const { data } = await getAuthenticatedHttpClient().get(`${url}?${params}`);
    return data;
  } catch (error) {
    // Return demo data if API fails
    // eslint-disable-next-line no-console
    console.log('Using demo data for leaderboard grades (API not available)');
    return generateDemoGradesData(limit);
  }
}

/**
 * Get top students by progress
 * @param {string} courseId - Course ID
 * @param {string} period - Time period: 'week', 'month', 'all' (default: 'all')
 * @param {number} limit - Number of students to return (default: 10, max: 100)
 * @returns {Promise} API response
 */
export async function getTopProgress(courseId, period = 'all', limit = 10) {
  try {
    const url = `${getApiUrl()}/top-progress/${courseId}/`;
    const params = new URLSearchParams({
      period,
      limit: String(limit),
    });
    const { data } = await getAuthenticatedHttpClient().get(`${url}?${params}`);
    return data;
  } catch (error) {
    // Return demo data if API fails
    // eslint-disable-next-line no-console
    console.log('Using demo data for leaderboard progress (API not available)');
    return generateDemoProgressData(period, limit);
  }
}
