import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  previousButton: {
    id: 'learn.sequence.navigation.previous',
    defaultMessage: 'Trước',
    description: 'Previous button in sequence navigation',
  },
  nextButton: {
    id: 'learn.sequence.navigation.next',
    defaultMessage: 'Tiếp',
    description: 'Next button in sequence navigation',
  },
  completeButton: {
    id: 'learn.sequence.navigation.complete',
    defaultMessage: 'Hoàn thành',
    description: 'Complete button in sequence navigation',
  },
  completedButton: {
    id: 'learn.sequence.navigation.completed',
    defaultMessage: 'Đã hoàn thành',
    description: 'Completed button in sequence navigation',
  },
  nextSection: {
    id: 'learn.sequence.navigation.nextSection',
    defaultMessage: 'Phần tiếp theo',
    description: 'Next section button text',
  },
  previousSection: {
    id: 'learn.sequence.navigation.previousSection',
    defaultMessage: 'Phần trước',
    description: 'Previous section button text',
  },
  unitListLabel: {
    id: 'learn.sequence.navigation.unitList.label',
    defaultMessage: 'Điều hướng bài học',
    description: 'Accessible label for unit list',
  },
  openBookmark: {
    id: 'learn.sequence.navigation.bookmark.open',
    defaultMessage: 'Đánh dấu bài này',
    description: 'Add bookmark button text',
  },
  effortEstimate: {
    id: 'learn.sequence.navigation.effort.estimate',
    defaultMessage: '{effort} phút',
    description: 'Effort estimate in minutes',
  },
});

export default messages;
