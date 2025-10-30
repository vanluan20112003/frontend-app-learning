import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useModel } from '../generic/model-store';
import TopGradesLeaderboard from './TopGradesLeaderboard';
import TopProgressLeaderboard from './TopProgressLeaderboard';
import DiscussionLeaderboard from './DiscussionLeaderboard';
import messages from './messages';
import './LeaderboardTab.scss';

const LeaderboardTab = ({ intl }) => {
  const { courseId } = useSelector((state) => state.courseHome);
  const course = useModel('courseHomeMeta', courseId);

  // Get leaderboard data for statistics
  const gradesData = useSelector((state) => state.leaderboard.topGrades.data);
  const progressData = useSelector((state) => state.leaderboard.topProgress.data);

  // Calculate statistics
  const stats = useMemo(() => {
    const gradesSummary = gradesData?.summary || {};
    const items = [
      {
        value: gradesSummary.total_students || 0,
        label: intl.formatMessage(messages.totalStudents),
        colorClass: 'stat-blue',
      },
      {
        value: gradesSummary.average_grade ? `${gradesSummary.average_grade}%` : '0%',
        label: intl.formatMessage(messages.averageGrade),
        colorClass: 'stat-green',
      },
      {
        value: gradesSummary.highest_grade ? `${gradesSummary.highest_grade}%` : '0%',
        label: intl.formatMessage(messages.highestGrade),
        colorClass: 'stat-purple',
      },
      {
        value: progressData?.students?.length || 0,
        label: intl.formatMessage(messages.activeCompetitors),
        colorClass: 'stat-orange',
      },
    ];
    return items;
  }, [gradesData, progressData, intl]);

  if (!courseId) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.leaderboardTitle)} | ${course?.title || intl.formatMessage(messages.leaderboardTitle)} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>

      <Container size="xl" className="leaderboard-tab">
        {/* Statistics Cards */}
        <div className="stats-cards">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.colorClass}`}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Leaderboards Grid - 3 columns */}
        <div className="leaderboard-content">
          <TopGradesLeaderboard courseId={courseId} />
          <TopProgressLeaderboard courseId={courseId} />
          <DiscussionLeaderboard courseId={courseId} />
        </div>
      </Container>
    </>
  );
};

LeaderboardTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LeaderboardTab);
