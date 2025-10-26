import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * Get list of all units (verticals) for a course using the micro_unit API.
 * This API returns only units without the full course structure.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{courseId: string, totalUnits: number, units: Array}>}
 */
export async function getMicroUnits(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/micro_unit/v1/units/${courseId}`);

  return camelCaseObject(data);
}

/**
 * Get a specific unit content by unit ID.
 * This uses the existing courseware API to get unit details.
 * @param {string} unitId - The unique identifier for the unit.
 * @returns {Promise<Object>}
 */
export async function getMicroUnitContent(unitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${unitId}`);

  return camelCaseObject(data);
}

/**
 * Get list of blocks (units) for a specific micro unit.
 * @param {number} microUnitId - The ID of the micro unit.
 * @returns {Promise<{results: Array, count: number, ...}>}
 */
export async function getMicroUnitBlocks(microUnitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/micro_unit/v1/micro-units/${microUnitId}/blocks/`);

  return camelCaseObject(data);
}

/**
 * Get detailed information for a specific micro unit.
 * Includes title, description, thumbnail, difficulty, etc.
 * @param {number} microUnitId - The ID of the micro unit.
 * @returns {Promise<Object>}
 */
export async function getMicroUnitDetail(microUnitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/micro_unit/v1/micro-units/${microUnitId}/`);

  return camelCaseObject(data);
}
