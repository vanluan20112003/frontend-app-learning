import React, {
  useState, useEffect, createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import CourseNavigationSidebar from './CourseNavigationSidebar';

// Context to share tools drawer state
export const ToolsDrawerContext = createContext({
  isDrawerOpen: false,
  drawerWidth: 0,
  setIsDrawerOpen: () => {},
  setDrawerWidth: () => {},
});

export const useToolsDrawer = () => useContext(ToolsDrawerContext);

const CourseLayout = ({
  courseId,
  currentSequenceId,
  currentSectionId,
  currentUnitId,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('courseNavSidebarCollapsed');
    return saved === 'true';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('courseNavSidebarCollapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const toolsDrawerContext = useMemo(() => ({
    isDrawerOpen,
    drawerWidth,
    setIsDrawerOpen,
    setDrawerWidth,
  }), [isDrawerOpen, drawerWidth]);

  return (
    <ToolsDrawerContext.Provider value={toolsDrawerContext}>
      <div className="course-layout-container">
        <style jsx>{`
          .course-layout-container {
            display: flex;
            width: 100%;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }

          .course-content-area {
            flex: 1;
            min-width: 0; /* Allows flex item to shrink below content size */
            padding: 1.5rem;
            background: #fff;
            transition: margin-left 0.3s ease, margin-right 0.3s ease;
            margin-left: ${isSidebarCollapsed ? '60px' : '320px'};
            margin-right: ${isDrawerOpen ? `${drawerWidth}px` : '0'};
          }

          @media (max-width: 768px) {
            .course-content-area {
              padding: 1rem;
              width: 100%;
              margin-left: 0 !important; /* No push on mobile, sidebar is overlay */
              margin-right: 0 !important; /* No push on mobile, use overlay instead */
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
          currentUnitId={currentUnitId}
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
    </ToolsDrawerContext.Provider>
  );
};

CourseLayout.propTypes = {
  courseId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
  currentSectionId: PropTypes.string,
  currentUnitId: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CourseLayout.defaultProps = {
  currentSequenceId: null,
  currentSectionId: null,
  currentUnitId: null,
};

export default CourseLayout;
