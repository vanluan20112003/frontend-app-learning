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
          background: white;
        }

        .sidebar-header {
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          border-radius: 0;
          border-bottom: 2px solid #e5e5e5;
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
          padding: 0.75rem 1rem;
        }

        .micro-unit-title {
          font-size: 0.95rem;
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
          padding: 0.75rem 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
          scroll-behavior: smooth;
          scroll-padding-top: 20px;
          background: #fafafa;
        }

        .unit-item {
          padding: 0.75rem 1rem;
          margin: 0.125rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: transparent;
          border: none;
          width: calc(100% - 1rem);
          text-align: left;
          position: relative;
        }

        .unit-item:hover {
          background: #f8fafc;
          transform: translateX(2px);
        }

        .unit-item.active {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 600;
        }

        .unit-item.active .unit-title {
          color: #1e40af;
          font-weight: 600;
        }

        .unit-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          color: #94a3b8;
        }

        .unit-item.active .unit-icon {
          color: #3b82f6;
        }

        .unit-item.completed .unit-icon {
          color: #10b981;
        }

        .unit-item.completed:not(.active) {
          background: #f0fdf4;
        }

        .unit-item.completed:not(.active) .unit-title {
          color: #059669;
        }

        .unit-content {
          flex: 1;
          min-width: 0;
        }

        .unit-title {
          font-size: 0.8125rem;
          font-weight: 500;
          margin: 0;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
        }

        /* Custom scrollbar - thanh mỏng, đẹp, hiện đại */
        .units-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }

        .units-list::-webkit-scrollbar {
          width: 5px;
        }

        .units-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .units-list::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        .units-list::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 768px) {
          .micro-unit-info {
            padding: 0.75rem;
          }

          .micro-unit-title {
            font-size: 0.875rem;
          }

          .units-list {
            padding: 0.5rem 0;
          }

          .unit-item {
            padding: 0.625rem 0.75rem;
            margin: 0.125rem 0.375rem;
          }

          .unit-title {
            font-size: 0.75rem;
          }

          .unit-icon {
            width: 16px;
            height: 16px;
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
