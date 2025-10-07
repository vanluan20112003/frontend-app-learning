import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Icon, Spinner, Alert, Form, ButtonGroup, Button,
} from '@openedx/paragon';
import { Speed, Refresh } from '@openedx/paragon/icons';
import { fetchTopProgressData } from './data/thunks';
import LeaderboardCard from './LeaderboardCard';
import './TopProgressLeaderboard.scss';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Tuần này', icon: '📅' },
  { value: 'month', label: 'Tháng này', icon: '📆' },
  { value: 'all', label: 'Mọi thời đại', icon: '🏛️' },
];

const TopProgressLeaderboard = ({ courseId }) => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const {
    data, status, error,
  } = useSelector((state) => state.leaderboard.topProgress);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (courseId) {
      dispatch(fetchTopProgressData(courseId, selectedPeriod, limit));
    }
  }, [courseId, selectedPeriod, limit, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTopProgressData(courseId, selectedPeriod, limit));
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
  };

  if (status === 'loading') {
    return (
      <div className="leaderboard-loading">
        <Spinner animation="border" variant="success" />
        <p>Đang tải bảng xếp hạng...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert variant="danger">
        <Alert.Heading>Không thể tải bảng xếp hạng</Alert.Heading>
        <p>{error || 'Đã xảy ra lỗi khi tải dữ liệu'}</p>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRefresh}>
          Thử lại
        </button>
      </Alert>
    );
  }

  if (!data || !data.top_students || data.top_students.length === 0) {
    return (
      <Alert variant="info">
        <p>Chưa có dữ liệu bảng xếp hạng cho khóa học này.</p>
      </Alert>
    );
  }

  const { summary, top_students: topStudents } = data;
  const currentPeriodLabel = PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label || 'Mọi thời đại';

  return (
    <div className="top-progress-leaderboard">
      {/* Header */}
      <Card className="leaderboard-header">
        <Card.Body>
          <div className="header-content">
            <div className="header-title">
              <Icon src={Speed} className="title-icon" />
              <div>
                <h2>Bảng Xếp Hạng Tiến Độ</h2>
                <p className="subtitle">Top học viên hoàn thành nhanh nhất</p>
              </div>
            </div>

            <div className="header-actions">
              <Form.Group className="limit-select">
                <Form.Label className="small">Hiển thị:</Form.Label>
                <Form.Control
                  as="select"
                  value={limit}
                  onChange={handleLimitChange}
                  size="sm"
                >
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
                </Form.Control>
              </Form.Group>

              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleRefresh}
                title="Làm mới"
              >
                <Icon src={Refresh} />
              </button>
            </div>
          </div>

          {/* Period selector */}
          <div className="period-selector">
            <ButtonGroup>
              {PERIOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? 'light' : 'outline-light'}
                  onClick={() => handlePeriodChange(option.value)}
                  size="sm"
                >
                  <span className="period-icon">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {/* Summary stats */}
          <div className="summary-stats">
            <div className="stat-box">
              <div className="stat-value">{summary.total_students_with_progress}</div>
              <div className="stat-label">Học viên</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{summary.total_course_components}</div>
              <div className="stat-label">Tổng bài học</div>
            </div>
            <div className="stat-box">
              <div className="stat-value highlight">{summary.avg_progress?.toFixed(0)}%</div>
              <div className="stat-label">Tiến độ TB</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{currentPeriodLabel}</div>
              <div className="stat-label">Khoảng thời gian</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Leaderboard list */}
      <div className="leaderboard-list">
        {topStudents.map((student) => (
          <LeaderboardCard
            key={student.user_id}
            student={student}
            type="progress"
            animated
          />
        ))}
      </div>
    </div>
  );
};

TopProgressLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TopProgressLeaderboard;
