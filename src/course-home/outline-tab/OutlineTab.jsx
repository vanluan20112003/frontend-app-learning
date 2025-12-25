import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Button, Hyperlink } from '@openedx/paragon';
import { Info, InfoOutline } from '@openedx/paragon/icons';
import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
import CourseHandouts from './widgets/CourseHandouts';
import StartOrResumeCourseCard from './widgets/StartOrResumeCourseCard';
import WeeklyLearningGoalCard from './widgets/WeeklyLearningGoalCard';
import CourseTools from './widgets/CourseTools';
import { fetchOutlineTab } from '../data';
import messages from './messages';
import Section from './Section';
import ShiftDatesAlert from '../suggested-schedule-messaging/ShiftDatesAlert';
import UpgradeNotification from '../../generic/upgrade-notification/UpgradeNotification';
import UpgradeToShiftDatesAlert from '../suggested-schedule-messaging/UpgradeToShiftDatesAlert';
import useCertificateAvailableAlert from './alerts/certificate-status-alert';
import useCourseEndAlert from './alerts/course-end-alert';
import useCourseStartAlert from '../../alerts/course-start-alert';
import usePrivateCourseAlert from './alerts/private-course-alert';
import useScheduledContentAlert from './alerts/scheduled-content-alert';
import { useModel } from '../../generic/model-store';
import WelcomeMessage from './widgets/WelcomeMessage';
import ProctoringInfoPanel from './widgets/ProctoringInfoPanel';
import AccountActivationAlert from '../../alerts/logistration-alert/AccountActivationAlert';

