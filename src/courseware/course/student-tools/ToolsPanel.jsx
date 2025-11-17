import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Icon } from '@openedx/paragon';
import {
  Calculate,
  Notes,
  ChevronLeft,
  ChevronRight,
  Help,
  Report,
  ShowChart,
  Fullscreen,
  FullscreenExit,
  School,
  RateReview,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToolsDrawer } from '../navigation-sidebar';
import ModernCalculator from './ModernCalculator';
import QuickNotes from './QuickNotes';
import SupportForm from './SupportForm';
import ContentReport from './ContentReport';
import VideoProgressTool from './VideoProgressTool';
import MicroUnitsList from './MicroUnitsList';
import CourseFeedback from './CourseFeedback';
import messages from './messages';
import './ToolsPanel.scss';

const ToolsPanel = () => {
  const intl = useIntl();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('calculator');
  const [localDrawerWidth, setLocalDrawerWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(400);
  const drawerRef = useRef(null);

  // Use context to communicate with CourseLayout
  const { setIsDrawerOpen, setDrawerWidth } = useToolsDrawer();

  // Check if we're on micro-units page
  const isOnMicroUnitsPage = location.pathname.includes('/micro-units/');

  const allTools = [
    {
      id: 'video-progress',
      name: intl.formatMessage(messages.videoProgressTitle),
      icon: ShowChart,
      component: VideoProgressTool,
      shake: true, // Hiệu ứng rung lắc
    },
    {
      id: 'calculator',
      name: intl.formatMessage(messages.calculatorTitle),
      icon: Calculate,
      component: ModernCalculator,
    },
    {
      id: 'notes',
      name: intl.formatMessage(messages.notesTitle),
      icon: Notes,
      component: QuickNotes,
    },
    {
      id: 'feedback',
      name: intl.formatMessage(messages.feedbackTitle),
      icon: RateReview,
      component: CourseFeedback,
    },
    {
      id: 'support',
      name: intl.formatMessage(messages.supportTitle),
      icon: Help,
      component: SupportForm,
    },
    {
      id: 'content-report',
      name: intl.formatMessage(messages.contentReportTitle),
      icon: Report,
      component: ContentReport,
    },
    {
      id: 'micro-units',
      name: intl.formatMessage(messages.microUnitsTitle),
      icon: School,
      component: MicroUnitsList,
      showOnlyInCourseware: true, // Only show in normal courseware, not in micro-units page
    },
  ];

  // Filter tools based on current page
  const tools = allTools.filter(tool => {
    if (tool.showOnlyInCourseware && isOnMicroUnitsPage) {
      return false;
    }
    return true;
  });

  const handleToolClick = (toolId) => {
    if (activeTool === toolId && isOpen) {
      setIsOpen(false);
      setIsDrawerOpen(false);
    } else {
      setActiveTool(toolId);
      setIsOpen(true);
      setIsDrawerOpen(true);
      
      // Clamp width to max 500 for feedback tool
      if (toolId === 'feedback') {
        if (localDrawerWidth > 450) {
          // If current width exceeds 400px, clamp it to 400px
          setLocalDrawerWidth(450);
          setDrawerWidth(450);
          setIsMaximized(false);
        }
      }
    }
  };

  const handleToggleDrawer = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    setIsDrawerOpen(newOpenState);
  };

  // Sync drawer state with context
  useEffect(() => {
    setIsDrawerOpen(isOpen);
    if (isOpen) {
      setDrawerWidth(localDrawerWidth);
    }
  }, [isOpen, localDrawerWidth, setIsDrawerOpen, setDrawerWidth]);

  // Maximize/Restore functionality
  const handleToggleMaximize = () => {
    if (isMaximized) {
      // Restore to saved width
      setLocalDrawerWidth(previousWidth);
      setDrawerWidth(previousWidth);
      setIsMaximized(false);
    } else {
      // Maximize based on active tool
      setPreviousWidth(localDrawerWidth);
      let maxWidth;
      
      if (activeTool === 'feedback') {
        // Feedback tool limited to 400px max
        maxWidth = 450;
      } else {
        // Other tools can use 80% of window width
        maxWidth = Math.floor(window.innerWidth * 0.8);
      }
      
      setLocalDrawerWidth(maxWidth);
      setDrawerWidth(maxWidth);
      setIsMaximized(true);
    }
  };

  // Resize functionality - Click to toggle between preset sizes
  const handleResizeClick = () => {
    // Different preset sizes based on active tool
    const presetSizes = activeTool === 'feedback' 
      ? [300, 350, 400, 450] // Limited sizes for feedback
      : [300, 400, 500, 600, 700]; // Full range for other tools
    

      //  const presetSizes = [300, 400, 500, 600, 700];
    const currentIndex = presetSizes.findIndex(size => Math.abs(size - localDrawerWidth) < 50);
    const nextIndex = (currentIndex + 1) % presetSizes.length;
    const newWidth = presetSizes[nextIndex];

    setLocalDrawerWidth(newWidth);
    setDrawerWidth(newWidth);
    setIsMaximized(false);
  };

  // Mouse drag resize (optional, for users who prefer dragging)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) { return; }

      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      
      // Limit max width to 400px for feedback tool, otherwise 80% of window
      const maxWidth = activeTool === 'feedback' 
        ? 450 
        : window.innerWidth * 0.8;
      // const maxWidth = window.innerWidth * 0.8;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setLocalDrawerWidth(newWidth);
        setDrawerWidth(newWidth);
        setIsMaximized(false); // Exit maximized mode when manually resizing
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, activeTool, setDrawerWidth]);

  // Save drawer width and sidebar visibility to localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('tools-drawer-width');
    const savedVisible = localStorage.getItem('tools-sidebar-visible');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      setLocalDrawerWidth(width);
      setDrawerWidth(width);
    }
    if (savedVisible !== null) {
      setIsSidebarVisible(savedVisible === 'true');
    }
  }, [setDrawerWidth]);

  useEffect(() => {
    localStorage.setItem('tools-drawer-width', localDrawerWidth.toString());
  }, [localDrawerWidth]);

  useEffect(() => {
    localStorage.setItem('tools-sidebar-visible', isSidebarVisible.toString());
  }, [isSidebarVisible]);

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    if (isOpen && !isSidebarVisible) {
      setIsOpen(false);
    }
  };

  const ActiveComponent = tools.find(tool => tool.id === activeTool)?.component;

  return (
    <>
      {/* Toggle Sidebar Button */}
      <button
        type="button"
        className={`sidebar-toggle-btn ${!isSidebarVisible ? 'sidebar-hidden' : ''}`}
        onClick={handleToggleSidebar}
        title={isSidebarVisible ? 'Ẩn công cụ' : 'Hiện công cụ'}
      >
        <Icon src={isSidebarVisible ? ChevronRight : ChevronLeft} />
      </button>

      {/* Tools Sidebar Button */}
      <div className={`tools-sidebar ${isOpen ? 'drawer-open' : ''} ${!isSidebarVisible ? 'hidden' : ''}`}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`tool-button ${activeTool === tool.id && isOpen ? 'active' : ''} ${tool.shake ? 'shake-button' : ''}`}
            onClick={() => handleToolClick(tool.id)}
            title={tool.name}
          >
            <Icon src={tool.icon} className="tool-icon" />
            <span className="tool-name">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="tools-drawer"
          style={{ width: `${localDrawerWidth}px` }}
        >
          {/* Resize handle - supports both click and drag */}
          <button
            type="button"
            className={`resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={handleMouseDown}
            onClick={() => {
              // Only trigger click if not dragging
              if (!isResizing) {
                handleResizeClick();
              }
            }}
            title="Click để thay đổi kích thước, hoặc kéo để tùy chỉnh"
            aria-label="Resize drawer"
          >
            <span className="resize-indicator">⋮⋮</span>
          </button>

          {/* Minimal header with only action buttons */}
          <div className="drawer-header-minimal">
            <div className="header-actions">
              <button
                type="button"
                className="action-button maximize-button"
                onClick={handleToggleMaximize}
                title={isMaximized ? 'Thu nhỏ' : 'Phóng to'}
              >
                <Icon src={isMaximized ? FullscreenExit : Fullscreen} />
              </button>
              <button
                type="button"
                className="action-button close-button"
                onClick={handleToggleDrawer}
                title="Thu gọn"
              >
                <Icon src={ChevronRight} />
              </button>
            </div>
          </div>

          {/* Drawer content */}
          <div className="drawer-content">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <button
          type="button"
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
          aria-label="Close drawer"
        >
          {/* Empty button for overlay */}
        </button>
      )}
    </>
  );
};

export default ToolsPanel;
