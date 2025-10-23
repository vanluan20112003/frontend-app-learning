import React, { useEffect, useState } from 'react';
import {
  Spinner,
  Icon,
  Button,
} from '@openedx/paragon';
import {
  Person,
  Email,
  VideoLibrary,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Assessment,
  ExpandMore,
  ExpandLess,
  Refresh,
  School,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useParams } from 'react-router-dom';
import { useModel } from '../../../generic/model-store';
import messages from './messages';
import './VideoProgressTool.scss';

const VideoProgressTool = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const course = useModel('coursewareMeta', courseId);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState(null);
  const [isCompactView, setIsCompactView] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    const client = getAuthenticatedHttpClient();
    const { LMS_BASE_URL } = getConfig();
    const apiUrl = `${LMS_BASE_URL}/api/custom/v1/users/me/`;

    const response = await client.get(apiUrl);

    if (response.data && response.data.success) {
      setUserData(response.data.data);
      return response.data.data;
    }
    throw new Error('Invalid API response');
  };

  // Fetch H5P progress data from API
  const fetchProgressData = async (userId) => {
    const H5P_API_BASE = 'https://h5p.itp.vn/wp-json/mooc/v1';
    const apiUrl = `${H5P_API_BASE}/combined-progress/${userId}/${courseId}`;

    // console.log('Fetching progress from:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log('H5P Progress Data:', data);

    // Map API response to progressData format
    const mappedData = {
      // Video statistics
      videosStarted: data.video_progress?.total_videos || 0,
      totalVideos: data.video_progress?.total_videos || 0,
      videosCompleted: data.video_progress?.completed_videos || 0,
      averageWatchProgress: Math.round(data.video_progress?.average_progress || 0),

      // Score statistics
      currentScore: data.scores?.total_score || 0,
      maxPossibleScore: data.scores?.total_max_score || 0,
      scorePercentage: Math.round(data.scores?.average_percentage || 0),
      videoInteractionPoints: data.scores?.total_score || 0,

      // Overall completion
      courseCompletionRate: Math.round(data.overall?.overall_completion || 0),

      // Additional info
      totalContents: data.scores?.total_contents || 0,
      completedContents: data.scores?.completed_contents || 0,
      totalWatchedTime: data.video_progress?.total_watched_time || 0,
      totalDuration: data.video_progress?.total_duration || 0,

      // Total contents in all course folders (including not started)
      totalContentsInCourseFolders: data.overall?.total_contents_in_course_folders || 0,
    };

    return mappedData;
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data first
        const user = await fetchUserData();

        // Then fetch progress data using user ID
        if (user?.id) {
          const progress = await fetchProgressData(user.id);
          setProgressData(progress);
        }
      } catch (err) {
        // console.error('Error loading data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  // Refresh data function
  const handleRefresh = async () => {
    if (!userData?.id) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      const progress = await fetchProgressData(userData.id);
      setProgressData(progress);
    } catch (err) {
      // console.error('Error refreshing data:', err);
      setError('Không thể cập nhật dữ liệu. Vui lòng thử lại.');
    } finally {
      setRefreshing(false);
    }
  };

  // Tính các phần trăm
  const videoCompletionRate = progressData?.totalVideos > 0
    ? Math.round((progressData.videosCompleted / progressData.totalVideos) * 100)
    : 0;

  const videoStartedRate = progressData?.totalVideos > 0
    ? Math.round((progressData.videosStarted / progressData.totalVideos) * 100)
    : 0;

  const scoreRate = progressData?.maxPossibleScore > 0
    ? Math.round((progressData.currentScore / progressData.maxPossibleScore) * 100)
    : 0;

  if (loading) {
    return (
      <div className="video-progress-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">{intl.formatMessage(messages.videoProgressLoading)}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-progress-error">
        <p className="error-message">{error}</p>
        <Button
          variant="primary"
          onClick={handleRefresh}
          disabled={refreshing}
          iconBefore={Refresh}
        >
          {refreshing ? 'Đang tải...' : 'Thử lại'}
        </Button>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="video-progress-error">
        <p>Không có dữ liệu tiến trình</p>
      </div>
    );
  }

  return (
    <div className={`video-progress-tool-modern ${isCompactView ? 'compact-view' : 'full-view'}`}>
      {/* Toggle View Button and Refresh Button */}
      <div className="view-toggle-container">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setIsCompactView(!isCompactView)}
          iconBefore={isCompactView ? ExpandMore : ExpandLess}
        >
          {isCompactView ? 'Xem đầy đủ' : 'Xem tóm tắt'}
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          iconBefore={Refresh}
          className="ml-2"
        >
          {refreshing ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>

      {/* Header with User Info */}
      <div className="progress-header">
        <div className="user-badge">
          <div className="avatar-circle">
            <Icon src={Person} className="avatar-icon" />
          </div>
          <div className="user-details">
            <h3 className="user-name">{userData?.full_name || 'N/A'}</h3>
            <div className="user-meta">
              <Icon src={Email} className="meta-icon" />
              <span className="user-email">{userData?.email || 'N/A'}</span>
            </div>
            {course?.title && (
              <div className="user-meta">
                <Icon src={School} className="meta-icon" />
                <span className="course-name">{course.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact View - Summary */}
      {isCompactView && (
        <div className="compact-summary">
          <div className="compact-stat-row">
            <div className="compact-stat-item">
              <Icon src={Assessment} className="compact-icon" />
              <div className="compact-stat-info">
                <span className="compact-label">Hoàn thành</span>
                <span className="compact-value">{progressData.courseCompletionRate}%</span>
              </div>
            </div>
            <div className="compact-stat-item">
              <Icon src={VideoLibrary} className="compact-icon video" />
              <div className="compact-stat-info">
                <span className="compact-label">Video</span>
                <span className="compact-value">{progressData.videosCompleted}/{progressData.totalVideos}</span>
              </div>
            </div>
          </div>

          <div className="compact-stat-row">
            <div className="compact-stat-item">
              <Icon src={TrendingUp} className="compact-icon score" />
              <div className="compact-stat-info">
                <span className="compact-label">Điểm quá trình</span>
                <span className="compact-value">{progressData.currentScore}/{progressData.maxPossibleScore}</span>
              </div>
            </div>
            <div className="compact-stat-item">
              <Icon src={PlayCircle} className="compact-icon started" />
              <div className="compact-stat-info">
                <span className="compact-label">Tiến độ TB</span>
                <span className="compact-value">{progressData.averageWatchProgress}%</span>
              </div>
            </div>
          </div>

          <div className="compact-stat-row">
            <div className="compact-stat-item full-width">
              <Icon src={VideoLibrary} className="compact-icon total" />
              <div className="compact-stat-info">
                <span className="compact-label">Tổng Video Môn Học</span>
                <span className="compact-value total">{progressData.totalContentsInCourseFolders}</span>
              </div>
            </div>
          </div>

          <div className="compact-progress-bar">
            <div className="compact-progress-label">
              <span>Tiến độ khóa học</span>
              <span className="compact-percentage">{progressData.courseCompletionRate}%</span>
            </div>
            <div className="compact-progress">
              <div
                className="compact-progress-fill"
                style={{ width: `${progressData.courseCompletionRate}%` }}
              />
            </div>
          </div>

          {/* Important Notices in Compact View */}
          <div className="compact-notices">
            <div className="compact-notice warning">
              <span className="notice-icon">⭐</span>
              <span className="notice-text">Bấm nút ngôi sao ở cuối video để hoàn thành</span>
            </div>
            <div className="compact-notice warning">
              <span className="notice-icon">📝</span>
              <span className="notice-text">Nhớ bấm &quot;Nộp bài&quot; để kết quả được ghi nhận</span>
            </div>
            <div className="compact-notice danger">
              <span className="notice-icon">⚠️</span>
              <span className="notice-text">Không dùng tab ẩn danh khi làm bài tập</span>
            </div>
          </div>
        </div>
      )}

      {/* Full View - Main Statistics Grid */}
      {!isCompactView && (
        <>
          {/* Summary Bar - Moved to top */}
          <div className="summary-bar">
            <div className="summary-item">
              <span className="summary-label">Tổng Video:</span>
              <span className="summary-value">{progressData.totalVideos}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Đã Xem:</span>
              <span className="summary-value started">{progressData.videosStarted}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Hoàn Thành:</span>
              <span className="summary-value completed">{progressData.videosCompleted}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Điểm Quá Trình:</span>
              <span className="summary-value score">{progressData.currentScore}/{progressData.maxPossibleScore}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-item">
              <span className="summary-label">Tổng Video Môn:</span>
              <span className="summary-value total">{progressData.totalContentsInCourseFolders}</span>
            </div>
          </div>

          <div className="stats-grid">
            {/* Overall Course Completion - Large Card */}
            <div className="stat-card large-card">
              <div className="card-header">
                <Icon src={Assessment} className="card-icon" />
                <h4>Tiến Độ Khóa Học</h4>
              </div>
              <div className="circular-progress-wrapper">
                <svg className="circular-chart" viewBox="0 0 36 36">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${progressData.courseCompletionRate}, 100`}
                    d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage-large">
                    {progressData.courseCompletionRate}%
                  </text>
                </svg>
              </div>
              <p className="stat-description">Hoàn thành khóa học</p>
            </div>

            {/* Video Statistics */}
            <div className="stat-card">
              <div className="card-header">
                <Icon src={VideoLibrary} className="card-icon" />
                <h4>Video</h4>
              </div>
              <div className="stat-row">
                <div className="stat-item">
                  <Icon src={PlayCircle} className="stat-icon started" />
                  <div className="stat-content">
                    <span className="stat-label">Đã bắt đầu</span>
                    <span className="stat-value">{progressData.videosStarted}/{progressData.totalVideos}</span>
                    <div className="mini-progress">
                      <div className="mini-progress-bar started" style={{ width: `${videoStartedRate}%` }} />
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <Icon src={CheckCircle} className="stat-icon completed" />
                  <div className="stat-content">
                    <span className="stat-label">Hoàn thành (≥95%)</span>
                    <span className="stat-value">{progressData.videosCompleted}/{progressData.totalVideos}</span>
                    <div className="mini-progress">
                      <div className="mini-progress-bar completed" style={{ width: `${videoCompletionRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="avg-progress">
                <span className="avg-label">Tiến trình xem trung bình:</span>
                <span className="avg-value">{progressData.averageWatchProgress}%</span>
              </div>
            </div>

            {/* Score Statistics */}
            <div className="stat-card">
              <div className="card-header">
                <Icon src={TrendingUp} className="card-icon" />
                <h4>Điểm Quá Trình</h4>
              </div>
              <div className="score-content">
                <div className="score-main">
                  <div className="score-numbers">
                    <span className="current-score">{progressData.currentScore}</span>
                    <span className="score-divider">/</span>
                    <span className="max-score">{progressData.maxPossibleScore}</span>
                  </div>
                  <div className="progress-bar-modern">
                    <div className="progress-fill score" style={{ width: `${scoreRate}%` }}>
                      <span className="progress-label">{scoreRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="score-details">
                  <div className="score-detail-item info-note">
                    <span className="detail-note">
                      💡 Điểm quá trình bao gồm điểm tương tác video và bài tập trong khóa học (không bao gồm điểm thi)
                    </span>
                  </div>

                  <div className="score-detail-item warning-note">
                    <span className="detail-note">
                      ⭐ <strong>Quan trọng:</strong> Bấm vào nút ngôi sao ở cuối video để hoàn thành xem video
                    </span>
                  </div>

                  <div className="score-detail-item warning-note">
                    <span className="detail-note">
                      📝 <strong>Bài tập:</strong> Nhớ bấm nút &quot;Nộp bài&quot; để kết quả được ghi nhận
                    </span>
                  </div>

                  <div className="score-detail-item danger-note">
                    <span className="detail-note">
                      ⚠️ <strong>Chú ý:</strong> Không sử dụng tab ẩn danh khi làm bài tập tương tác
                    </span>
                  </div>

                  <div className="score-detail-item">
                    <span className="detail-label">Điểm tương tác video & bài tập:</span>
                    <span className="detail-value highlight">{progressData.videoInteractionPoints}</span>
                  </div>
                  <div className="score-detail-item">
                    <span className="detail-label">% đạt được trên bài đã làm:</span>
                    <span className="detail-value success">{progressData.scorePercentage}%</span>
                  </div>
                  <div className="score-detail-item">
                    <span className="detail-label">Tổng số video trong môn học:</span>
                    <span className="detail-value total">{progressData.totalContentsInCourseFolders}</span>
                  </div>
                  <div className="score-detail-item">
                    <span className="detail-label">Video có bài tập đã làm:</span>
                    <span className="detail-value completed">{progressData.completedContents}/{progressData.totalContentsInCourseFolders}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoProgressTool;
