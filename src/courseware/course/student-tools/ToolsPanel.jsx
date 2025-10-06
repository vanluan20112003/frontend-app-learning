import React, { useState, useRef, useEffect } from 'react';

import { Icon } from '@openedx/paragon';
import {
  Calculate,
  Notes,
  ChevronLeft,
  ChevronRight,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import ModernCalculator from './ModernCalculator';
import QuickNotes from './QuickNotes';
import messages from './messages';
import './ToolsPanel.scss';

const ToolsPanel = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('calculator');
  const [drawerWidth, setDrawerWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const drawerRef = useRef(null);

  const tools = [
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
  ];

  const handleToolClick = (toolId) => {
    if (activeTool === toolId && isOpen) {
      setIsOpen(false);
    } else {
      setActiveTool(toolId);
      setIsOpen(true);
    }
  };

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Resize functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) { return; }

      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth * 0.8;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
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
  }, [isResizing]);

  // Save drawer width and sidebar visibility to localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('tools-drawer-width');
    const savedVisible = localStorage.getItem('tools-sidebar-visible');
    if (savedWidth) {
      setDrawerWidth(parseInt(savedWidth, 10));
    }
    if (savedVisible !== null) {
      setIsSidebarVisible(savedVisible === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tools-drawer-width', drawerWidth.toString());
  }, [drawerWidth]);

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
            className={`tool-button ${activeTool === tool.id && isOpen ? 'active' : ''}`}
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
          style={{ width: `${drawerWidth}px` }}
        >
          {/* Resize handle */}
          <button
            type="button"
            className="resize-handle"
            onMouseDown={handleMouseDown}
            aria-label="Resize drawer"
          >
            {/* Resize handle */}
          </button>

          {/* Drawer header */}
          <div className="drawer-header">
            <div className="drawer-title">
              <Icon src={tools.find(t => t.id === activeTool)?.icon} className="mr-2" />
              {tools.find(t => t.id === activeTool)?.name}
            </div>
            <button
              type="button"
              className="close-button"
              onClick={handleToggleDrawer}
              title="Thu gọn"
            >
              <Icon src={ChevronRight} />
            </button>
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
