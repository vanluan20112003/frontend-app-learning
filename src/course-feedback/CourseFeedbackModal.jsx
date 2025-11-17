import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  ActionRow,
  Button,
  Form,
  Icon,
  ModalDialog,
  Spinner,
  Alert,
} from '@openedx/paragon';
import { Close, Star, StarOutline } from '@openedx/paragon/icons';

import messages from './messages';
import { submitCourseFeedback } from './data/api';
import './CourseFeedbackModal.scss';

const CourseFeedbackModal = ({
  courseId,
  intl,
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
    setError(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(intl.formatMessage(messages.ratingRequired));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitCourseFeedback(courseId, rating, feedback);
      
      // Track the feedback submission
      sendTrackEvent('edx.ui.lms.course_feedback.submitted', {
        course_id: courseId,
        rating,
        has_comment: feedback.length > 0,
      });

      setSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
          setRating(0);
          setFeedback('');
          setSuccess(false);
          setError(null);
        }, 300);
      }, 1500);
    } catch (err) {
      setError(err.message || intl.formatMessage(messages.submitError));
      sendTrackEvent('edx.ui.lms.course_feedback.error', {
        course_id: courseId,
        error: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    sendTrackEvent('edx.ui.lms.course_feedback.dismissed', {
      course_id: courseId,
    });
    onClose();
  };

  const handleSkip = () => {
    sendTrackEvent('edx.ui.lms.course_feedback.skipped', {
      course_id: courseId,
    });
    onClose();
  };

  const displayRating = hoverRating || rating;

  return (
    <ModalDialog
      className="course-feedback-modal"
      title={intl.formatMessage(messages.modalTitle)}
      onClose={handleClose}
      isOpen={isOpen}
      hasCloseButton
      size="md"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.modalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {success ? (
          <Alert variant="success" className="mb-0">
            <Alert.Heading>{intl.formatMessage(messages.successTitle)}</Alert.Heading>
            <p className="mb-0">{intl.formatMessage(messages.successMessage)}</p>
          </Alert>
        ) : (
          <>
            <p className="lead text-center mb-4">
              {intl.formatMessage(messages.modalDescription)}
            </p>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Star Rating */}
            <div className="mb-4">
              <Form.Label className="h6">
                {intl.formatMessage(messages.ratingLabel)} <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex justify-content-center align-items-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-2"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={intl.formatMessage(messages.starRatingAriaLabel, { rating: star })}
                  >
                    <Icon
                      src={star <= displayRating ? Star : StarOutline}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        color: star <= displayRating ? '#FDB714' : '#D3D3D3',
                      }}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-muted small">
                  <FormattedMessage
                    id="courseFeedback.ratingSelected"
                    defaultMessage="{rating} out of 5 stars"
                    values={{ rating }}
                  />
                </p>
              )}
            </div>

            {/* Feedback Text Area */}
            <Form.Group>
              <Form.Label className="h6">
                {intl.formatMessage(messages.feedbackLabel)}
                <span className="text-muted font-weight-normal ml-2">
                  ({intl.formatMessage(messages.optional)})
                </span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={intl.formatMessage(messages.feedbackPlaceholder)}
                maxLength={1000}
                aria-label={intl.formatMessage(messages.feedbackLabel)}
              />
              <Form.Text className="text-muted">
                {feedback.length}/1000 {intl.formatMessage(messages.characters)}
              </Form.Text>
            </Form.Group>

            <p className="text-muted small mt-3">
              {intl.formatMessage(messages.privacyNote)}
            </p>
          </>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        {!success && (
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {intl.formatMessage(messages.skipButton)}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="mr-2"
                    aria-hidden="true"
                  />
                  {intl.formatMessage(messages.submittingButton)}
                </>
              ) : (
                intl.formatMessage(messages.submitButton)
              )}
            </Button>
          </ActionRow>
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

CourseFeedbackModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(CourseFeedbackModal);
