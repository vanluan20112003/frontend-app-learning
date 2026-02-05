import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  contentLocked: {
    id: 'learn.sequentialLock.content.locked',
    // defaultMessage: 'Content Locked',
    defaultMessage: 'Nội dung bị khóa',
    description: 'Message shown when content is locked due to sequential learning requirement.',
  },
  completePreviousFirst: {
    id: 'learn.sequentialLock.complete.previous',
    // defaultMessage: "You must complete '{previousSequenceTitle}' before accessing this content.",
    defaultMessage: "Bạn phải hoàn thành ''{previousSequenceTitle}'' trước khi truy cập nội dung này.",
    description: 'Message explaining that user must complete previous section first.',
  },
  goToPreviousSection: {
    id: 'learn.sequentialLock.goToPrevious',
    // defaultMessage: 'Go To Previous Section',
    defaultMessage: 'Đi đến phần trước',
    description: 'Button text to navigate to the previous incomplete section.',
  },
});

export default messages;