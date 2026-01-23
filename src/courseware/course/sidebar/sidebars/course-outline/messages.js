import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loading: {
    id: 'courseOutline.loading',
    defaultMessage: 'Đang tải...',
    description: 'Screen reader text to use on the spinner while the sidebar is loading.',
  },
  toggleCourseOutlineTrigger: {
    id: 'courseOutline.toggle.button',
    defaultMessage: 'Bật/tắt mục lục khóa học',
    description: 'Button for the learner to toggle the sidebar',
  },
  courseOutlineTitle: {
    id: 'courseOutline.tray.title',
    defaultMessage: 'Mục lục khóa học',
    description: 'Title text displayed for the course outline tray',
  },
  completedUnit: {
    id: 'courseOutline.completedUnit',
    defaultMessage: 'Bài đã hoàn thành',
    description: 'Text used to describe the green checkmark icon in front of a unit title',
  },
  incompleteUnit: {
    id: 'courseOutline.incompleteUnit',
    defaultMessage: 'Bài chưa hoàn thành',
    description: 'Text used to describe the gray checkmark icon in front of a unit title',
  },
});

export default messages;
