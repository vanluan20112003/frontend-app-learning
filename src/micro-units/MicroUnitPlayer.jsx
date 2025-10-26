import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Spinner, Icon } from '@openedx/paragon';
import { ArrowBack, ArrowForward } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { fetchMicroUnits, fetchMicroUnitBlocks } from './data/thunks';
import { markUnitComplete } from './data/slice';

const MicroUnitPlayer = ({
  courseId,
  microUnitId,
  unitId,
  unit,
  allUnits,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Find current unit index
  const currentIndex = allUnits.findIndex((u) => u.id === unitId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allUnits.length - 1;
  const previousUnit = hasPrevious ? allUnits[currentIndex - 1] : null;
  const nextUnit = hasNext ? allUnits[currentIndex + 1] : null;

  useEffect(() => {
    if (unitId && courseId) {
      // Build the iframe URL for the unit
      // Using the jump_to URL pattern from the micro_unit API response
      const url = `${getConfig().LMS_BASE_URL}/xblock/${unitId}`;
      setIframeUrl(url);
    }
  }, [unitId, courseId]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Auto-mark completion after 5 seconds of viewing the unit
  // BUT: Do NOT auto-complete graded units or units with scores
  useEffect(() => {
    if (!unitId || unit?.complete) {
      return undefined;
    }

    // Skip auto-completion for graded units or units with scores
    // These should only be marked complete when user actually completes them
    if (unit?.graded || unit?.hasScore) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      // Mark as complete locally first
      dispatch(markUnitComplete({ unitId }));

      // Refresh data from server to sync completion status
      // This will get the updated completion from the course units API
      if (microUnitId && courseId) {
        setTimeout(() => {
          dispatch(fetchMicroUnitBlocks(microUnitId, courseId));
        }, 1000); // Refresh after 1 second to give server time to process
      }
    }, 5000); // Mark complete after 5 seconds

    return () => clearTimeout(timer);
  }, [unitId, unit?.complete, unit?.graded, unit?.hasScore, microUnitId, courseId, dispatch]);

  const handlePrevious = () => {
    if (previousUnit) {
      const url = microUnitId
        ? `/micro-units/${courseId}/${microUnitId}/${encodeURIComponent(previousUnit.id)}`
        : `/micro-units/${courseId}/${encodeURIComponent(previousUnit.id)}`;
      navigate(url);
      setIsLoading(true);
      if (onNavigate) {
        onNavigate(previousUnit.id);
      }
    }
  };

  const handleNext = () => {
    if (nextUnit) {
      const url = microUnitId
        ? `/micro-units/${courseId}/${microUnitId}/${encodeURIComponent(nextUnit.id)}`
        : `/micro-units/${courseId}/${encodeURIComponent(nextUnit.id)}`;
      navigate(url);
      setIsLoading(true);
      if (onNavigate) {
        onNavigate(nextUnit.id);
      }
    }
  };

  // Handle completion events from iframe
  const handleCompletionEvent = useCallback(() => {
    // Refresh micro units data to get updated completion status
    if (courseId) {
      dispatch(fetchMicroUnits(courseId));
    }
  }, [courseId, dispatch]);

  // Listen for events from iframe (completion, progress, etc.)
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from LMS domain
      if (!event.origin.includes(getConfig().LMS_BASE_URL.replace(/^https?:\/\//, ''))) {
        return;
      }

      const { data } = event;

      // Check for completion event
      if (data.event_name) {
        // Events like: completion, progress.completion, etc.
        if (data.event_name.includes('completion')) {
          handleCompletionEvent(data);
        }

        // Also handle POST_EVENT which might contain completion data
        if (data.event_name === 'POST_EVENT') {
          handleCompletionEvent(data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleCompletionEvent]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is not typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft' && hasPrevious && previousUnit) {
        const url = microUnitId
          ? `/micro-units/${courseId}/${microUnitId}/${encodeURIComponent(previousUnit.id)}`
          : `/micro-units/${courseId}/${encodeURIComponent(previousUnit.id)}`;
        navigate(url);
        setIsLoading(true);
      } else if (e.key === 'ArrowRight' && hasNext && nextUnit) {
        const url = microUnitId
          ? `/micro-units/${courseId}/${microUnitId}/${encodeURIComponent(nextUnit.id)}`
          : `/micro-units/${courseId}/${encodeURIComponent(nextUnit.id)}`;
        navigate(url);
        setIsLoading(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasPrevious, hasNext, previousUnit, nextUnit, navigate, courseId]);

  return (
    <>
      <div className="micro-unit-player">
        <style jsx>{`
        .micro-unit-player {
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .unit-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(to right, #f8f9fa 0%, #ffffff 100%);
          border-bottom: 3px solid #667eea;
          margin-bottom: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .unit-header-content {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1.5rem;
        }

        .unit-info {
          flex: 1;
          min-width: 0;
        }

        .unit-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .unit-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          font-size: 0.9375rem;
        }

        .navigation-controls {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
        }

        .nav-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nav-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: #ccc;
          color: #999;
        }

        .nav-button-label {
          display: none;
        }

        @media (min-width: 768px) {
          .nav-button-label {
            display: inline;
          }
        }

        .unit-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          border-radius: 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .badge-graded {
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          color: white;
        }

        .badge-complete {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }

        .unit-format {
          color: #667eea;
          font-weight: 600;
          padding: 0.375rem 0.875rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 16px;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          min-height: 400px;
        }

        .loading-content {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .loading-content h4 {
          color: #667eea;
          margin-top: 1rem;
          font-weight: 600;
        }

        .loading-content p {
          color: #6c757d;
          margin-top: 0.5rem;
        }

        .iframe-container {
          width: 100%;
          flex: 1;
          position: relative;
          background: white;
          min-height: 600px;
        }

        .unit-iframe {
          width: 100%;
          height: 100%;
          min-height: 600px;
          border: none;
          display: block;
        }

        @media (max-width: 768px) {
          .unit-header {
            padding: 1rem;
          }

          .unit-header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .unit-title {
            font-size: 1.25rem;
          }

          .unit-meta {
            font-size: 0.875rem;
          }

          .navigation-controls {
            width: 100%;
            justify-content: space-between;
          }

          .nav-button {
            flex: 1;
            justify-content: center;
          }

          .loading-content {
            padding: 2rem 1.5rem;
          }

          .iframe-container {
            min-height: 500px;
          }

          .unit-iframe {
            min-height: 500px;
          }
        }
      `}
        </style>

        {unit && (
        <div className="unit-header">
          <div className="unit-header-content">
            <div className="unit-info">
              <h1 className="unit-title">{unit.displayName || 'Loading...'}</h1>
              <div className="unit-meta">
                {unit.graded && (
                  <span className="unit-badge badge-graded">
                    Bài kiểm tra
                  </span>
                )}
                {unit.complete && (
                  <span className="unit-badge badge-complete">
                    Đã hoàn thành
                  </span>
                )}
                {unit.format && (
                  <span className="unit-format">
                    {unit.format}
                  </span>
                )}
              </div>
            </div>
            <div className="navigation-controls">
              <button
                type="button"
                className="nav-button"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                title={previousUnit ? previousUnit.displayName : 'Không có bài trước'}
              >
                <Icon src={ArrowBack} />
                <span className="nav-button-label">Trước</span>
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={handleNext}
                disabled={!hasNext}
                title={nextUnit ? nextUnit.displayName : 'Không có bài sau'}
              >
                <span className="nav-button-label">Tiếp</span>
                <Icon src={ArrowForward} />
              </button>
            </div>
          </div>
        </div>
        )}

        <div className="iframe-container">
          {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Spinner
                animation="border"
                variant="primary"
                className="mb-3"
                style={{
                  width: '3rem',
                  height: '3rem',
                }}
              />
              <h4>Đang tải nội dung bài học...</h4>
              <p className="text-muted">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
          )}

          {iframeUrl && (
          <iframe
            id="unit-iframe"
            className="unit-iframe"
            src={iframeUrl}
            title={unit?.displayName || 'Unit Content'}
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          )}
        </div>
      </div>
    </>
  );
};

MicroUnitPlayer.propTypes = {
  courseId: PropTypes.string.isRequired,
  microUnitId: PropTypes.string,
  unitId: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    type: PropTypes.string,
    graded: PropTypes.bool,
    format: PropTypes.string,
    complete: PropTypes.bool,
    hasScore: PropTypes.bool,
  }),
  allUnits: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
  })),
  onNavigate: PropTypes.func,
};

MicroUnitPlayer.defaultProps = {
  microUnitId: null,
  unit: null,
  allUnits: [],
  onNavigate: null,
};

export default MicroUnitPlayer;
