import { useState, useEffect } from 'react';
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
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!courseId || hasChecked) {
      return;
    }

    const checkEligibility = async () => {
      setIsCheckingEligibility(true);
      try {
        const data = await checkFeedbackEligibility(courseId);
        setEligibilityData(data);
        
        // Automatically show modal if eligible
        if (data.should_show_popup) {
          // Add a small delay for better UX
          setTimeout(() => {
            setIsModalOpen(true);
          }, 1000);
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking feedback eligibility:', error);
        setHasChecked(true);
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [courseId, hasChecked]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
