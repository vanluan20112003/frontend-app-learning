import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { EmojiEvents, Speed, TrendingUp } from '@openedx/paragon/icons';
import './LeaderboardCard.scss';

const LeaderboardCard = ({
  student,
  type,
  showEmail,
  animated,
}) => {
  const {
    rank,
    full_name: fullName,
    username,
    email,
    grade_percentage: gradePercentage,
    letter_grade: letterGrade,
    progress_percent: progressPercent,
    completion_speed: completionSpeed,
    days_to_complete: daysToComplete,
  } = student;

  // Get medal icon and color for top 3
  const getMedalInfo = (position) => {
    switch (position) {
      case 1:
        return { icon: EmojiEvents, color: 'gold', label: '🥇' };
      case 2:
        return { icon: EmojiEvents, color: 'silver', label: '🥈' };
      case 3:
        return { icon: EmojiEvents, color: 'bronze', label: '🥉' };
      default:
        return null;
    }
  };

  const medalInfo = getMedalInfo(rank);
  const isTopThree = rank <= 3;

  // Get speed badge info
  const getSpeedBadge = (speed) => {
    switch (speed) {
      case 'very_fast':
        return { label: 'Rất nhanh', color: 'success', icon: Speed };
      case 'fast':
        return { label: 'Nhanh', color: 'info', icon: TrendingUp };
      case 'moderate':
        return { label: 'Vừa phải', color: 'warning', icon: TrendingUp };
      case 'slow':
        return { label: 'Chậm', color: 'secondary', icon: TrendingUp };
      default:
        return null;
    }
  };

  const speedBadge = type === 'progress' && completionSpeed ? getSpeedBadge(completionSpeed) : null;

  return (
    <div
      className={`leaderboard-card ${isTopThree ? 'top-three' : ''} ${isTopThree ? `rank-${rank}` : ''} ${animated ? 'animated' : ''}`}
      style={{ animationDelay: animated ? `${rank * 0.05}s` : '0s' }}
    >
      {/* Rank badge */}
      <div className={`rank-badge ${isTopThree ? medalInfo.color : ''}`}>
        {isTopThree ? (
          <span className="medal">{medalInfo.label}</span>
        ) : (
          <span className="rank-number">#{rank}</span>
        )}
      </div>

      {/* Student info */}
      <div className="student-info">
        <div className="student-name">
          {fullName || username}
        </div>
        <div className="student-username">
          @{username}
        </div>
        {showEmail && email && (
          <div className="student-email">{email}</div>
        )}
      </div>

      {/* Stats */}
      <div className="student-stats">
        {type === 'grades' && (
          <>
            <div className="stat-item primary">
              <div className="stat-value">{gradePercentage?.toFixed(1)}%</div>
              <div className="stat-label">Điểm số</div>
            </div>
            {letterGrade && (
              <div className="stat-item secondary">
                <div className="stat-value grade-letter">{letterGrade}</div>
                <div className="stat-label">Xếp loại</div>
              </div>
            )}
          </>
        )}

        {type === 'progress' && (
          <>
            <div className="stat-item primary">
              <div className="stat-value">{progressPercent?.toFixed(0)}%</div>
              <div className="stat-label">Tiến độ</div>
            </div>
            {daysToComplete && (
              <div className="stat-item secondary">
                <div className="stat-value">{daysToComplete}</div>
                <div className="stat-label">Ngày</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Speed badge for progress type */}
      {speedBadge && (
        <div className={`speed-badge badge-${speedBadge.color}`}>
          <Icon src={speedBadge.icon} className="speed-icon" />
          <span>{speedBadge.label}</span>
        </div>
      )}

      {/* Shine effect for top 3 */}
      {isTopThree && <div className="shine-effect" />}
    </div>
  );
};

LeaderboardCard.propTypes = {
  student: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
    full_name: PropTypes.string,
    grade_percentage: PropTypes.number,
    letter_grade: PropTypes.string,
    progress_percent: PropTypes.number,
    completion_speed: PropTypes.string,
    days_to_complete: PropTypes.number,
  }).isRequired,
  type: PropTypes.oneOf(['grades', 'progress']).isRequired,
  showEmail: PropTypes.bool,
  animated: PropTypes.bool,
};

LeaderboardCard.defaultProps = {
  showEmail: false,
  animated: true,
};

export default LeaderboardCard;
