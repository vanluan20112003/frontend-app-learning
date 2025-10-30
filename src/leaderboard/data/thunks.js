import { logError } from '@edx/frontend-platform/logging';
import { getTopGrades, getTopProgress, getDiscussionLeaderboard } from './api';
import {
  fetchTopGradesRequest,
  fetchTopGradesSuccess,
  fetchTopGradesFailure,
  fetchTopProgressRequest,
  fetchTopProgressSuccess,
  fetchTopProgressFailure,
  fetchDiscussionLeaderboardRequest,
  fetchDiscussionLeaderboardSuccess,
  fetchDiscussionLeaderboardFailure,
} from './slice';

/**
 * Fetch top students by grades
 */
export function fetchTopGradesData(courseId, limit = 10) {
  return async (dispatch) => {
    dispatch(fetchTopGradesRequest());
    try {
      const apiData = await getTopGrades(courseId, limit);
      // Map lại dữ liệu cho đúng với component
      const mappedData = {
        summary: {
          total_students: apiData.summary?.total_students || 0,
          average_grade: apiData.summary?.avg_grade || 0,
          highest_grade: apiData.summary?.max_grade || 0,
        },
        students: apiData.top_students || [],
      };
      dispatch(fetchTopGradesSuccess(mappedData));
      return mappedData;
    } catch (error) {
      logError(error);
      dispatch(fetchTopGradesFailure(error.message || 'Failed to fetch top grades'));
      throw error;
    }
  };
}

/**
 * Fetch top students by progress
 */
export function fetchTopProgressData(courseId, period = 'all', limit = 10) {
  return async (dispatch) => {
    dispatch(fetchTopProgressRequest());
    try {
      const apiData = await getTopProgress(courseId, period, limit);
      // Map lại dữ liệu cho đúng với component
      const mappedData = {
        summary: apiData.summary || {},
        students: apiData.top_students || [],
      };
      dispatch(fetchTopProgressSuccess({ data: mappedData, period }));
      return mappedData;
    } catch (error) {
      logError(error);
      dispatch(fetchTopProgressFailure(error.message || 'Failed to fetch top progress'));
      throw error;
    }
  };
}

/**
 * Fetch discussion leaderboard
 */
export function fetchDiscussionLeaderboardData(courseId, rankingType = 'all', limit = 20) {
  return async (dispatch) => {
    dispatch(fetchDiscussionLeaderboardRequest());
    try {
      const apiData = await getDiscussionLeaderboard(courseId, rankingType, limit);
      dispatch(fetchDiscussionLeaderboardSuccess({ data: apiData, rankingType }));
      return apiData;
    } catch (error) {
      logError(error);
      dispatch(fetchDiscussionLeaderboardFailure(error.message || 'Failed to fetch discussion leaderboard'));
      throw error;
    }
  };
}
