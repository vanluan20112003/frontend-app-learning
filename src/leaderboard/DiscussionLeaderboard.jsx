import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { fetchDiscussionLeaderboardData } from './data/thunks';
import messages from './messages';

const DiscussionLeaderboard = ({ courseId, intl }) => {
  const RANKING_OPTIONS = [
    { value: 'all', label: intl.formatMessage(messages.discussionRankingAll), icon: '💬' },
    { value: 'threads', label: intl.formatMessage(messages.discussionRankingThreads), icon: '📝' },
    { value: 'comments', label: intl.formatMessage(messages.discussionRankingComments), icon: '💭' },
    { value: 'questions', label: intl.formatMessage(messages.discussionRankingQuestions), icon: '❓' },
    { value: 'votes', label: intl.formatMessage(messages.discussionRankingVotes), icon: '👍' },
  ];

  const dispatch = useDispatch();
  const [limit, setLimit] = useState(20);
  const [selectedRanking, setSelectedRanking] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data, status, error } = useSelector((state) => state.leaderboard.discussion);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchDiscussionLeaderboardData(courseId, selectedRanking, limit));
    }
  }, [courseId, selectedRanking, limit, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDiscussionLeaderboardData(courseId, selectedRanking, limit));
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
  };

  const handleRankingChange = (rankingType) => {
    setSelectedRanking(rankingType);
  };

  const renderValue = (user) => {
    switch (selectedRanking) {
      case 'all':
        return <span className="single-value">{user.total_interactions}</span>;
      case 'threads':
        return <span className="single-value">{user.threads_count}</span>;
      case 'comments':
        return <span className="single-value">{user.comments_count}</span>;
      case 'questions':
        return <span className="single-value">{user.questions_count}</span>;
      case 'votes':
        return <span className="single-value">{user.total_upvotes}</span>;
      default:
        return null;
    }
  };

  const getColumnLabel = () => {
    switch (selectedRanking) {
      case 'all':
        return 'Total';
      case 'threads':
        return intl.formatMessage(messages.discussionColumnThreads);
      case 'comments':
        return intl.formatMessage(messages.discussionColumnComments);
      case 'questions':
        return intl.formatMessage(messages.discussionColumnQuestions);
      case 'votes':
        return intl.formatMessage(messages.discussionColumnVotes);
      default:
        return '';
    }
  };

  return (
    <div className={`leaderboard-section discussion-leaderboard ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="section-header">
        <div className="header-top">
          <h2>
            <span className="icon">💬</span>
            {intl.formatMessage(messages.discussionLeaderboardTitle)}
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

        {/* Ranking Type Filter */}
        {!isCollapsed && (
        <div className="header-controls">
          <label htmlFor="discussion-ranking">
            <select
              id="discussion-ranking"
              value={selectedRanking}
              onChange={(e) => handleRankingChange(e.target.value)}
              disabled={status === 'loading'}
              className="ranking-select"
            >
              {RANKING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="discussion-limit">
            <select
              id="discussion-limit"
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

        {status === 'succeeded' && data?.data?.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>{intl.formatMessage(messages.noDiscussionData)}</h3>
            <p>{intl.formatMessage(messages.noDiscussionDescription)}</p>
          </div>
        )}

        {status === 'succeeded' && data?.data?.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-row header-row">
              <div className="rank">{intl.formatMessage(messages.rankColumn)}</div>
              <div className="student-info">{intl.formatMessage(messages.userColumn)}</div>
              <div className="score">{getColumnLabel()}</div>
            </div>

            {data.data.map((user) => {
              const position = user.rank;
              const isTopRank = position <= 3;

              return (
                <div key={user.user_id} className="table-row">
                  <div className={isTopRank ? `rank top-rank rank-${position}` : 'rank'}>
                    {position}
                  </div>
                  <div className="student-info">
                    <div className="name">{user.full_name || user.username}</div>
                    <div className="username">@{user.username}</div>
                  </div>
                  <div className="score discussion-score">
                    {renderValue(user)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

DiscussionLeaderboard.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionLeaderboard);
