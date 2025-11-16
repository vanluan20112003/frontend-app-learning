import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * Check if the user is eligible to provide feedback for a course
 * (completion >= 85% and hasn't already submitted feedback)
 * 
 * @param {string} courseId - The course ID
 * @returns {Promise<Object>} Eligibility data including completion percentage
 */
export async function checkFeedbackEligibility(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/eligibility/${courseId}/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    console.error('Error checking feedback eligibility:', error);
    throw error;
  }
}

/**
 * Submit course feedback
 * 
 * @param {string} courseId - The course ID
 * @param {number} rating - Rating from 1-5
 * @param {string} feedback - Optional text feedback
 * @returns {Promise<Object>} The created/updated feedback object
 */
export async function submitCourseFeedback(courseId, rating, feedback = '') {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().post(url, {
      course_id: courseId,
      rating,
      feedback,
    });
    return data;
  } catch (error) {
    console.error('Error submitting course feedback:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to submit feedback. Please try again.');
  }
}

/**
 * Get user's feedback for a specific course
 * 
 * @param {string} courseId - The course ID
 * @returns {Promise<Object|null>} The feedback object or null if not found
 */
export async function getCourseFeedback(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/${courseId}/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching course feedback:', error);
    throw error;
  }
}

/**
 * Update existing course feedback
 * 
 * @param {string} courseId - The course ID
 * @param {number} rating - Rating from 1-5
 * @param {string} feedback - Optional text feedback
 * @returns {Promise<Object>} The updated feedback object
 */
export async function updateCourseFeedback(courseId, rating, feedback = '') {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/${courseId}/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().patch(url, {
      rating,
      feedback,
    });
    return data;
  } catch (error) {
    console.error('Error updating course feedback:', error);
    throw error;
  }
}

/**
 * Delete course feedback
 * 
 * @param {string} courseId - The course ID
 * @returns {Promise<void>}
 */
export async function deleteCourseFeedback(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/${courseId}/`;
  
  try {
    await getAuthenticatedHttpClient().delete(url);
  } catch (error) {
    console.error('Error deleting course feedback:', error);
    throw error;
  }
}

/**
 * Get all feedback for a specific course (for viewing other users' feedback)
 * 
 * @param {string} courseId - The course ID
 * @param {string} sort - Sort order: 'rating_high', 'rating_low', 'date_new', 'date_old' (default: 'rating_high')
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Promise<Object>} Object with feedback array and pagination info
 */
export async function getAllCourseFeedback(courseId, sort = 'rating_high', page = 1, pageSize = 10) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/${courseId}/all/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().get(url, {
      params: { 
        sort,
        page,
        page_size: pageSize,
      }
    });
    
    // Backend returns pagination data in a nested structure
    const paginationData = data.pagination || {};
    
    return {
      results: data.results || [],
      pagination: {
        count: paginationData.count || 0,
        next: paginationData.next,
        previous: paginationData.previous,
        num_pages: paginationData.num_pages || 1,
        current_page: page,
      },
    };
  } catch (error) {
    console.error('Error fetching all course feedback:', error);
    return {
      results: [],
      pagination: {
        count: 0,
        next: null,
        previous: null,
        num_pages: 1,
        current_page: 1,
      },
    };
  }
}

/**
 * Get average rating and statistics for a course
 * 
 * @param {string} courseId - The course ID
 * @returns {Promise<Object>} Average rating and statistics
 */
export async function getCourseAverageRating(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user_course_feedback/v1/feedback/${courseId}/average/`;
  
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    console.error('Error fetching course average rating:', error);
    return {
      average_rating: null,
      total_feedback_count: 0,
      rating_distribution: {
        '5': 0,
        '4': 0,
        '3': 0,
        '2': 0,
        '1': 0,
      }
    };
  }
}
