import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { fetchTopProgressData } from './data/thunks';
import messages from './messages';

const TopProgressLeaderboard = ({ courseId, intl }) => {
  const PERIOD_OPTIONS = [
    { value: 'week', label: intl.formatMessage(messages.thisWeek) },
    { value: 'month', label: intl.formatMessage(messages.thisMonth) },
    { value: 'all', label: intl.formatMessage(messages.allTime) },
  ];
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
            {intl.formatMessage(messages.progressLeaderboardTitle)}
          </h2>
          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={status === 'loading'}
          >
            🔄 {intl.formatMessage(messages.refreshButton)}
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
              <option value={10}>{intl.formatMessage(messages.top10)}</option>
              <option value={20}>{intl.formatMessage(messages.top20)}</option>
              <option value={50}>{intl.formatMessage(messages.top50)}</option>
            </select>
          </label>
        </div>
      </div>

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
            <div className="empty-icon">📈</div>
            <h3>{intl.formatMessage(messages.noProgressData)}</h3>
            <p>{intl.formatMessage(messages.noProgressDescription)}</p>
          </div>
        )}

        {status === 'succeeded' && data?.students?.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-row header-row">
              <div className="rank">{intl.formatMessage(messages.rankColumn)}</div>
              <div className="student-info">{intl.formatMessage(messages.studentColumn)}</div>
              <div className="score">{intl.formatMessage(messages.progressColumn)}</div>
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
  intl: intlShape.isRequired,
};

export default injectIntl(TopProgressLeaderboard);
