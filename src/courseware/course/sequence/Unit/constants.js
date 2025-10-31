import { StrictDict } from '@edx/react-unit-test-utils/dist';

export const modelKeys = StrictDict({
  units: 'units',
  coursewareMeta: 'coursewareMeta',
});

export const views = StrictDict({
  student: 'student_view',
  public: 'public_view',
});

export const loadingState = 'loading';

export const messageTypes = StrictDict({
  modal: 'plugin.modal',
  resize: 'plugin.resize',
  videoFullScreen: 'plugin.videoFullScreen',
  h5pGetUserId: 'mooc_get_user_id',
});

export default StrictDict({
  modelKeys,
  views,
  loadingState,
  messageTypes,
});
