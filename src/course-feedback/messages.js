import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  modalTitle: {
    id: 'courseFeedback.modalTitle',
    defaultMessage: 'How was your course experience?',
    description: 'Title of the course feedback modal',
  },
  modalDescription: {
    id: 'courseFeedback.modalDescription',
    defaultMessage: 'Congratulations on reaching 85% completion! We\'d love to hear your thoughts about this course.',
    description: 'Description text in the course feedback modal',
  },
  ratingLabel: {
    id: 'courseFeedback.ratingLabel',
    defaultMessage: 'Rate your experience',
    description: 'Label for the star rating field',
  },
  starRatingAriaLabel: {
    id: 'courseFeedback.starRatingAriaLabel',
    defaultMessage: 'Rate {rating} stars',
    description: 'Aria label for star rating buttons',
  },
  ratingRequired: {
    id: 'courseFeedback.ratingRequired',
    defaultMessage: 'Please select a rating before submitting.',
    description: 'Error message when rating is not selected',
  },
  feedbackLabel: {
    id: 'courseFeedback.feedbackLabel',
    defaultMessage: 'Share your thoughts',
    description: 'Label for the feedback text area',
  },
  feedbackPlaceholder: {
    id: 'courseFeedback.feedbackPlaceholder',
    defaultMessage: 'Tell us what you liked or what could be improved...',
    description: 'Placeholder text for the feedback text area',
  },
  optional: {
    id: 'courseFeedback.optional',
    defaultMessage: 'Optional',
    description: 'Label indicating a field is optional',
  },
  characters: {
    id: 'courseFeedback.characters',
    defaultMessage: 'characters',
    description: 'Character count label',
  },
  privacyNote: {
    id: 'courseFeedback.privacyNote',
    defaultMessage: 'Your feedback helps us improve the learning experience. It will be shared with the course team.',
    description: 'Privacy note about how feedback will be used',
  },
  skipButton: {
    id: 'courseFeedback.skipButton',
    defaultMessage: 'Skip',
    description: 'Button text to skip providing feedback',
  },
  submitButton: {
    id: 'courseFeedback.submitButton',
    defaultMessage: 'Submit Feedback',
    description: 'Button text to submit feedback',
  },
  submittingButton: {
    id: 'courseFeedback.submittingButton',
    defaultMessage: 'Submitting...',
    description: 'Button text while submitting feedback',
  },
  submitError: {
    id: 'courseFeedback.submitError',
    defaultMessage: 'There was an error submitting your feedback. Please try again.',
    description: 'Error message when feedback submission fails',
  },
  successTitle: {
    id: 'courseFeedback.successTitle',
    defaultMessage: 'Thank you for your feedback!',
    description: 'Success message title',
  },
  successMessage: {
    id: 'courseFeedback.successMessage',
    defaultMessage: 'Your feedback has been submitted successfully.',
    description: 'Success message text',
  },
});

export default messages;
