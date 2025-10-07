import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { useModel } from '../generic/model-store';
import TopGradesLeaderboard from './TopGradesLeaderboard';
import TopProgressLeaderboard from './TopProgressLeaderboard';
import './LeaderboardTab.scss';

const LeaderboardTab = () => {
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
        label: 'Tổng học viên',
        colorClass: 'stat-blue',
      },
      {
        value: gradesSummary.average_grade ? `${gradesSummary.average_grade}%` : '0%',
        label: 'Điểm TB',
        colorClass: 'stat-green',
      },
      {
        value: gradesSummary.highest_grade ? `${gradesSummary.highest_grade}%` : '0%',
        label: 'Điểm cao nhất',
        colorClass: 'stat-purple',
      },
      {
        value: progressData?.students?.length || 0,
        label: 'Đang thi đua',
        colorClass: 'stat-orange',
      },
    ];
    return items;
  }, [gradesData, progressData]);

  if (!courseId) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Bảng Xếp Hạng | ${course?.title || 'Khóa học'} | ${getConfig().SITE_NAME}`}</title>
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

        {/* Leaderboards Grid */}
        <div className="leaderboard-content">
          <TopGradesLeaderboard courseId={courseId} />
          <TopProgressLeaderboard courseId={courseId} />
        </div>
      </Container>
    </>
  );
};

export default LeaderboardTab;
