import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Warning, CheckCircle, TrendingUp } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import './ProgressWarningBar.scss';

/**
 * ProgressWarningBar - Student progress visualization component
 *
 * Displays:
 * - Actual progress vs expected progress
 * - Visual indicator when behind schedule
 * - Color-coded status with Vietnamese labels
 * - Progress statistics
 *
 * @param {Object} props
 * @param {string} props.courseId - Course ID to fetch progress for
 * @returns {JSX.Element|null}
 */
const ProgressWarningBar = ({ courseId }) => {
  const [warningData, setWarningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgressWarning = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = getConfig();
      // Use the student-specific endpoint (no staff permission required)
      const url = `${config.LMS_BASE_URL}/api/custom/v1/progress-warning/student/${encodeURIComponent(courseId)}/`;

      // eslint-disable-next-line no-console
      console.log('📊 ProgressWarningBar: Fetching from', url);

      const { data } = await getAuthenticatedHttpClient().get(url);

      // eslint-disable-next-line no-console
      console.log('📊 ProgressWarningBar: API response', data);

      if (data.success && data.feature_enabled) {
        // The student endpoint returns data directly for the current user
        setWarningData({
          actualProgress: data.actual_progress || 0,
          expectedProgress: data.expected_progress || 0,
          status: data.status,
          difference: data.difference,
          warning: data.warning,
          message: data.message,
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('📊 ProgressWarningBar: Feature disabled or API failed', data);
        setError(data.message || 'Feature not enabled');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('📊 ProgressWarningBar: Error fetching progress warning:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchProgressWarning();
    }
  }, [courseId]);

  // Don't render if loading, error, or no data
  if (loading || error || !warningData) {
    return null;
  }

  const {
    actualProgress, expectedProgress, status, difference, warning, message,
  } = warningData;

  // Determine color and icon based on status
  let barColor = '#007bff'; // Default blue
  let iconComponent = <Icon src={CheckCircle} />;
  let statusText = 'Bạn đang đạt tiến độ';

  if (status === 'behind' && warning) {
    barColor = '#dc3545'; // Red
    iconComponent = <Icon src={Warning} />;
    statusText = 'Bạn đang chậm tiến độ';
  } else if (status === 'ahead') {
    barColor = '#28a745'; // Green
    iconComponent = <Icon src={TrendingUp} />;
    statusText = 'Bạn đang vượt tiến độ';
  }

  return (
    <div className="progress-warning-bar-container">
      <div className="progress-warning-header">
        <div className="progress-warning-icon" style={{ color: barColor }}>
          {iconComponent}
        </div>
        <div className="progress-warning-text">
          <div className="progress-warning-title">{statusText}</div>
          <div className="progress-warning-subtitle">{message}</div>
        </div>
      </div>

      <div className="progress-warning-bar-wrapper">
        <div className="progress-bar-container">
          {/* Expected progress marker */}
          {expectedProgress > 0 && (
            <div
              className="progress-expected-marker"
              style={{ left: `${expectedProgress}%` }}
              title={`Tiến độ mong đợi: ${expectedProgress.toFixed(1)}%`}
            >
              <div className="marker-line" />
              <div className="marker-label">Mong đợi</div>
            </div>
          )}

          {/* Actual progress bar */}
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${actualProgress}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

        <div className="progress-warning-stats">
          <div className="stat-item">
            <span className="stat-label">Tiến độ của bạn:</span>
            <span className="stat-value" style={{ color: barColor }}>
              {actualProgress.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tiến độ mong đợi:</span>
            <span className="stat-value">{expectedProgress.toFixed(1)}%</span>
          </div>
          {difference !== null && (
            <div className="stat-item">
              <span className="stat-label">Chênh lệch:</span>
              <span
                className="stat-value"
                style={{ color: difference < 0 ? '#dc3545' : '#28a745' }}
              >
                {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProgressWarningBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressWarningBar;
