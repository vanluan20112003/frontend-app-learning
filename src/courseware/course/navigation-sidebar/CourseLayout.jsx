import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CourseNavigationSidebar from './CourseNavigationSidebar';

const CourseLayout = ({
  courseId,
  currentSequenceId,
  currentSectionId,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('courseNavSidebarCollapsed');
    return saved === 'true';
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('courseNavSidebarCollapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="course-layout-container">
      <style jsx>{`
        .course-layout-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
          position: relative;
        }

        .course-content-area {
          flex: 1;
          min-width: 0; /* Allows flex item to shrink below content size */
          padding: 1.5rem;
          background: #fff;
          transition: margin-left 0.3s ease;
        }

        @media (max-width: 768px) {
          .course-content-area {
            padding: 1rem;
            width: 100%;
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
          }

          .sidebar-overlay.active {
            display: block;
          }
        }

        @media (min-width: 769px) {
          .course-content-area {
            max-width: calc(100% - 60px); /* Account for collapsed sidebar */
          }
        }
      `}
      </style>

      <CourseNavigationSidebar
        courseId={courseId}
        currentSequenceId={currentSequenceId}
        currentSectionId={currentSectionId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Overlay for mobile when sidebar is open */}
      <button
        type="button"
        aria-label="Close sidebar"
        className={`sidebar-overlay ${!isSidebarCollapsed ? 'active' : ''}`}
        onClick={handleToggleSidebar}
      />

      <div className="course-content-area">
        {children}
      </div>
    </div>
  );
};

CourseLayout.propTypes = {
  courseId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
  currentSectionId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CourseLayout.defaultProps = {
  currentSequenceId: null,
  currentSectionId: null,
};

export default CourseLayout;
