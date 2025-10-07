import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopGradesData } from './data/thunks';

const TopGradesLeaderboard = ({ courseId }) => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const { data, status, error } = useSelector((state) => state.leaderboard.topGrades);

  useEffect(() => {
    if (courseId) {
      // eslint-disable-next-line no-console
      console.log('TopGradesLeaderboard: Fetching...', {
        courseId, limit, status, data,
      });
      dispatch(fetchTopGradesData(courseId, limit));
    } else {
      // eslint-disable-next-line no-console
      console.log('TopGradesLeaderboard: No courseId');
    }
  }, [courseId, limit, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTopGradesData(courseId, limit));
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
  };

  return (
    <div className="leaderboard-section">
      <div className="section-header">
        <div className="header-top">
          <h2>
            <span className="icon">🏆</span>
            Bảng Xếp Hạng Điểm
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
          <label htmlFor="grades-limit">
            Hiển thị:
            <select
              id="grades-limit"
              value={limit}
              onChange={handleLimitChange}
              disabled={status === 'loading'}
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
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
            <div className="empty-icon">📊</div>
            <h3>Chưa có dữ liệu</h3>
            <p>Bảng xếp hạng sẽ được cập nhật khi có điểm số.</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-row header-row">
              <div className="rank">Hạng</div>
              <div className="student-info">Học viên</div>
              <div className="score">Điểm</div>
            </div>

            {(() => {
              // eslint-disable-next-line no-console
              console.log('TopGrades: Rendering students', data.students);
              return data.students.map((student) => {
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
                    <div className="score">
                      {parseFloat(student.average_grade || 0).toFixed(1)}%
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

TopGradesLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TopGradesLeaderboard;
