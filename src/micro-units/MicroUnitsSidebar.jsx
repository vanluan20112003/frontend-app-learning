import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@openedx/paragon';
import {
  CheckCircle, Circle, PlayCircle, School,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

const MicroUnitsSidebar = ({
  courseId, microUnitId, units, currentUnitId, microUnitDetail,
}) => {
  const navigate = useNavigate();
  const activeItemRef = useRef(null);
  const listRef = useRef(null);

  const handleUnitClick = (unitId) => {
    // Keep microUnitId in the URL when navigating between units
    if (microUnitId) {
      navigate(`/micro-units/${courseId}/${microUnitId}/${encodeURIComponent(unitId)}`);
    } else {
      // Fallback for old behavior (when accessing without microUnitId)
      navigate(`/micro-units/${courseId}/${encodeURIComponent(unitId)}`);
    }
  };

  // Get thumbnail URL with priority: thumbnail > thumbnail_url > thumbnailDisplay
  const getThumbnailUrl = () => {
    if (!microUnitDetail) { return null; }

    const baseUrl = getConfig().LMS_BASE_URL;

    // Priority 1: thumbnail (if it's a file upload)
    if (microUnitDetail.thumbnail) {
      if (microUnitDetail.thumbnail.startsWith('/')) {
        return `${baseUrl}${microUnitDetail.thumbnail}`;
      }
      return microUnitDetail.thumbnail;
    }

    // Priority 2: thumbnailUrl
    if (microUnitDetail.thumbnailUrl) {
      if (microUnitDetail.thumbnailUrl.startsWith('/')) {
        return `${baseUrl}${microUnitDetail.thumbnailUrl}`;
      }
      return microUnitDetail.thumbnailUrl;
    }

    // Priority 3: thumbnailDisplay (fallback)
    if (microUnitDetail.thumbnailDisplay) {
      if (microUnitDetail.thumbnailDisplay.startsWith('/')) {
        return `${baseUrl}${microUnitDetail.thumbnailDisplay}`;
      }
      return microUnitDetail.thumbnailDisplay;
    }

    return null;
  };

  const renderIcon = (unit) => {
    if (unit.complete) {
      return <Icon src={CheckCircle} className="text-success" />;
    }
    if (unit.id === currentUnitId) {
      return <Icon src={PlayCircle} className="text-primary" />;
    }
    return <Icon src={Circle} className="text-muted" />;
  };

  // Auto-scroll to active unit when currentUnitId changes
  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      const listContainer = listRef.current;
      const activeItem = activeItemRef.current;

      // Get positions
      const containerRect = listContainer.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // Calculate if item is visible
      const isVisible = (
        itemRect.top >= containerRect.top
        && itemRect.bottom <= containerRect.bottom
      );

      if (!isVisible) {
        // Scroll to center the active item
        const scrollTop = activeItem.offsetTop
          - listContainer.offsetTop
          - (listContainer.clientHeight / 2)
          + (activeItem.clientHeight / 2);

        listContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [currentUnitId]);

  return (
    <div className="micro-units-sidebar">
      <style jsx>{`
        .micro-units-sidebar {
          padding: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .sidebar-header {
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          border-radius: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
          flex-shrink: 0;
        }

        .micro-unit-header {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .micro-unit-thumbnail {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .micro-unit-thumbnail-placeholder {
          width: 100%;
          height: 120px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .micro-unit-thumbnail-placeholder .pgn__icon {
          width: 48px;
          height: 48px;
          opacity: 0.4;
        }

        .micro-unit-info {
          padding: 0.75rem 0.875rem;
        }

        .micro-unit-title {
          font-size: 0.875rem;
          font-weight: 700;
          margin: 0 0 0.375rem 0;
          line-height: 1.3;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .micro-unit-description {
          font-size: 0.6875rem;
          line-height: 1.4;
          opacity: 0.85;
          margin: 0 0 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .micro-unit-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.625rem;
          opacity: 0.9;
          flex-wrap: wrap;
        }

        .micro-unit-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .sidebar-header h2 {
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.2px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header .units-count {
          font-size: 0.625rem;
          opacity: 0.9;
          margin-top: 0.25rem;
          font-weight: 400;
        }

        .units-list {
          list-style: none;
          padding: 0.375rem 0.5rem;
          margin: 0;
          overflow-y: auto;
          flex: 1;
          scroll-behavior: smooth;
          scroll-padding-top: 20px;
        }

        .unit-item {
          padding: 0.4rem 0.5rem;
          margin-bottom: 0.15rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8f9fa;
          border: 1.5px solid transparent;
          width: 100%;
          text-align: left;
          position: relative;
        }

        .unit-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: transparent;
          border-radius: 8px 0 0 8px;
          transition: all 0.15s;
        }

        .unit-item:hover {
          background: linear-gradient(to right, #f0f4ff 0%, #faf5ff 100%);
          border-color: rgba(102, 126, 234, 0.25);
          transform: translateX(3px);
          box-shadow: 0 1px 4px rgba(102, 126, 234, 0.1);
        }

        .unit-item:hover::before {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .unit-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          transform: translateX(4px);
          position: relative;
        }

        .unit-item.active::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid rgba(102, 126, 234, 0.4);
          border-radius: 8px;
          pointer-events: none;
        }

        .unit-item.active::before {
          background: rgba(255, 255, 255, 0.9);
          width: 3px;
        }

        .unit-item.active .unit-title {
          color: white;
          font-weight: 500;
        }

        .unit-item.active .unit-icon {
          color: white;
        }

        .unit-icon {
          flex-shrink: 0;
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
        }

        .unit-item.completed .unit-icon {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-radius: 50%;
          padding: 2px;
          animation: completePulse 0.5s ease-out;
        }

        @keyframes completePulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .unit-item.graded .unit-icon {
          background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
          border-radius: 50%;
          padding: 2px;
        }

        .unit-item.active.completed .unit-icon,
        .unit-item.active.graded .unit-icon {
          background: rgba(255, 255, 255, 0.25);
        }

        .unit-content {
          flex: 1;
          min-width: 0;
        }

        .unit-title {
          font-size: 0.75rem;
          font-weight: 500;
          margin: 0;
          color: #1a1a1a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
        }

        /* Custom scrollbar */
        .units-list::-webkit-scrollbar {
          width: 6px;
        }

        .units-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .units-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
        }

        .units-list::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
        }

        @media (max-width: 768px) {
          .sidebar-header {
            padding: 0.875rem 0.75rem;
          }

          .sidebar-header h2 {
            font-size: 0.875rem;
          }

          .units-list {
            padding: 0.375rem;
          }

          .unit-item {
            padding: 0.5rem 0.625rem;
            margin-bottom: 0.25rem;
          }

          .unit-title {
            font-size: 0.7rem;
          }

          .unit-icon {
            font-size: 0.875rem;
            width: 18px;
            height: 18px;
          }
        }
      `}
      </style>

      <div className="sidebar-header">
        {microUnitDetail ? (
          <div className="micro-unit-header">
            {getThumbnailUrl() ? (
              <img
                src={getThumbnailUrl()}
                alt={microUnitDetail.title}
                className="micro-unit-thumbnail"
              />
            ) : (
              <div className="micro-unit-thumbnail-placeholder">
                <Icon src={School} />
              </div>
            )}
            <div className="micro-unit-info">
              <h2 className="micro-unit-title">{microUnitDetail.title}</h2>
              {microUnitDetail.description && (
                <p className="micro-unit-description">{microUnitDetail.description}</p>
              )}
              <div className="micro-unit-meta">
                <span className="units-count">{units.length} bài học</span>
                {microUnitDetail.estimatedDuration && (
                  <span className="micro-unit-badge">
                    {microUnitDetail.estimatedDuration} phút
                  </span>
                )}
                {microUnitDetail.difficultyLevel && (
                  <span className="micro-unit-badge">
                    {microUnitDetail.difficultyLevel === 'easy' && 'Dễ'}
                    {microUnitDetail.difficultyLevel === 'medium' && 'TB'}
                    {microUnitDetail.difficultyLevel === 'hard' && 'Khó'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="micro-unit-info">
              <h2>Danh sách bài học</h2>
              <div className="units-count">
                {units.length} bài học khả dụng
              </div>
            </div>
          </>
        )}
      </div>

      <ul className="units-list" ref={listRef}>
        {units.map((unit) => {
          const isActive = unit.id === currentUnitId;
          const itemClasses = [
            'unit-item',
            isActive && 'active',
            unit.complete && 'completed',
            unit.graded && 'graded',
          ].filter(Boolean).join(' ');

          return (
            <button
              type="button"
              key={unit.id}
              className={itemClasses}
              onClick={() => handleUnitClick(unit.id)}
              ref={isActive ? activeItemRef : null}
            >
              <div className="unit-icon">
                {renderIcon(unit)}
              </div>
              <div className="unit-content">
                <h3 className="unit-title">{unit.displayName}</h3>
              </div>
            </button>
          );
        })}
      </ul>
    </div>
  );
};

MicroUnitsSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  microUnitId: PropTypes.string,
  units: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    complete: PropTypes.bool,
    graded: PropTypes.bool,
    format: PropTypes.string,
  })).isRequired,
  currentUnitId: PropTypes.string,
  microUnitDetail: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    thumbnailDisplay: PropTypes.string,
    estimatedDuration: PropTypes.number,
    difficultyLevel: PropTypes.string,
    order: PropTypes.number,
    isActive: PropTypes.bool,
    totalBlocks: PropTypes.number,
  }),
};

MicroUnitsSidebar.defaultProps = {
  microUnitId: null,
  currentUnitId: null,
  microUnitDetail: null,
};

export default MicroUnitsSidebar;
