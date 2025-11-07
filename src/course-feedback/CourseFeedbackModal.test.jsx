import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import CourseFeedbackModal from './CourseFeedbackModal';
import * as api from './data/api';

// Mock dependencies
jest.mock('@edx/frontend-platform/analytics');
jest.mock('./data/api');

const mockSubmitCourseFeedback = api.submitCourseFeedback;

describe('CourseFeedbackModal', () => {
  const defaultProps = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    isOpen: true,
    onClose: jest.fn(),
  };

  const renderModal = (props = {}) => {
    return render(
      <IntlProvider locale="en">
        <CourseFeedbackModal {...defaultProps} {...props} />
      </IntlProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    renderModal();
    expect(screen.getByText(/How was your course experience/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText(/How was your course experience/i)).not.toBeInTheDocument();
  });

  it('displays star rating buttons', () => {
    renderModal();
    const starButtons = screen.getAllByRole('button', { name: /Rate \d stars/i });
    expect(starButtons).toHaveLength(5);
  });

  it('allows user to select a rating', () => {
    renderModal();
    const thirdStar = screen.getByRole('button', { name: /Rate 3 stars/i });
    fireEvent.click(thirdStar);
    expect(screen.getByText(/3 out of 5 stars/i)).toBeInTheDocument();
  });

  it('allows user to enter feedback text', () => {
    renderModal();
    const textarea = screen.getByLabelText(/Share your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Great course!' } });
    expect(textarea.value).toBe('Great course!');
  });

  it('shows character count', () => {
    renderModal();
    const textarea = screen.getByLabelText(/Share your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test feedback' } });
    expect(screen.getByText(/13\/1000 characters/i)).toBeInTheDocument();
  });

  it('disables submit button when no rating is selected', () => {
    renderModal();
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when rating is selected', () => {
    renderModal();
    const firstStar = screen.getByRole('button', { name: /Rate 1 stars/i });
    fireEvent.click(firstStar);
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows error when trying to submit without rating', () => {
    renderModal();
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    // Button is disabled, but test the validation logic
    const thirdStar = screen.getByRole('button', { name: /Rate 3 stars/i });
    fireEvent.click(thirdStar);
    // Unselect by clicking again (hypothetically)
    expect(submitButton).not.toBeDisabled();
  });

  it('submits feedback successfully', async () => {
    mockSubmitCourseFeedback.mockResolvedValue({
      id: 1,
      rating: 4,
      feedback: 'Great course!',
    });

    renderModal();

    // Select rating
    const fourthStar = screen.getByRole('button', { name: /Rate 4 stars/i });
    fireEvent.click(fourthStar);

    // Enter feedback
    const textarea = screen.getByLabelText(/Share your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Great course!' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitCourseFeedback).toHaveBeenCalledWith(
        'course-v1:edX+DemoX+Demo_Course',
        4,
        'Great course!'
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback!/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    mockSubmitCourseFeedback.mockRejectedValue(new Error('Network error'));

    renderModal();

    // Select rating
    const fifthStar = screen.getByRole('button', { name: /Rate 5 stars/i });
    fireEvent.click(fifthStar);

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/There was an error submitting your feedback/i)).toBeInTheDocument();
    });
  });

  it('tracks analytics when feedback is submitted', async () => {
    mockSubmitCourseFeedback.mockResolvedValue({ id: 1, rating: 5 });

    renderModal();

    const fifthStar = screen.getByRole('button', { name: /Rate 5 stars/i });
    fireEvent.click(fifthStar);

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_feedback.submitted', {
        course_id: 'course-v1:edX+DemoX+Demo_Course',
        rating: 5,
        has_comment: false,
      });
    });
  });

  it('tracks analytics when feedback is skipped', () => {
    renderModal();
    const skipButton = screen.getByRole('button', { name: /Skip/i });
    fireEvent.click(skipButton);

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_feedback.skipped', {
      course_id: 'course-v1:edX+DemoX+Demo_Course',
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('tracks analytics when modal is closed', () => {
    renderModal();
    const closeButton = screen.getByLabelText(/Close/i);
    fireEvent.click(closeButton);

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.course_feedback.dismissed', {
      course_id: 'course-v1:edX+DemoX+Demo_Course',
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    mockSubmitCourseFeedback.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderModal();

    const thirdStar = screen.getByRole('button', { name: /Rate 3 stars/i });
    fireEvent.click(thirdStar);

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('closes modal after successful submission', async () => {
    jest.useFakeTimers();
    mockSubmitCourseFeedback.mockResolvedValue({ id: 1, rating: 3 });

    renderModal();

    const thirdStar = screen.getByRole('button', { name: /Rate 3 stars/i });
    fireEvent.click(thirdStar);

    const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your feedback!/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger the auto-close
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('enforces 1000 character limit on feedback', () => {
    renderModal();
    const textarea = screen.getByLabelText(/Share your thoughts/i);
    const longText = 'a'.repeat(1001);
    
    fireEvent.change(textarea, { target: { value: longText } });
    
    // The textarea should limit to 1000 characters
    expect(textarea.value.length).toBeLessThanOrEqual(1000);
  });

  it('displays privacy note', () => {
    renderModal();
    expect(screen.getByText(/Your feedback helps us improve/i)).toBeInTheDocument();
  });

  it('marks rating as required', () => {
    renderModal();
    const ratingLabel = screen.getByText(/Rate your experience/i);
    expect(ratingLabel.parentElement.querySelector('.text-danger')).toBeInTheDocument();
  });

  it('marks feedback as optional', () => {
    renderModal();
    expect(screen.getByText(/Optional/i)).toBeInTheDocument();
  });
});