const OutlineTab = ({ intl }) => {
  const {
    courseId,
    proctoringPanelStatus,
  } = useSelector(state => state.courseHome);

  // State for maintenance mode check
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const {
    isSelfPaced,
    org,
    title,
    userTimezone,
  } = useModel('courseHomeMeta', courseId);

  const {
    accessExpiration,
    courseBlocks: {
      courses,
      sections,
    },
    courseGoals: {
      selectedGoal,
      weeklyLearningGoalEnabled,
    } = {},
    datesBannerInfo,
    datesWidget: {
      courseDateBlocks,
    },
    enableProctoredExams,
    offer,
    timeOffsetMillis,
    verifiedMode,
  } = useModel('outline', courseId);

  const {
    marketingUrl,
  } = useModel('coursewareMeta', courseId);

  const [expandAll, setExpandAll] = useState(false);
  const navigate = useNavigate();

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  // Below the course title alerts (appearing in the order listed here)
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);
  const scheduledContentAlert = useScheduledContentAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const hasDeadlines = courseDateBlocks && courseDateBlocks.some(x => x.dateType === 'assignment-due-date');

  const logUpgradeToShiftDatesLinkClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: 'personalized_learner_schedules',
      linkName: 'course_home_upgrade_shift_dates',
      linkType: 'button',
      pageName: 'course_home',
    });
  };

  const isEnterpriseUser = () => {
    const authenticatedUser = getAuthenticatedUser();
    const userRoleNames = authenticatedUser ? authenticatedUser.roles.map(role => role.split(':')[0]) : [];

    return userRoleNames.includes('enterprise_learner');
  };

  /** show post enrolment survey to only B2C learners */
  const learnerType = isEnterpriseUser() ? 'enterprise_learner' : 'b2c_learner';

  const location = useLocation();

  // Check course visibility status for maintenance mode
  useEffect(() => {
    const checkCourseVisibility = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const url = `${getConfig().LMS_BASE_URL}/api/custom/v1/course-details/visibility-status/?course_id=${courseId}`;
        const response = await client.get(url);
        if (response.data?.success && response.data?.data?.visible_to_staff_only === true) {
          setIsMaintenanceMode(true);
        }
      } catch (error) {
        // Silently fail - don't block the page if API fails
        console.error('Failed to check course visibility status:', error);
      }
    };

    if (courseId) {
      checkCourseVisibility();
    }
  }, [courseId]);

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const startCourse = currentParams.get('start_course');
    if (startCourse === '1') {
      sendTrackEvent('enrollment.email.clicked.startcourse', {});

      // Deleting the course_start query param as it only needs to be set once
      // whenever passed in query params.
      currentParams.delete('start_course');
      navigate({
        pathname: location.pathname,
        search: `?${currentParams.toString()}`,
        replace: true,
      });
    }
  }, [location.search]);

  return (
    <>
      {/* Maintenance Mode Banner */}
      {isMaintenanceMode && (
        <Alert variant="warning" icon={Info} className="mb-3">
          <Alert.Heading>Thông báo bảo trì</Alert.Heading>
          <p className="mb-0">
            Khóa học đang được bảo trì, hãy quay lại sau.
          </p>
        </Alert>
      )}

      <div data-learner-type={learnerType} className="row w-100 mx-0 my-3">
        <div className="col-12 p-0">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div role="heading" aria-level="1" className="h2 mb-0 mr-3">{title}</div>
            <Hyperlink
              destination={`${getConfig().LMS_BASE_URL}/courses/${courseId}/about`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#0d6efd',
                backgroundColor: '#e7f1ff',
                border: '1px solid #b6d4fe',
                borderRadius: '20px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0d6efd';
                e.target.style.color = '#fff';
                e.target.style.borderColor = '#0d6efd';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#e7f1ff';
                e.target.style.color = '#0d6efd';
                e.target.style.borderColor = '#b6d4fe';
              }}
            >
              <InfoOutline style={{ width: '16px', height: '16px', marginRight: '6px' }} />
              Giới thiệu
            </Hyperlink>
          </div>
        </div>
      </div>
      <div className="row course-outline-tab">
        <AccountActivationAlert />
        <div className="col-12">
          <AlertList
            topic="outline-private-alerts"
            customAlerts={{
              ...privateCourseAlert,
            }}
          />
        </div>
        <div className="col col-12 col-md-8">
          <AlertList
            topic="outline-course-alerts"
            className="mb-3"
            customAlerts={{
              ...certificateAvailableAlert,
              ...courseEndAlert,
              ...courseStartAlert,
              ...scheduledContentAlert,
            }}
          />
          {isSelfPaced && hasDeadlines && (
            <>
              <ShiftDatesAlert model="outline" fetch={fetchOutlineTab} />
              <UpgradeToShiftDatesAlert model="outline" logUpgradeLinkClick={logUpgradeToShiftDatesLinkClick} />
            </>
          )}
          <StartOrResumeCourseCard />
          <WelcomeMessage courseId={courseId} />
          {rootCourseId && (
            <>
              <div className="row w-100 m-0 mb-3 justify-content-end">
                <div className="col-12 col-md-auto p-0">
                  <Button variant="outline-primary" block onClick={() => { setExpandAll(!expandAll); }}>
                    {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
                  </Button>
                </div>
              </div>
              <ol id="courseHome-outline" className="list-unstyled">
                {courses[rootCourseId].sectionIds.map((sectionId) => (
                  <Section
                    key={sectionId}
                    courseId={courseId}
                    defaultOpen={sections[sectionId].resumeBlock}
                    expand={expandAll}
                    section={sections[sectionId]}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
        {rootCourseId && (
          <div className="col col-12 col-md-4">
            <ProctoringInfoPanel />
            { /** Defer showing the goal widget until the ProctoringInfoPanel has resolved or has been determined as
             disabled to avoid components bouncing around too much as screen is rendered */ }
            {(!enableProctoredExams || proctoringPanelStatus === 'loaded') && weeklyLearningGoalEnabled && (
              <WeeklyLearningGoalCard
                daysPerWeek={selectedGoal && 'daysPerWeek' in selectedGoal ? selectedGoal.daysPerWeek : null}
                subscribedToReminders={selectedGoal && 'subscribedToReminders' in selectedGoal ? selectedGoal.subscribedToReminders : false}
              />
            )}
            <CourseTools />
            <UpgradeNotification
              offer={offer}
              verifiedMode={verifiedMode}
              accessExpiration={accessExpiration}
              contentTypeGatingEnabled={datesBannerInfo.contentTypeGatingEnabled}
              marketingUrl={marketingUrl}
              upsellPageName="course_home"
              userTimezone={userTimezone}
              shouldDisplayBorder
              timeOffsetMillis={timeOffsetMillis}
              courseId={courseId}
              org={org}
            />
            <CourseDates />
            <CourseHandouts />
          </div>
        )}
      </div>
    </>
  );
};

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
