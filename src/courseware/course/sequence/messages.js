import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingSequence: {
    id: 'learn.loading.sequence',
    defaultMessage: 'Đang tải...',
    description: 'Screen reader message for sequence loading',
  },
  loadingLockedContent: {
    id: 'learn.loading.locked.content',
    defaultMessage: 'Đang tải nội dung bị khóa...',
    description: 'Screen reader message for loading locked content',
  },
  loadFailure: {
    id: 'learn.loading.failure',
    defaultMessage: 'Đã xảy ra lỗi khi tải khóa học này. Vui lòng thử lại sau.',
    description: 'Error message when course content fails to load',
  },
  noContent: {
    id: 'learn.no.content',
    defaultMessage: 'Khóa học này không có nội dung.',
    description: 'Message shown when course has no content',
  },
});

export default messages;
