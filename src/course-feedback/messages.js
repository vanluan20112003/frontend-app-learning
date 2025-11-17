import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  modalTitle: {
    id: 'courseFeedback.modalTitle',
    defaultMessage: 'Trải nghiệm khóa học của bạn thế nào?',
    description: 'Title of the course feedback modal',
  },
  modalDescription: {
    id: 'courseFeedback.modalDescription',
    defaultMessage: 'Chúc mừng bạn đã hoàn thành 85% khóa học! Chúng tôi rất mong được nghe ý kiến của bạn về khóa học này.',
    description: 'Description text in the course feedback modal',
  },
  ratingLabel: {
    id: 'courseFeedback.ratingLabel',
    defaultMessage: 'Đánh giá trải nghiệm của bạn',
    description: 'Label for the star rating field',
  },
  starRatingAriaLabel: {
    id: 'courseFeedback.starRatingAriaLabel',
    defaultMessage: 'Đánh giá {rating} sao',
    description: 'Aria label for star rating buttons',
  },
  ratingRequired: {
    id: 'courseFeedback.ratingRequired',
    defaultMessage: 'Vui lòng chọn số sao trước khi gửi.',
    description: 'Error message when rating is not selected',
  },
  feedbackLabel: {
    id: 'courseFeedback.feedbackLabel',
    defaultMessage: 'Chia sẻ suy nghĩ của bạn',
    description: 'Label for the feedback text area',
  },
  feedbackPlaceholder: {
    id: 'courseFeedback.feedbackPlaceholder',
    defaultMessage: 'Hãy cho chúng tôi biết bạn thích điều gì hoặc điều gì có thể cải thiện...',
    description: 'Placeholder text for the feedback text area',
  },
  optional: {
    id: 'courseFeedback.optional',
    defaultMessage: 'Tùy chọn',
    description: 'Label indicating a field is optional',
  },
  characters: {
    id: 'courseFeedback.characters',
    defaultMessage: 'ký tự',
    description: 'Character count label',
  },
  privacyNote: {
    id: 'courseFeedback.privacyNote',
    defaultMessage: 'Phản hồi của bạn giúp chúng tôi cải thiện trải nghiệm học tập. Nó sẽ được chia sẻ với đội ngũ khóa học.',
    description: 'Privacy note about how feedback will be used',
  },
  skipButton: {
    id: 'courseFeedback.skipButton',
    defaultMessage: 'Bỏ qua',
    description: 'Button text to skip providing feedback',
  },
  submitButton: {
    id: 'courseFeedback.submitButton',
    defaultMessage: 'Gửi phản hồi',
    description: 'Button text to submit feedback',
  },
  submittingButton: {
    id: 'courseFeedback.submittingButton',
    defaultMessage: 'Đang gửi...',
    description: 'Button text while submitting feedback',
  },
  submitError: {
    id: 'courseFeedback.submitError',
    defaultMessage: 'Đã xảy ra lỗi khi gửi phản hồi của bạn. Vui lòng thử lại.',
    description: 'Error message when feedback submission fails',
  },
  successTitle: {
    id: 'courseFeedback.successTitle',
    defaultMessage: 'Cảm ơn bạn đã phản hồi!',
    description: 'Success message title',
  },
  successMessage: {
    id: 'courseFeedback.successMessage',
    defaultMessage: 'Phản hồi của bạn đã được gửi thành công.',
    description: 'Success message text',
  },
});

export default messages;
