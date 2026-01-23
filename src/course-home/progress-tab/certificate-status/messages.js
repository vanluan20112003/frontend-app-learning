import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notPassingHeader: {
    id: 'progress.certificateStatus.notPassingHeader',
    defaultMessage: 'Trạng thái chứng chỉ',
    description: 'Header text when learner certifcate status is not passing',
  },
  notPassingBody: {
    id: 'progress.certificateStatus.notPassingBody',
    defaultMessage: 'Để đủ điều kiện nhận chứng chỉ, bạn phải đạt điểm đậu.',
    description: 'Body text when learner certifcate status is not passing',
  },
  inProgressHeader: {
    id: 'progress.certificateStatus.inProgressHeader',
    defaultMessage: 'Sắp có thêm nội dung mới!',
    description: 'Header text when learner certifcate is in progress',
  },
  inProgressBody: {
    id: 'progress.certificateStatus.inProgressBody',
    defaultMessage: 'Có vẻ như còn nội dung trong khóa học này sẽ được phát hành trong tương lai. Hãy theo dõi email hoặc kiểm tra lại khóa học để biết khi nào nội dung mới có sẵn.',
    description: 'Body text when learner certifcate is in progress',
  },
  requestableHeader: {
    id: 'progress.certificateStatus.requestableHeader',
    defaultMessage: 'Trạng thái chứng chỉ',
    description: 'Header text when learner certifcate status is requestable',
  },
  requestableBody: {
    id: 'progress.certificateStatus.requestableBody',
    defaultMessage: 'Chúc mừng, bạn đủ điều kiện nhận chứng chỉ! Để truy cập chứng chỉ, hãy yêu cầu bên dưới.',
    description: 'Body text when learner certifcate status is requestable',
  },
  requestableButton: {
    id: 'progress.certificateStatus.requestableButton',
    defaultMessage: 'Yêu cầu chứng chỉ',
    description: 'Button text when learner certifcate status is requestable',
  },
  unverifiedHeader: {
    id: 'progress.certificateStatus.unverifiedHeader',
    defaultMessage: 'Trạng thái chứng chỉ',
    description: 'Header text when learner certifcate status is unverified',
  },
  unverifiedButton: {
    id: 'progress.certificateStatus.unverifiedButton',
    defaultMessage: 'Xác minh ID',
    description: 'Button text when learner certifcate status is unverified',
  },
  unverifiedPendingBody: {
    id: 'progress.certificateStatus.courseCelebration.verificationPending',
    defaultMessage: 'Xác minh ID của bạn đang chờ xử lý và chứng chỉ sẽ có sau khi được phê duyệt.',
    description: 'Body text when learner certifcate status is unverified pending',
  },
  downloadableHeader: {
    id: 'progress.certificateStatus.downloadableHeader',
    defaultMessage: 'Chứng chỉ của bạn đã sẵn sàng!',
    description: 'Header text when the certifcate is available',
  },
  viewableButton: {
    id: 'progress.certificateStatus.viewableButton',
    defaultMessage: 'Xem chứng chỉ của tôi',
    description: 'Button text which view or links to the certifcate',
  },
  notAvailableHeader: {
    id: 'progress.certificateStatus.notAvailableHeader',
    defaultMessage: 'Trạng thái chứng chỉ',
    description: 'Header text when the certifcate is not available',
  },
  notAvailableEndDateBody: {
    id: 'progress.certificateBody.notAvailable.endDate',
    defaultMessage: 'Điểm cuối kỳ và chứng chỉ dự kiến có sau {endDate}.',
    description: 'Shown for learners who have finished a course before grades and certificates are available.',
  },
  upgradeHeader: {
    id: 'progress.certificateStatus.upgradeHeader',
    defaultMessage: 'Nhận chứng chỉ',
    description: 'Header text when the learner needs to upgrade to earn a certifcate ',
  },
  upgradeBody: {
    id: 'progress.certificateStatus.upgradeBody',
    defaultMessage: 'Bạn đang theo dõi miễn phí và không đủ điều kiện nhận chứng chỉ. Để nhận chứng chỉ, hãy nâng cấp khóa học ngay hôm nay.',
    description: 'Body text when the learner needs to upgrade to earn a certifcate ',
  },
  upgradeButton: {
    id: 'progress.certificateStatus.upgradeButton',
    defaultMessage: 'Nâng cấp ngay',
    description: 'Button text which leaner needs to upgrade to get the certifcate',
  },
  unverifiedHomeHeader: {
    id: 'progress.certificateStatus.unverifiedHomeHeader.v2',
    defaultMessage: 'Xác minh danh tính để đủ điều kiện nhận chứng chỉ.',
    description: 'Header text when the learner needs to do verification to earn a certifcate ',
  },
  unverifiedHomeButton: {
    id: 'progress.certificateStatus.unverifiedHomeButton',
    defaultMessage: 'Xác minh ID của tôi',
    description: 'Button text which leaner needs to do verification to earn a certifcate',
  },
  unverifiedHomeBody: {
    id: 'progress.certificateStatus.unverifiedHomeBody',
    defaultMessage: 'Để tạo chứng chỉ cho khóa học này, bạn phải hoàn tất quy trình xác minh ID.',
    description: 'Body text when the learner needs to do verification to earn a certifcate',
  },
});

export default messages;
