import React, { useState, useRef, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Tabs, Tab, Dropdown, Icon,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import SupportForm from './SupportForm';
import ContentReport from './ContentReport';
import messages from './messages';
import './SupportAndReportTabs.scss';

const SupportAndReportTabs = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('support'); // Default to "Hỗ trợ" tab
  const [useDropdownMode, setUseDropdownMode] = useState(false);
  const containerRef = useRef(null);

  // Define tabs
  const tabs = [
    {
      key: 'support',
      title: intl.formatMessage(messages.supportTitle),
      component: <SupportForm />,
    },
    {
      key: 'report',
      title: intl.formatMessage(messages.contentReportTitle),
      component: <ContentReport />,
    },
  ];

  // Check if we should use dropdown mode based on container width
  const checkWidth = useRef(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    
    // If container is narrow (< 400px), use dropdown mode
    // This threshold can be adjusted based on tab title lengths
    const shouldUseDropdown = containerWidth < 400;
    setUseDropdownMode(shouldUseDropdown);
  });

  useEffect(() => {
    // Update ref to always have latest function
    checkWidth.current();

    // Use ResizeObserver to detect container size changes in real-time
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          checkWidth.current();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        checkWidth.current();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Handle tab selection from dropdown
  const handleDropdownSelect = (tabKey) => {
    setActiveTab(tabKey);
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="support-report-tabs-container" ref={containerRef}>
      {useDropdownMode ? (
        // Compact view with dropdown for narrow screens
        <div className="tabs-dropdown-view">
          <div className="dropdown-header">
            <h5 className="active-tab-title">{activeTabData?.title}</h5>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="support-report-tabs-dropdown" className="dropdown-toggle-custom">
                <Icon src={MoreVert} className="dropdown-icon" />
                <span className="dropdown-label">Thêm...</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {tabs.map(tab => (
                  <Dropdown.Item
                    key={tab.key}
                    onClick={() => handleDropdownSelect(tab.key)}
                    active={activeTab === tab.key}
                  >
                    {tab.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          {/* Display active tab content */}
          <div className="tab-content-dropdown">
            <div className="active-tab-body">
              {activeTabData?.component}
            </div>
          </div>
        </div>
      ) : (
        // Full tabs view for wider screens
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          variant="tabs"
          className="support-report-tabs"
        >
          {tabs.map(tab => (
            <Tab key={tab.key} eventKey={tab.key} title={tab.title}>
              <div className="tab-content-wrapper">
                {tab.component}
              </div>
            </Tab>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default SupportAndReportTabs;
