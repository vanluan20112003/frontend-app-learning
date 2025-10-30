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

// Demo data for discussion leaderboard
const generateDemoDiscussionData = (rankingType = 'all', limit = 20) => {
  const users = Array.from({ length: Math.min(limit, 20) }, (_, i) => {
    const baseData = {
      rank: i + 1,
      user_id: String(1000 + i),
      username: `user${i + 1}`,
      full_name: `Người dùng ${i + 1}`,
    };

    // Generate different data based on ranking type
    switch (rankingType) {
      case 'all':
        return {
          ...baseData,
          threads_count: Math.floor(30 - i * 1.2 + Math.random() * 5),
          comments_count: Math.floor(180 - i * 7 + Math.random() * 10),
          total_interactions: Math.floor(210 - i * 8 + Math.random() * 15),
        };
      case 'threads':
        return {
          ...baseData,
          threads_count: Math.floor(35 - i * 1.5 + Math.random() * 3),
        };
      case 'comments':
        return {
          ...baseData,
          comments_count: Math.floor(200 - i * 8 + Math.random() * 10),
        };
      case 'questions':
        return {
          ...baseData,
          questions_count: Math.floor(20 - i * 0.8 + Math.random() * 2),
        };
      case 'votes':
        return {
          ...baseData,
          total_upvotes: Math.floor(250 - i * 10 + Math.random() * 15),
        };
      default:
        return baseData;
    }
  });

  return {
    success: true,
    course_id: 'demo-course',
    ranking_type: rankingType,
    total_users: limit,
    data: users,
  };
};

/**
 * Get discussion leaderboard for a course
 * @param {string} courseId - Course ID
 * @param {string} rankingType - Ranking type: 'all', 'threads', 'comments', 'questions', 'votes'
 * @param {number} limit - Number of users to return (default: 20)
 * @returns {Promise} API response
 */
export async function getDiscussionLeaderboard(courseId, rankingType = 'all', limit = 20) {
  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Use demo data in development
    // eslint-disable-next-line no-console
    console.log('Using demo data for discussion leaderboard (development mode)');
    // Simulate API delay
    await new Promise((resolve) => { setTimeout(resolve, 500); });
    return generateDemoDiscussionData(rankingType, limit);
  }

  // Use real API in production
  try {
    const url = `${getConfig().LMS_BASE_URL}/api/custom/v1/discussions/leaderboard/${courseId}/`;
    const params = new URLSearchParams({
      ranking_type: rankingType,
      limit: String(limit),
    });
    const { data } = await getAuthenticatedHttpClient().get(`${url}?${params}`);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching discussion leaderboard:', error);
    // Fallback to demo data if API fails
    return generateDemoDiscussionData(rankingType, limit);
  }
}
