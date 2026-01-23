import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Page header
  leaderboardTitle: {
    id: 'leaderboard.title',
    defaultMessage: 'Bảng xếp hạng',
    description: 'Main title for the leaderboard page',
  },
  leaderboardDescription: {
    id: 'leaderboard.description',
    defaultMessage: 'Khám phá những học viên xuất sắc nhất trong khóa học này',
    description: 'Description text for the leaderboard page',
  },

  // Statistics cards
  totalStudents: {
    id: 'leaderboard.stats.totalStudents',
    defaultMessage: 'Tổng số học viên',
    description: 'Label for total students statistic',
  },
  averageGrade: {
    id: 'leaderboard.stats.averageGrade',
    defaultMessage: 'Điểm trung bình',
    description: 'Label for average grade statistic',
  },
  highestGrade: {
    id: 'leaderboard.stats.highestGrade',
    defaultMessage: 'Điểm cao nhất',
    description: 'Label for highest grade statistic',
  },
  activeCompetitors: {
    id: 'leaderboard.stats.activeCompetitors',
    defaultMessage: 'Đang thi đua',
    description: 'Label for active competitors statistic',
  },

  // Grades leaderboard
  gradesLeaderboardTitle: {
    id: 'leaderboard.grades.title',
    defaultMessage: 'Top học viên theo điểm',
    description: 'Title for grades leaderboard section',
  },
  progressLeaderboardTitle: {
    id: 'leaderboard.progress.title',
    defaultMessage: 'Top học viên theo tiến độ',
    description: 'Title for progress leaderboard section',
  },

  // Controls
  refreshButton: {
    id: 'leaderboard.refresh',
    defaultMessage: 'Làm mới',
    description: 'Label for refresh button',
  },
  displayLabel: {
    id: 'leaderboard.display',
    defaultMessage: 'Hiển thị:',
    description: 'Label for display dropdown',
  },
  top10: {
    id: 'leaderboard.top10',
    defaultMessage: 'Top 10',
    description: 'Option to show top 10 students',
  },
  top20: {
    id: 'leaderboard.top20',
    defaultMessage: 'Top 20',
    description: 'Option to show top 20 students',
  },
  top50: {
    id: 'leaderboard.top50',
    defaultMessage: 'Top 50',
    description: 'Option to show top 50 students',
  },
  top100: {
    id: 'leaderboard.top100',
    defaultMessage: 'Top 100',
    description: 'Option to show top 100 students',
  },

  // Period filters
  thisWeek: {
    id: 'leaderboard.period.week',
    defaultMessage: 'Tuần này',
    description: 'Filter option for this week',
  },
  thisMonth: {
    id: 'leaderboard.period.month',
    defaultMessage: 'Tháng này',
    description: 'Filter option for this month',
  },
  allTime: {
    id: 'leaderboard.period.allTime',
    defaultMessage: 'Toàn bộ',
    description: 'Filter option for all time',
  },

  // Table headers
  rankColumn: {
    id: 'leaderboard.table.rank',
    defaultMessage: 'Hạng',
    description: 'Column header for rank',
  },
  studentColumn: {
    id: 'leaderboard.table.student',
    defaultMessage: 'Học viên',
    description: 'Column header for student name',
  },
  gradeColumn: {
    id: 'leaderboard.table.grade',
    defaultMessage: 'Điểm',
    description: 'Column header for grade',
  },
  progressColumn: {
    id: 'leaderboard.table.progress',
    defaultMessage: 'Tiến độ',
    description: 'Column header for progress',
  },

  // Loading states
  loading: {
    id: 'leaderboard.loading',
    defaultMessage: 'Đang tải bảng xếp hạng...',
    description: 'Loading message',
  },

  // Error states
  errorMessage: {
    id: 'leaderboard.error',
    defaultMessage: 'Không thể tải dữ liệu. Vui lòng thử lại.',
    description: 'Error message when data fails to load',
  },

  // Empty states
  noGradesData: {
    id: 'leaderboard.grades.empty',
    defaultMessage: 'Chưa có dữ liệu điểm',
    description: 'Message when no grades data exists',
  },
  noGradesDescription: {
    id: 'leaderboard.grades.emptyDescription',
    defaultMessage: 'Bảng xếp hạng sẽ được cập nhật khi có điểm.',
    description: 'Description for empty grades state',
  },
  noProgressData: {
    id: 'leaderboard.progress.empty',
    defaultMessage: 'Chưa có dữ liệu tiến độ',
    description: 'Message when no progress data exists',
  },
  noProgressDescription: {
    id: 'leaderboard.progress.emptyDescription',
    defaultMessage: 'Bảng xếp hạng sẽ được cập nhật khi có tiến độ học tập.',
    description: 'Description for empty progress state',
  },

  // Discussion Leaderboard
  discussionLeaderboardTitle: {
    id: 'leaderboard.discussion.title',
    defaultMessage: 'Bảng xếp hạng thảo luận',
    description: 'Title for discussion leaderboard section',
  },
  discussionRankingAll: {
    id: 'leaderboard.discussion.ranking.all',
    defaultMessage: 'Tất cả tương tác',
    description: 'Filter for all discussion interactions',
  },
  discussionRankingThreads: {
    id: 'leaderboard.discussion.ranking.threads',
    defaultMessage: 'Chủ đề',
    description: 'Filter for discussion topics',
  },
  discussionRankingComments: {
    id: 'leaderboard.discussion.ranking.comments',
    defaultMessage: 'Bình luận',
    description: 'Filter for discussion comments',
  },
  discussionRankingQuestions: {
    id: 'leaderboard.discussion.ranking.questions',
    defaultMessage: 'Câu hỏi',
    description: 'Filter for discussion questions',
  },
  discussionRankingVotes: {
    id: 'leaderboard.discussion.ranking.votes',
    defaultMessage: 'Lượt thích',
    description: 'Filter for discussion upvotes',
  },
  discussionColumnAll: {
    id: 'leaderboard.discussion.column.all',
    defaultMessage: 'Tổng tương tác',
    description: 'Column header for total interactions',
  },
  discussionColumnThreads: {
    id: 'leaderboard.discussion.column.threads',
    defaultMessage: 'Chủ đề đã tạo',
    description: 'Column header for topics created',
  },
  discussionColumnComments: {
    id: 'leaderboard.discussion.column.comments',
    defaultMessage: 'Bình luận đã đăng',
    description: 'Column header for comments posted',
  },
  discussionColumnQuestions: {
    id: 'leaderboard.discussion.column.questions',
    defaultMessage: 'Câu hỏi đã đặt',
    description: 'Column header for questions asked',
  },
  discussionColumnVotes: {
    id: 'leaderboard.discussion.column.votes',
    defaultMessage: 'Lượt thích nhận được',
    description: 'Column header for upvotes received',
  },
  userColumn: {
    id: 'leaderboard.table.user',
    defaultMessage: 'Người dùng',
    description: 'Column header for user name',
  },
  noDiscussionData: {
    id: 'leaderboard.discussion.empty',
    defaultMessage: 'Chưa có dữ liệu thảo luận',
    description: 'Message when no discussion data exists',
  },
  noDiscussionDescription: {
    id: 'leaderboard.discussion.emptyDescription',
    defaultMessage: 'Bảng xếp hạng sẽ được cập nhật khi có hoạt động thảo luận.',
    description: 'Description for empty discussion state',
  },
});

export default messages;
