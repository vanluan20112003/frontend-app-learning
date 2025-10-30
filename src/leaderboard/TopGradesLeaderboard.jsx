import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { fetchTopGradesData } from './data/thunks';
import messages from './messages';

const TopGradesLeaderboard = ({ courseId, intl }) => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className={`leaderboard-section ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="section-header">
        <div className="header-top">
          <h2>
            <span className="icon">🏆</span>
            {intl.formatMessage(messages.gradesLeaderboardTitle)}
          </h2>
          <div className="header-actions">
            <button
              type="button"
              className="collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={status === 'loading'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="header-controls">
            <label htmlFor="grades-limit">
              {intl.formatMessage(messages.displayLabel)}
              <select
                id="grades-limit"
                value={limit}
                onChange={handleLimitChange}
                disabled={status === 'loading'}
              >
                <option value={10}>{intl.formatMessage(messages.top10)}</option>
                <option value={20}>{intl.formatMessage(messages.top20)}</option>
                <option value={50}>{intl.formatMessage(messages.top50)}</option>
                <option value={100}>{intl.formatMessage(messages.top100)}</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {!isCollapsed && (
      <div className="section-body">
        {status === 'loading' && (
          <div className="loading-state">
            <div className="spinner" />
            <p>{intl.formatMessage(messages.loading)}</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error || intl.formatMessage(messages.errorMessage)}</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>{intl.formatMessage(messages.noGradesData)}</h3>
            <p>{intl.formatMessage(messages.noGradesDescription)}</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-row header-row">
              <div className="rank">{intl.formatMessage(messages.rankColumn)}</div>
              <div className="student-info">{intl.formatMessage(messages.studentColumn)}</div>
              <div className="score">{intl.formatMessage(messages.gradeColumn)}</div>
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
                      {parseFloat(student.grade_percentage || 0).toFixed(1)}%
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

TopGradesLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TopGradesLeaderboard);
