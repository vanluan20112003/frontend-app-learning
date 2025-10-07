import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Page header
  leaderboardTitle: {
    id: 'leaderboard.title',
    defaultMessage: 'Leaderboard',
    description: 'Main title for the leaderboard page',
  },
  leaderboardDescription: {
    id: 'leaderboard.description',
    defaultMessage: 'Discover the top performers in this course',
    description: 'Description text for the leaderboard page',
  },

  // Statistics cards
  totalStudents: {
    id: 'leaderboard.stats.totalStudents',
    defaultMessage: 'Total Students',
    description: 'Label for total students statistic',
  },
  averageGrade: {
    id: 'leaderboard.stats.averageGrade',
    defaultMessage: 'Average Grade',
    description: 'Label for average grade statistic',
  },
  highestGrade: {
    id: 'leaderboard.stats.highestGrade',
    defaultMessage: 'Highest Grade',
    description: 'Label for highest grade statistic',
  },
  activeCompetitors: {
    id: 'leaderboard.stats.activeCompetitors',
    defaultMessage: 'Competing',
    description: 'Label for active competitors statistic',
  },

  // Grades leaderboard
  gradesLeaderboardTitle: {
    id: 'leaderboard.grades.title',
    defaultMessage: 'Top Students by Grade',
    description: 'Title for grades leaderboard section',
  },
  progressLeaderboardTitle: {
    id: 'leaderboard.progress.title',
    defaultMessage: 'Top Students by Progress',
    description: 'Title for progress leaderboard section',
  },

  // Controls
  refreshButton: {
    id: 'leaderboard.refresh',
    defaultMessage: 'Refresh',
    description: 'Label for refresh button',
  },
  displayLabel: {
    id: 'leaderboard.display',
    defaultMessage: 'Display:',
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
    defaultMessage: 'This Week',
    description: 'Filter option for this week',
  },
  thisMonth: {
    id: 'leaderboard.period.month',
    defaultMessage: 'This Month',
    description: 'Filter option for this month',
  },
  allTime: {
    id: 'leaderboard.period.allTime',
    defaultMessage: 'All Time',
    description: 'Filter option for all time',
  },

  // Table headers
  rankColumn: {
    id: 'leaderboard.table.rank',
    defaultMessage: 'Rank',
    description: 'Column header for rank',
  },
  studentColumn: {
    id: 'leaderboard.table.student',
    defaultMessage: 'Student',
    description: 'Column header for student name',
  },
  gradeColumn: {
    id: 'leaderboard.table.grade',
    defaultMessage: 'Grade',
    description: 'Column header for grade',
  },
  progressColumn: {
    id: 'leaderboard.table.progress',
    defaultMessage: 'Progress',
    description: 'Column header for progress',
  },

  // Loading states
  loading: {
    id: 'leaderboard.loading',
    defaultMessage: 'Loading leaderboard...',
    description: 'Loading message',
  },

  // Error states
  errorMessage: {
    id: 'leaderboard.error',
    defaultMessage: 'Unable to load data. Please try again.',
    description: 'Error message when data fails to load',
  },

  // Empty states
  noGradesData: {
    id: 'leaderboard.grades.empty',
    defaultMessage: 'No grade data available yet',
    description: 'Message when no grades data exists',
  },
  noGradesDescription: {
    id: 'leaderboard.grades.emptyDescription',
    defaultMessage: 'The leaderboard will be updated when grades are available.',
    description: 'Description for empty grades state',
  },
  noProgressData: {
    id: 'leaderboard.progress.empty',
    defaultMessage: 'No progress data available yet',
    description: 'Message when no progress data exists',
  },
  noProgressDescription: {
    id: 'leaderboard.progress.emptyDescription',
    defaultMessage: 'The leaderboard will be updated when learning progress is tracked.',
    description: 'Description for empty progress state',
  },
});

export default messages;
