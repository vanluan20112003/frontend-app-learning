import React, { useState } from 'react';

import {
  Icon,
  IconButton,
  ModalDialog,
  ActionRow,
  Tab,
  Tabs,
} from '@openedx/paragon';
import {
  Close,
  Calculate,
  Build,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import SimpleCalculator from './SimpleCalculator';
import messages from './messages';
import './StudentToolsDrawer.scss';

const StudentToolsDrawer = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const tools = [
    {
      key: 'calculator',
      title: intl.formatMessage(messages.calculatorTitle),
      icon: Calculate,
      component: <SimpleCalculator />,
    },
    // Có thể thêm các công cụ khác sau
    // {
    //   key: 'notes',
    //   title: 'Ghi chú',
    //   icon: Notes,
    //   component: <NotesComponent />,
    // },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="student-tools-fab">
        <IconButton
          src={Build}
          iconAs={Icon}
          alt={intl.formatMessage(messages.toolsButtonAlt)}
          onClick={handleToggleDrawer}
          variant="primary"
          size="lg"
          className="fab-button"
        />
      </div>

      {/* Drawer using ModalDialog */}
      <ModalDialog
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        size="lg"
        hasCloseButton={false}
        isFullscreenOnMobile
        className="student-tools-drawer"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.toolsDrawerTitle)}
          </ModalDialog.Title>
          <ActionRow>
            <IconButton
              src={Close}
              iconAs={Icon}
              alt={intl.formatMessage(messages.closeDrawer)}
              onClick={handleCloseDrawer}
              variant="tertiary"
            />
          </ActionRow>
        </ModalDialog.Header>

        <ModalDialog.Body className="student-tools-drawer-body">
          {tools.length === 1 ? (
            // Nếu chỉ có 1 công cụ, hiển thị trực tiếp
            <div className="tool-content">
              {tools[0].component}
            </div>
          ) : (
            // Nếu có nhiều công cụ, hiển thị dưới dạng tabs
            <Tabs
              variant="tabs"
              activeKey={activeTab}
              onSelect={setActiveTab}
              className="student-tools-tabs"
            >
              {tools.map((tool) => (
                <Tab
                  key={tool.key}
                  eventKey={tool.key}
                  title={(
                    <span className="d-flex align-items-center">
                      <Icon src={tool.icon} className="mr-2" />
                      {tool.title}
                    </span>
                  )}
                >
                  <div className="tool-content mt-3">
                    {tool.component}
                  </div>
                </Tab>
              ))}
            </Tabs>
          )}
        </ModalDialog.Body>
      </ModalDialog>
    </>
  );
};

export default StudentToolsDrawer;
