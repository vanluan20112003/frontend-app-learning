import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { Button, Icon } from '@openedx/paragon';
import { ArrowBack, School } from '@openedx/paragon/icons';

import { useModel } from '@src/generic/model-store';
import { getMicroUnits, getMicroUnitsStatus, getMicroUnitDetail } from './data/selectors';
import { AlertList } from '../generic/user-messages';
import MicroUnitsSidebar from './MicroUnitsSidebar';
import MicroUnitPlayer from './MicroUnitPlayer';
import { ToolsPanel } from '../courseware/course/student-tools';
import { ToolsDrawerContext } from '../courseware/course/navigation-sidebar';

const MicroUnitsCourse = ({ courseId, microUnitId, unitId }) => {
  const navigate = useNavigate();
  const course = useModel('coursewareMeta', courseId);
  const units = useSelector(getMicroUnits) || [];
  const status = useSelector(getMicroUnitsStatus);
  const microUnitDetail = useSelector(getMicroUnitDetail);
  const selectedUnit = units.find(unit => unit.id === unitId);

  // Tools drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);

  const toolsDrawerContext = useMemo(() => ({
    isDrawerOpen,
    drawerWidth,
    setIsDrawerOpen,
    setDrawerWidth,
  }), [isDrawerOpen, drawerWidth]);

  const pageTitleBreadCrumbs = [
    selectedUnit ? selectedUnit.displayName : 'Micro Units',
    course ? course.title : '',
  ].filter(element => element != null);

  const handleBackToLearning = () => {
    // Navigate back to the regular courseware using jump_to URL
    // This will automatically resolve to the correct sequential/vertical path
    if (selectedUnit) {
      // Use the LMS jump_to endpoint which handles the URL resolution
      window.location.href = `${getConfig().LMS_BASE_URL}/courses/${courseId}/jump_to/${selectedUnit.id}`;
    } else {
      // If no unit selected, go to course home
      navigate(`/course/${courseId}`);
    }
  };

  return (
    <ToolsDrawerContext.Provider value={toolsDrawerContext}>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>

      <div className="micro-units-course">
        <style jsx>{`
          .micro-units-course {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 200px);
            background: #f5f7fa;
            position: relative;
          }

          .micro-units-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .banner-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .banner-icon {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.75rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .banner-text h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .banner-text p {
            margin: 0.25rem 0 0 0;
            font-size: 0.875rem;
            opacity: 0.95;
          }

          .banner-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
          }

          .back-button {
            background: white;
            color: #667eea;
            font-weight: 600;
            border: none;
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .back-button:hover {
            background: #f0f4ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }

          .units-info {
            background: rgba(255, 255, 255, 0.15);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            backdrop-filter: blur(10px);
          }

          .micro-units-body {
            display: flex;
            flex-direction: row;
            flex: 1;
          }

          .micro-units-sidebar-wrapper {
            width: 280px !important;
            max-width: 280px !important;
            min-width: 280px !important;
            flex-shrink: 0;
            border-right: 1px solid #e0e0e0;
            background: white;
            overflow: hidden;
            height: calc(100vh - 180px);
            position: sticky;
            top: 0;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
          }

          .micro-units-content {
            flex: 1;
            padding: 0;
            overflow-y: auto;
            background: white;
            margin: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            background: white;
            margin: 1.5rem;
            border-radius: 12px;
          }

          .error-container {
            padding: 3rem 2rem;
            text-align: center;
            background: white;
            margin: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .error-container h3 {
            color: #dc3545;
            margin-bottom: 1rem;
          }

          @media (max-width: 768px) {
            .micro-units-banner {
              padding: 1rem;
            }

            .banner-content {
              width: 100%;
            }

            .banner-text h2 {
              font-size: 1.25rem;
            }

            .banner-actions {
              width: 100%;
              justify-content: space-between;
            }

            .micro-units-body {
              flex-direction: column;
            }

            .micro-units-sidebar-wrapper {
              width: 100%;
              max-height: 300px;
              position: relative;
              border-right: none;
              border-bottom: 1px solid #e0e0e0;
            }

            .micro-units-content {
              margin: 1rem;
              padding: 0;
            }
          }
        `}
        </style>

        <div className="micro-units-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <Icon src={School} style={{ width: '32px', height: '32px' }} />
            </div>
            <div className="banner-text">
              <h2>Micro Learning Mode</h2>
              <p>Học tập nhanh và hiệu quả với các bài học ngắn gọn</p>
            </div>
          </div>
          <div className="banner-actions">
            <span className="units-info">
              {units.length} bài học
            </span>
            <Button
              variant="light"
              className="back-button"
              onClick={handleBackToLearning}
            >
              <Icon src={ArrowBack} />
              Quay về Learning thông thường
            </Button>
          </div>
        </div>

        <AlertList topic="sequence" />

        {status === 'loading' && (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="error-container">
            <h3>Error Loading Units</h3>
            <p>We encountered an error while loading the micro units. Please try again later.</p>
          </div>
        )}

        {status === 'loaded' && (
          <div className="micro-units-body">
            <div className="micro-units-sidebar-wrapper">
              <MicroUnitsSidebar
                courseId={courseId}
                microUnitId={microUnitId}
                units={units}
                currentUnitId={unitId}
                microUnitDetail={microUnitDetail}
              />
            </div>

            <div className="micro-units-content">
              {selectedUnit ? (
                <MicroUnitPlayer
                  courseId={courseId}
                  microUnitId={microUnitId}
                  unitId={unitId}
                  unit={selectedUnit}
                  allUnits={units}
                />
              ) : (
                <div className="text-center p-5">
                  <Icon
                    src={School}
                    style={{
                      width: '64px',
                      height: '64px',
                      opacity: 0.3,
                      marginBottom: '1rem',
                    }}
                  />
                  <h3>Chọn một bài học từ sidebar</h3>
                  <p className="text-muted">
                    Chọn một bài học từ danh sách bên trái để bắt đầu học.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Tools Panel - Reuse from courseware */}
        <ToolsPanel />
      </div>
    </ToolsDrawerContext.Provider>
  );
};

MicroUnitsCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
  microUnitId: PropTypes.string,
  unitId: PropTypes.string,
};

MicroUnitsCourse.defaultProps = {
  microUnitId: null,
  unitId: null,
};

export default MicroUnitsCourse;
