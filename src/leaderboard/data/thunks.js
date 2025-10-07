import { logError } from '@edx/frontend-platform/logging';
import { getTopGrades, getTopProgress } from './api';
import {
  fetchTopGradesRequest,
  fetchTopGradesSuccess,
  fetchTopGradesFailure,
  fetchTopProgressRequest,
  fetchTopProgressSuccess,
  fetchTopProgressFailure,
} from './slice';

/**
 * Fetch top students by grades
 */
export function fetchTopGradesData(courseId, limit = 10) {
  return async (dispatch) => {
    dispatch(fetchTopGradesRequest());
    try {
      const data = await getTopGrades(courseId, limit);
      dispatch(fetchTopGradesSuccess(data));
      return data;
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
      const data = await getTopProgress(courseId, period, limit);
      dispatch(fetchTopProgressSuccess({ data, period }));
      return data;
    } catch (error) {
      logError(error);
      dispatch(fetchTopProgressFailure(error.message || 'Failed to fetch top progress'));
      throw error;
    }
  };
}
