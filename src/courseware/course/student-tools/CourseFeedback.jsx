import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Button,
  Alert,
  Spinner,
  Icon,
  ModalDialog,
  Pagination,
} from '@openedx/paragon';
import {
  Star,
  StarBorder,
  Edit,
  Delete,
  Visibility,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  checkFeedbackEligibility,
  getCourseFeedback,
  getAllCourseFeedback,
  getCourseAverageRating,
  updateCourseFeedback,
  deleteCourseFeedback,
} from '../../../course-feedback/data/api';
import CourseFeedbackModal from '../../../course-feedback/CourseFeedbackModal';
import messages from './messages';
import './CourseFeedback.scss';

const CourseFeedback = () => {
  const intl = useIntl();
  const courseId = useSelector(state => state.courseware?.courseId);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [myFeedback, setMyFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackPagination, setFeedbackPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [averageRating, setAverageRating] = useState(null);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingFeedback, setDeletingFeedback] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadFeedbackData();
    }
  }, [courseId]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check eligibility
      const eligibilityData = await checkFeedbackEligibility(courseId);
      const completionPct = eligibilityData.completion_percentage || 0;
      
      // User is eligible based on completion percentage, not the is_eligible flag
      // (is_eligible becomes false after submitting feedback, but we still want to show the tool)
      const meetsThreshold = completionPct >= 85;
      setIsEligible(meetsThreshold);
      setCompletionPercentage(completionPct);

      // Get my feedback (if exists)
      let myFeedbackData = null;
      try {
        myFeedbackData = await getCourseFeedback(courseId);
        setMyFeedback(myFeedbackData);
      } catch (err) {
        // No feedback yet, that's okay
        setMyFeedback(null);
      }

      try {
        const feedbackResponse = await getAllCourseFeedback(courseId, 'rating_high', currentPage, 10);
        setAllFeedback(feedbackResponse.results || []);
        setFeedbackPagination(feedbackResponse.pagination);
      } catch (err) {
        // Can't load all feedback, that's okay
        setAllFeedback([]);
        setFeedbackPagination(null);
      }

      // Get average rating
      try {
        const ratingData = await getCourseAverageRating(courseId);
        setAverageRating(ratingData.average_rating);
        setTotalFeedbackCount(ratingData.total_feedback_count);
      } catch (err) {
        // Can't load average rating, that's okay
        setAverageRating(null);
        setTotalFeedbackCount(0);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading feedback data:', err);
      setError('Không thể tải dữ liệu phản hồi');
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async () => {
    try {
      setDeletingFeedback(true);
      await deleteCourseFeedback(courseId);
      
      sendTrackEvent('edx.ui.lms.course_feedback.deleted', {
        courseId,
      });

      setShowDeleteConfirm(false);
      setMyFeedback(null);
      await loadFeedbackData(); // Reload to get all feedback
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Không thể xóa phản hồi. Vui lòng thử lại.');
    } finally {
      setDeletingFeedback(false);
    }
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackModal(false);
    loadFeedbackData(); // Reload data after submission/update
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    try {
      const feedbackResponse = await getAllCourseFeedback(courseId, 'rating_high', page, 10);
      setAllFeedback(feedbackResponse.results || []);
      setFeedbackPagination(feedbackResponse.pagination);
    } catch (err) {
      console.error('Error loading page:', err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];

    // Round rating to nearest 0.25 for better partial star display
    const roundedRating = Math.round(rating * 4) / 4;
    const fullStars = Math.floor(roundedRating);
    const decimal = roundedRating % 1;

    // Determine partial star percentage based on decimal
    let hasPartialStar = false;
    let partialPercent = 0;

    if (decimal >= 0.24 && decimal <= 0.26) {
      // Quarter star (25%)
      hasPartialStar = true;
      partialPercent = 25;
    } else if (decimal >= 0.49 && decimal <= 0.51) {
      // Half star (50%)
      hasPartialStar = true;
      partialPercent = 50;
    } else if (decimal >= 0.74 && decimal <= 0.76) {
      // Three-quarter star (75%)
      hasPartialStar = true;
      partialPercent = 75;
    }

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // Full star
        stars.push(
          <Icon
            key={i}
            src={Star}
            className="star-filled"
          />
        );
      } else if (i === fullStars + 1 && hasPartialStar) {
        // Partial star (quarter, half, or three-quarter)
        stars.push(
          <span key={i} className="star-partial-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <Icon src={StarBorder} className="star-empty" style={{ position: 'relative' }} />
            <span
              className="star-partial-fill"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${partialPercent}%`,
                overflow: 'hidden',
                display: 'inline-block'
              }}
            >
              <Icon src={Star} className="star-filled" />
            </span>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <Icon
            key={i}
            src={StarBorder}
            className="star-empty"
          />
        );
      }
    }
    return <span className="star-rating-display mb-0">{stars}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="course-feedback-tool">
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-feedback-tool">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // Not eligible - but can still view others' feedback
  if (!isEligible) {
    return (
      <div className="course-feedback-tool">
        {/* Average Rating Display */}
        <Card className="average-rating-card mb-3">
          <Card.Body className="p-4">
            <h3 className="mb-2">Đánh giá khóa học</h3>
            <div className="d-flex mb-2">
              {averageRating !== null && totalFeedbackCount > 0 ? (
                <>
                  <span className="average-rating-number mb-0 mr-4">{averageRating.toFixed(1)}</span>
                  {renderStars(averageRating)}
                </>
              ) : (
                <>
                  <span className="average-rating-number mb-0 mr-4">--</span>
                  {renderStars(0)}
                </>
              )}
            </div>
            <p className="text-muted mb-0">
              {totalFeedbackCount > 0
                ? `Dựa trên ${totalFeedbackCount} đánh giá`
                : 'Chưa có đánh giá nào'
              }
            </p>
          </Card.Body>
        </Card>

        <Alert variant="warning">
          <Alert.Heading>Chưa đủ điều kiện gửi phản hồi</Alert.Heading>
          <p>
            Bạn cần hoàn thành ít nhất 85% khóa học để có thể gửi phản hồi.
          </p>
          <p className="mb-0">
            Tiến độ hiện tại: <strong>{completionPercentage.toFixed(1)}%</strong>
          </p>
        </Alert>

        {/* Show others' feedback even if not eligible */}
        {allFeedback.length > 0 && (
          <div className="all-feedback-section mt-4">
            <div className="d-flex justify-content-between align-items-center p-0">
              <h3>Phản hồi từ học viên khác</h3>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowAllFeedback(!showAllFeedback)}
              >
                <Icon src={Visibility} className="mr-1" />
                {showAllFeedback ? 'Ẩn' : `Xem tất cả (${totalFeedbackCount})`}
              </Button>
            </div>

            {showAllFeedback && (
              <>
              <div className="feedback-list">
                {allFeedback.map((feedback, index) => (
                  <Card key={index} className="feedback-item mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start px-2 py-1">
                        <div className="flex-grow-1 w-100">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <strong className="user-name">
                              {feedback.user_full_name || feedback.username}
                            </strong>
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                              {formatDate(feedback.created_at)}
                            </span>
                          </div>
                          {renderStars(feedback.rating)}
                          {/* {feedback.feedback_text && (
                            <p className="feedback-text mt-2">{feedback.feedback_text}</p>
                          )} */}
                        </div>
                        {feedback.feedback_text && (
                            <p className="feedback-text mt-1 mb-1">{feedback.feedback_text}</p>
                          )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              {/* Pagination */}
              {feedbackPagination && feedbackPagination.num_pages > 1 && (
                <div className="pagination-wrapper">
                  <Pagination
                    paginationLabel="Phân trang phản hồi"
                    pageCount={feedbackPagination.num_pages}
                    currentPage={currentPage}
                    onPageSelect={handlePageChange}
                    variant="reduced"
                    size="small"
                  />
                </div>
              )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Has submitted 5-star feedback - Don't show edit/delete buttons
  if (myFeedback && myFeedback.rating === 5) {
    return (
      <div className="course-feedback-tool">
        {/* Average Rating Display */}
        <Card className="average-rating-card mb-3">
          <Card.Body className="p-4">
            <h3 className="mb-2">Đánh giá khóa học</h3>
            <div className="d-flex mb-2">
              {averageRating !== null && totalFeedbackCount > 0 ? (
                <>
                  <span className="average-rating-number mb-0 mr-4">{averageRating.toFixed(1)}</span>
                  {renderStars(averageRating)}
                </>
              ) : (
                <>
                  <span className="average-rating-number mb-0 mr-4">--</span>
                  {renderStars(0)}
                </>
              )}
            </div>
            <p className="text-muted mb-0">
              {totalFeedbackCount > 0
                ? `Dựa trên ${totalFeedbackCount} đánh giá`
                : 'Chưa có đánh giá nào'
              }
            </p>
          </Card.Body>
        </Card>

        <Card className="my-feedback-card">
          <div className="card-header">
            <h3>Phản hồi của bạn</h3>
          </div>
          <Card.Body className="px-4">
            {renderStars(myFeedback.rating)}
            {myFeedback.feedback_text && (
              <p className="feedback-text mt-3">{myFeedback.feedback_text}</p>
            )}
            <p className="feedback-date text-muted">
              Gửi lúc: {formatDate(myFeedback.created_at)}
            </p>
          </Card.Body>
        </Card>

        <Alert variant="success" className="mt-3">
          <p className="mb-0">
            Cảm ơn bạn đã đánh giá 5 sao! Phản hồi của bạn rất có ý nghĩa với chúng tôi.
          </p>
        </Alert>

        
        {/* All Feedback Section */}
        {allFeedback.length > 0 && (
          <div className="all-feedback-section mt-4">
            <div className="d-flex justify-content-between align-items-center p-0">
              <h3>Phản hồi từ học viên khác</h3>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowAllFeedback(!showAllFeedback)}
              >
                <Icon src={Visibility} className="mr-1" />
                {showAllFeedback ? 'Ẩn' : `Xem tất cả (${totalFeedbackCount})`}
              </Button>
            </div>

            {showAllFeedback && (
              <>
              <div className="feedback-list">
                {allFeedback.map((feedback, index) => (
                  <Card key={index} className="feedback-item mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start px-3 py-2">
                        <div className="flex-grow-1 w-100">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <strong className="user-name">
                              {feedback.user_full_name || feedback.username}
                            </strong>
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                              {formatDate(feedback.created_at)}
                            </span>
                          </div>
                          {renderStars(feedback.rating)}
                          {/* {feedback.feedback_text && (
                            <p className="feedback-text mt-2">{feedback.feedback_text}</p>
                          )} */}
                        </div>
                        {feedback.feedback_text && (
                            <p className="feedback-text mt-2 mb-2">{feedback.feedback_text}</p>
                          )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                
              </div>
              {/* Pagination */}
              {feedbackPagination && feedbackPagination.num_pages > 1 && (
                <div className="pagination-wrapper">
                  <Pagination
                    paginationLabel="Phân trang phản hồi"
                    pageCount={feedbackPagination.num_pages}
                    currentPage={currentPage}
                    onPageSelect={handlePageChange}
                    variant="reduced"
                    size="small"
                  />
                </div>
              )}
              </>
            )}
          </div>
        )}
        
      </div>
    );
  }

  // Can submit or has submitted feedback (but not 5 stars)
  return (
    <div className="course-feedback-tool">
      {/* Average Rating Display */}
      <Card className="average-rating-card mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div className="w-100 p-4">
              <h3 className="mb-2">Đánh giá khóa học</h3>
              <div className="d-flex mb-2">
                {averageRating !== null && totalFeedbackCount > 0 ? (
                  <>
                    <span className="average-rating-number mb-0 mr-4">{averageRating.toFixed(1)}</span>
                    {renderStars(averageRating)}
                  </>
                ) : (
                  <>
                    <span className="average-rating-number mb-0 mr-4">--</span>
                    {renderStars(0)}
                  </>
                )}
              </div>
              <p className="text-muted mb-0">
                {totalFeedbackCount > 0 
                  ? `Dựa trên ${totalFeedbackCount} đánh giá`
                  : 'Chưa có đánh giá nào'
                }
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* My Feedback Section */}
      {myFeedback ? (
        <Card className="my-feedback-card">
          <div className="card-header">
            <h3>Phản hồi của bạn</h3>
          </div>
          <Card.Body className="px-4">
            {renderStars(myFeedback.rating)}
            {myFeedback.feedback_text && (
              <p className="feedback-text mt-3">{myFeedback.feedback_text}</p>
            )}
            <p className="feedback-date text-muted">
              Gửi lúc: {formatDate(myFeedback.created_at)}
            </p>
            <div className="feedback-actions mt-3 mb-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowFeedbackModal(true)}
              >
                <Icon src={Edit} className="mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="ml-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Icon src={Delete} className="mr-2" />
                Xóa
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="submit-feedback-card">
          <Card.Body className="p-3">
            <h3>Chia sẻ phản hồi của bạn</h3>
            <p>
              Bạn đã hoàn thành {completionPercentage.toFixed(1)}% khóa học. 
              Hãy chia sẻ trải nghiệm của bạn!
            </p>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                onClick={() => setShowFeedbackModal(true)}
              >
                Gửi phản hồi
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* All Feedback Section */}
      {allFeedback.length > 0 && (
        <div className="all-feedback-section mt-4">
          <div className="d-flex justify-content-between align-items-center p-0">
            <h3>Phản hồi từ học viên khác</h3>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAllFeedback(!showAllFeedback)}
            >
              <Icon src={Visibility} className="mr-1" />
              {showAllFeedback ? 'Ẩn' : `Xem tất cả (${totalFeedbackCount})`}
            </Button>
          </div>

          {showAllFeedback && (
            <>
              <div className="feedback-list">
                {allFeedback.map((feedback, index) => (
                  <Card key={index} className="feedback-item mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start px-3 py-2">
                          <div className="flex-grow-1 w-100">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <strong className="user-name">
                                {feedback.user_full_name || feedback.username}
                              </strong>
                              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {formatDate(feedback.created_at)}
                              </span>
                            </div>
                            {renderStars(feedback.rating)}
                            {/* {feedback.feedback_text && (
                              <p className="feedback-text mt-2">{feedback.feedback_text}</p>
                            )} */}
                          </div>
                          {feedback.feedback_text && (
                              <p className="feedback-text mt-2 mb-2">{feedback.feedback_text}</p>
                            )}
                        </div>
                      </Card.Body>
                    </Card>
                ))}
              </div>

              {/* Pagination */}
              {feedbackPagination && feedbackPagination.num_pages > 1 && (
                <div className="pagination-wrapper">
                  <Pagination
                    paginationLabel="Phân trang phản hồi"
                    pageCount={feedbackPagination.num_pages}
                    currentPage={currentPage}
                    onPageSelect={handlePageChange}
                    variant="reduced"
                    size="small"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <CourseFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        courseId={courseId}
        onSuccess={handleFeedbackSubmitted}
        existingFeedback={myFeedback}
      />

      <ModalDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        size="md"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Xác nhận xóa</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>Bạn có chắc chắn muốn xóa phản hồi này?</p>
          <p className="text-muted">Hành động này không thể hoàn tác.</p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            variant="tertiary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deletingFeedback}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteFeedback}
            disabled={deletingFeedback}
          >
            {deletingFeedback ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </ModalDialog.Footer>
      </ModalDialog>
    </div>
  );
};

export default CourseFeedback;
