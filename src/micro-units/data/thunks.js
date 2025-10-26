import { logError } from '@edx/frontend-platform/logging';
import { getBlockCompletion } from '@src/courseware/data/api';
import {
  getMicroUnits, getMicroUnitContent, getMicroUnitBlocks, getMicroUnitDetail,
} from './api';
import {
  fetchMicroUnitsRequest,
  fetchMicroUnitsSuccess,
  fetchMicroUnitsFailure,
  fetchMicroUnitContentRequest,
  fetchMicroUnitContentSuccess,
  fetchMicroUnitContentFailure,
  fetchMicroUnitDetailRequest,
  fetchMicroUnitDetailSuccess,
  fetchMicroUnitDetailFailure,
  markUnitComplete,
} from './slice';

/**
 * Fetch all units for a course using the micro_unit API
 */
export function fetchMicroUnits(courseId) {
  return async (dispatch) => {
    dispatch(fetchMicroUnitsRequest());
    try {
      const data = await getMicroUnits(courseId);
      dispatch(fetchMicroUnitsSuccess(data));
      return data;
    } catch (error) {
      logError(error);
      dispatch(fetchMicroUnitsFailure(error.message));
      throw error;
    }
  };
}

/**
 * Fetch content for a specific unit
 */
export function fetchMicroUnitContent(unitId) {
  return async (dispatch) => {
    dispatch(fetchMicroUnitContentRequest());
    try {
      const data = await getMicroUnitContent(unitId);
      dispatch(fetchMicroUnitContentSuccess(data));
      return data;
    } catch (error) {
      logError(error);
      dispatch(fetchMicroUnitContentFailure(error.message));
      throw error;
    }
  };
}

/**
 * Fetch blocks (units) for a specific micro unit and merge with course completion data
 * @param {number} microUnitId - The ID of the micro unit
 * @param {string} courseId - The course ID to fetch completion data
 */
export function fetchMicroUnitBlocks(microUnitId, courseId) {
  return async (dispatch) => {
    dispatch(fetchMicroUnitsRequest());
    try {
      // Fetch both APIs in parallel for better performance
      const [blocksData, courseUnitsData] = await Promise.all([
        getMicroUnitBlocks(microUnitId),
        courseId ? getMicroUnits(courseId) : Promise.resolve({ units: [] }),
      ]);

      // Create a map of course units for quick lookup
      const courseUnitsMap = {};
      (courseUnitsData.units || []).forEach(unit => {
        courseUnitsMap[unit.id] = unit;
      });

      // Transform and merge data
      const transformedUnits = (blocksData.results || []).map(block => {
        const { blockUsageKey } = block;
        const courseUnit = courseUnitsMap[blockUsageKey];

        return {
          id: blockUsageKey, // Use block_usage_key as ID for navigation
          displayName: block.displayName,
          lmsWebUrl: block.lmsWebUrl,
          blockId: block.id, // Keep original ID
          orderInMicroUnit: block.orderInMicroUnit,
          createdAt: block.createdAt,
          // Merge completion data from course units
          complete: courseUnit?.complete || false,
          graded: courseUnit?.graded || false,
          hasScore: courseUnit?.hasScore || false,
          format: courseUnit?.format || '',
          due: courseUnit?.due || null,
          type: courseUnit?.type || 'vertical',
        };
      });

      const transformedData = {
        courseId: courseId || null,
        totalUnits: blocksData.count || transformedUnits.length,
        units: transformedUnits,
      };
      dispatch(fetchMicroUnitsSuccess(transformedData));
      return transformedData;
    } catch (error) {
      logError(error);
      dispatch(fetchMicroUnitsFailure(error.message));
      throw error;
    }
  };
}

/**
 * Check if a micro unit block is complete
 * Uses the same completion API as regular courseware
 * @param {string} courseId - Course ID
 * @param {string} sequenceId - Sequence ID (parent of the unit)
 * @param {string} unitId - Unit ID (block usage key)
 */
export function checkMicroUnitBlockCompletion(courseId, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { microUnits } = getState();
    const unit = microUnits.units.find(u => u.id === unitId);

    // If already complete, don't check again
    if (unit?.complete) {
      return true;
    }

    try {
      // Use the existing courseware completion API
      const isComplete = await getBlockCompletion(courseId, sequenceId, unitId);

      if (isComplete) {
        dispatch(markUnitComplete({ unitId }));
      }

      return isComplete;
    } catch (error) {
      logError(error);
      return false;
    }
  };
}

/**
 * Fetch detailed information for a specific micro unit
 * @param {number} microUnitId - The ID of the micro unit
 */
export function fetchMicroUnitDetail(microUnitId) {
  return async (dispatch) => {
    dispatch(fetchMicroUnitDetailRequest());
    try {
      const data = await getMicroUnitDetail(microUnitId);
      dispatch(fetchMicroUnitDetailSuccess(data));
      return data;
    } catch (error) {
      logError(error);
      dispatch(fetchMicroUnitDetailFailure(error.message));
      throw error;
    }
  };
}
