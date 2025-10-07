import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Tabs, Tab, Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { useModel } from '../generic/model-store';
import TopGradesLeaderboard from './TopGradesLeaderboard';
import TopProgressLeaderboard from './TopProgressLeaderboard';
import './LeaderboardTab.scss';

const LeaderboardTab = () => {
  const [activeTab, setActiveTab] = useState('grades');
  const { courseId } = useSelector((state) => state.courseHome);
  const course = useModel('courseHomeMeta', courseId);

  // eslint-disable-next-line no-console
  console.log('LeaderboardTab render - courseId:', courseId, 'course:', course);

  if (!courseId) {
    // eslint-disable-next-line no-console
    console.log('LeaderboardTab: No courseId, returning null');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Bảng Xếp Hạng | ${course?.title || 'Khóa học'} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>

      <Container size="xl" className="leaderboard-tab">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="trophy-icon">🏆</span>
              Bảng Xếp Hạng
            </h1>
            <p className="page-description">
              Khám phá những học viên xuất sắc nhất trong khóa học
            </p>
          </div>
        </div>

        <div className="leaderboard-tabs-container">
          <Tabs
            variant="tabs"
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="leaderboard-tabs"
          >
            <Tab
              eventKey="grades"
              title={(
                <span className="tab-title">
                  <span className="tab-icon">📊</span>
                  <span>Điểm Số</span>
                  <span className="tab-badge">Grades</span>
                </span>
              )}
            >
              <div className="tab-content-wrapper">
                <TopGradesLeaderboard courseId={courseId} />
              </div>
            </Tab>

            <Tab
              eventKey="progress"
              title={(
                <span className="tab-title">
                  <span className="tab-icon">⚡</span>
                  <span>Tiến Độ</span>
                  <span className="tab-badge">Progress</span>
                </span>
              )}
            >
              <div className="tab-content-wrapper">
                <TopProgressLeaderboard courseId={courseId} />
              </div>
            </Tab>
          </Tabs>
        </div>

        <div className="leaderboard-footer">
          <div className="info-card">
            <h3>💡 Thông tin</h3>
            <ul>
              <li>
                <strong>Bảng Điểm Số:</strong> Xếp hạng dựa trên điểm số trung bình của các bài kiểm tra và bài tập.
              </li>
              <li>
                <strong>Bảng Tiến Độ:</strong> Xếp hạng dựa trên tốc độ hoàn thành các bài học trong khóa.
              </li>
              <li>
                <strong>Cập nhật:</strong> Bảng xếp hạng được cập nhật realtime khi có thay đổi về điểm số hoặc tiến độ.
              </li>
              <li>
                <strong>Privacy:</strong> Chỉ hiển thị thông tin công khai của học viên.
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </>
  );
};

export default LeaderboardTab;
