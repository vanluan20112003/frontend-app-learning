import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card, Icon, Spinner, Alert, Form,
} from '@openedx/paragon';
import { EmojiEvents, Refresh } from '@openedx/paragon/icons';
import { fetchTopGradesData } from './data/thunks';
import LeaderboardCard from './LeaderboardCard';
import './TopGradesLeaderboard.scss';

const TopGradesLeaderboard = ({ courseId }) => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const { data, status, error } = useSelector((state) => state.leaderboard.topGrades);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchTopGradesData(courseId, limit));
    }
  }, [courseId, limit, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTopGradesData(courseId, limit));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
  };

  if (status === 'loading') {
    return (
      <div className="leaderboard-loading">
        <Spinner animation="border" variant="primary" />
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

  return (
    <div className="top-grades-leaderboard">
      {/* Header */}
      <Card className="leaderboard-header">
        <Card.Body>
          <div className="header-content">
            <div className="header-title">
              <Icon src={EmojiEvents} className="title-icon" />
              <div>
                <h2>Bảng Xếp Hạng Điểm Số</h2>
                <p className="subtitle">Top học viên có điểm cao nhất</p>
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
                className="btn btn-outline-primary btn-sm"
                onClick={handleRefresh}
                title="Làm mới"
              >
                <Icon src={Refresh} />
              </button>
            </div>
          </div>

          {/* Summary stats */}
          <div className="summary-stats">
            <div className="stat-box">
              <div className="stat-value">{summary.total_students}</div>
              <div className="stat-label">Tổng học viên</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{summary.avg_grade?.toFixed(1)}%</div>
              <div className="stat-label">Điểm TB</div>
            </div>
            <div className="stat-box">
              <div className="stat-value highlight">{summary.max_grade?.toFixed(1)}%</div>
              <div className="stat-label">Điểm cao nhất</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{summary.min_grade?.toFixed(1)}%</div>
              <div className="stat-label">Điểm thấp nhất</div>
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
            type="grades"
            animated
          />
        ))}
      </div>
    </div>
  );
};

TopGradesLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TopGradesLeaderboard;
