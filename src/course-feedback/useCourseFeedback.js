import { useState, useEffect, useCallback } from 'react';
import { checkFeedbackEligibility } from './data/api';

/**
 * Custom hook to manage course feedback modal state and eligibility
 * 
 * @param {string} courseId - The course ID
 * @returns {Object} - Modal state and handlers
 */
export const useCourseFeedback = (courseId) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Session storage key for tracking dismissed feedback popup
  const getSessionStorageKey = (cId) => `feedback_dismissed_${cId}`;

  // Check if feedback modal was already dismissed in this session
  const wasDismissedInSession = useCallback(() => {
    if (!courseId) return false;
    const key = getSessionStorageKey(courseId);
    return sessionStorage.getItem(key) === 'true';
  }, [courseId]);

  // Mark feedback modal as dismissed for this session
  const markDismissedInSession = useCallback(() => {
    if (!courseId) return;
    const key = getSessionStorageKey(courseId);
    sessionStorage.setItem(key, 'true');
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    // Check if modal was already dismissed in this session
    if (wasDismissedInSession()) {
      return;
    }

    const checkEligibility = async () => {
      setIsCheckingEligibility(true);
      try {
        const data = await checkFeedbackEligibility(courseId);
        setEligibilityData(data);
        
        // Automatically show modal if eligible and not dismissed
        if (data.should_show_popup) {
          // Add a small delay for better UX
          setTimeout(() => {
            setIsModalOpen(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking feedback eligibility:', error);
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [courseId, wasDismissedInSession]);

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = useCallback((markDismissed = false) => {
    setIsModalOpen(false);
    // If user skips/closes the modal, mark it as dismissed for this session
    if (markDismissed) {
      markDismissedInSession();
    }
  }, [markDismissedInSession]);

  return {
    isModalOpen,
    openModal,
    closeModal,
    eligibilityData,
    isCheckingEligibility,
    isEligible: eligibilityData?.is_eligible || false,
    completionPercentage: eligibilityData?.completion_percentage || 0,
  };
};

export default useCourseFeedback;
