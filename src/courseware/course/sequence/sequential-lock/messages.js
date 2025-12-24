import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  contentLocked: {
    id: 'learn.sequentialLock.content.locked',
    defaultMessage: 'Content Locked',
    description: 'Message shown when content is locked due to sequential learning requirement.',
  },
  completePreviousFirst: {
    id: 'learn.sequentialLock.complete.previous',
    defaultMessage: "You must complete '{previousSequenceTitle}' before accessing this content.",
    description: 'Message explaining that user must complete previous section first.',
  },
  goToPreviousSection: {
    id: 'learn.sequentialLock.goToPrevious',
    defaultMessage: 'Go To Previous Section',
    description: 'Button text to navigate to the previous incomplete section.',
  },
});

export default messages;
