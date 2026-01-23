import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  progressHeader: {
    id: 'learn.progress.header',
    defaultMessage: 'Tiến độ học tập',
    description: 'Progress tab header',
  },
  progressHeaderForTargetUser: {
    id: 'learn.progress.header.forTargetUser',
    defaultMessage: 'Tiến độ học tập của {username}',
    description: 'Progress tab header when viewing another user progress',
  },
  studioLink: {
    id: 'learn.progress.studioLink',
    defaultMessage: 'Xem cài đặt chấm điểm trong Studio',
    description: 'Link to view grading settings in Studio',
  },
});

export default messages;
