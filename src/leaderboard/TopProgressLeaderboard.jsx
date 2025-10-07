import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopProgressData } from './data/thunks';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'all', label: 'Mọi thời đại' },
];

const TopProgressLeaderboard = ({ courseId }) => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const { data, status, error } = useSelector((state) => state.leaderboard.topProgress);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchTopProgressData(courseId, selectedPeriod, limit));
    }
  }, [courseId, selectedPeriod, limit, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTopProgressData(courseId, selectedPeriod, limit));
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
  };

  return (
    <div className="leaderboard-section">
      <div className="section-header">
        <div className="header-top">
          <h2>
            <span className="icon">⚡</span>
            Bảng Xếp Hạng Tiến Độ
          </h2>
          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={status === 'loading'}
          >
            🔄 Làm mới
          </button>
        </div>
        <div className="header-controls">
          <div className="period-buttons">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={selectedPeriod === option.value ? 'active' : ''}
                onClick={() => setSelectedPeriod(option.value)}
                disabled={status === 'loading'}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label htmlFor="progress-limit">
            <select
              id="progress-limit"
              value={limit}
              onChange={handleLimitChange}
              disabled={status === 'loading'}
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </label>
        </div>
      </div>

      <div className="section-body">
        {status === 'loading' && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Đang tải bảng xếp hạng...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error || 'Không thể tải dữ liệu. Vui lòng thử lại.'}</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>Chưa có dữ liệu</h3>
            <p>Bảng xếp hạng sẽ được cập nhật khi có tiến độ học tập.</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-row header-row">
              <div className="rank">Hạng</div>
              <div className="student-info">Học viên</div>
              <div className="score">Tiến độ</div>
            </div>

            {data.students.map((student) => {
              const position = student.position || student.rank;
              const isTopRank = position <= 3;

              return (
                <div key={student.user_id} className="table-row">
                  <div className={isTopRank ? `rank top-rank rank-${position}` : 'rank'}>
                    {position}
                  </div>
                  <div className="student-info">
                    <div className="name">{student.full_name || student.username}</div>
                    <div className="username">@{student.username}</div>
                  </div>
                  <div className="score progress-score">
                    {parseFloat(student.progress_percent || 0).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

TopProgressLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TopProgressLeaderboard;
