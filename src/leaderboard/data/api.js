import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiUrl = () => `${getConfig().LMS_BASE_URL}/api/custom/v1/leaderboard`;

/**
 * Get top students by grades
 * @param {string} courseId - Course ID
 * @param {number} limit - Number of students to return (default: 10, max: 100)
 * @returns {Promise} API response
 */
export async function getTopGrades(courseId, limit = 10) {
  const url = `${getApiUrl()}/top-grades/${courseId}/`;
  const params = new URLSearchParams({ limit: String(limit) });

  const { data } = await getAuthenticatedHttpClient().get(`${url}?${params}`);
  return data;
}

/**
 * Get top students by progress
 * @param {string} courseId - Course ID
 * @param {string} period - Time period: 'week', 'month', 'all' (default: 'all')
 * @param {number} limit - Number of students to return (default: 10, max: 100)
 * @returns {Promise} API response
 */
export async function getTopProgress(courseId, period = 'all', limit = 10) {
  const url = `${getApiUrl()}/top-progress/${courseId}/`;
  const params = new URLSearchParams({
    period,
    limit: String(limit),
  });

  const { data } = await getAuthenticatedHttpClient().get(`${url}?${params}`);
  return data;
}
