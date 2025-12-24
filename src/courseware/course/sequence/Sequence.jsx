/* eslint-disable no-use-before-define */
import {
  useEffect, useState, useRef, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector, useDispatch } from 'react-redux';
import SequenceExamWrapper from '@edx/frontend-lib-special-exams';

import PageLoading from '@src/generic/PageLoading';
import { useModel } from '@src/generic/model-store';
import { useSequenceBannerTextAlert, useSequenceEntranceExamAlert } from '@src/alerts/sequence-alerts/hooks';
import SequenceContainerSlot from '../../../plugin-slots/SequenceContainerSlot';

import { getCoursewareOutlineSidebarSettings } from '../../data/selectors';
import { fetchSequencesForPrereqCheck } from '../../data/thunks';
import CourseLicense from '../course-license';
import Sidebar from '../sidebar/Sidebar';
import NewSidebar from '../new-sidebar/Sidebar';
import {
  Trigger as CourseOutlineTrigger,
  Sidebar as CourseOutlineTray,
} from '../sidebar/sidebars/course-outline';
import messages from './messages';
import HiddenAfterDue from './hidden-after-due';
import { SequenceNavigation, UnitNavigation } from './sequence-navigation';
import SequenceContent from './SequenceContent';
import SequentialLock from './sequential-lock';

// =====================================================
// SEQUENTIAL LEARNING - Bắt buộc học tuần tự
// Set true để bật, false để tắt
// =====================================================
const ENABLE_SEQUENTIAL_LEARNING = true;

const Sequence = ({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    canAccessProctoredExams,
    license,
  } = useModel('coursewareMeta', courseId);
  const {
    isStaff,
    originalUserIsStaff,
    isNewDiscussionSidebarViewEnabled,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const sequenceMightBeUnit = useSelector(state => state.courseware.sequenceMightBeUnit);
  const { enableNavigationSidebar: isEnabledOutlineSidebar } = useSelector(getCoursewareOutlineSidebarSettings);

  // Lấy data từ models để kiểm tra sequential learning
  const sectionsFromModels = useSelector(state => state.models.sections || {});
  const sequencesFromModels = useSelector(state => state.models.sequences || {});
  const unitsFromModels = useSelector(state => state.models.units || {});
  const coursewareMeta = useModel('coursewareMeta', courseId);

  // Ref để track đã fetch batch chưa (theo sequenceId đang xem)
  const fetchedForSequenceRef = useRef(null);

  // Tính toán danh sách tất cả sequences theo thứ tự (cached với useMemo)
  const allSequenceIds = useMemo(() => {
    if (!ENABLE_SEQUENTIAL_LEARNING || !sequenceId || isStaff || originalUserIsStaff) {
      return [];
    }
    const sectionIds = coursewareMeta?.sectionIds || [];
    if (sectionIds.length === 0) { return []; }

    const result = [];
    sectionIds.forEach((sectionId) => {
      const section = sectionsFromModels[sectionId];
      if (section?.sequenceIds) {
        result.push(...section.sequenceIds);
      }
    });
    return result;
  }, [sequenceId, isStaff, originalUserIsStaff, coursewareMeta?.sectionIds, sectionsFromModels]);

  const currentSequenceIndex = useMemo(
    () => allSequenceIds.indexOf(sequenceId),
    [allSequenceIds, sequenceId],
  );

  // Hàm kiểm tra sequence có hoàn thành chưa (cached với useCallback)
  const isSequenceComplete = useCallback((seqId) => {
    const seq = sequencesFromModels[seqId];
    if (!seq?.unitIds) { return false; }
    return seq.unitIds.every((uId) => {
      const u = unitsFromModels[uId];
      return u?.complete === true;
    });
  }, [sequencesFromModels, unitsFromModels]);

  // Tính toán sequential lock info với useMemo để tránh re-calculate mỗi render
  const sequentialLockResult = useMemo(() => {
    if (!ENABLE_SEQUENTIAL_LEARNING || currentSequenceIndex <= 0 || isStaff || originalUserIsStaff) {
      return { lockInfo: null, isChecking: false, sequencesToFetch: [] };
    }

    // Lấy danh sách sequences trước current cần kiểm tra
    const previousSequenceIds = allSequenceIds.slice(0, currentSequenceIndex);

    // Tìm sequences chưa có data (cần fetch)
    const sequencesNeedFetch = previousSequenceIds.filter(
      (seqId) => !sequencesFromModels[seqId]?.unitIds,
    );

    // Nếu còn sequences cần fetch -> đang loading
    if (sequencesNeedFetch.length > 0) {
      return {
        lockInfo: null,
        isChecking: true,
        sequencesToFetch: sequencesNeedFetch,
      };
    }

    // Tìm sequence ĐẦU TIÊN chưa hoàn thành
    for (let i = 0; i < previousSequenceIds.length; i++) {
      const seqId = previousSequenceIds[i];
      if (!isSequenceComplete(seqId)) {
        const incompleteSequence = sequencesFromModels[seqId];
        return {
          lockInfo: {
            isLocked: true,
            firstIncompleteSequenceId: seqId,
            firstIncompleteSequenceTitle: incompleteSequence?.title || 'Previous Section',
          },
          isChecking: false,
          sequencesToFetch: [],
        };
      }
    }

    // Tất cả đã hoàn thành
    return { lockInfo: null, isChecking: false, sequencesToFetch: [] };
  }, [
    currentSequenceIndex, isStaff, originalUserIsStaff,
    allSequenceIds, sequencesFromModels, isSequenceComplete,
  ]);

  const { lockInfo: sequentialLockInfo, isChecking: isCheckingSequentialLock, sequencesToFetch } = sequentialLockResult;

  // Batch fetch tất cả sequences cần thiết cùng lúc (thay vì fetch từng cái)
  useEffect(() => {
    if (sequencesToFetch.length > 0 && fetchedForSequenceRef.current !== sequenceId) {
      fetchedForSequenceRef.current = sequenceId;
      dispatch(fetchSequencesForPrereqCheck(sequencesToFetch));
    }
  }, [sequencesToFetch, sequenceId, dispatch]);

  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unitId) + 1;
    const newUnitId = sequence.unitIds[nextIndex];
    handleNavigate(newUnitId);

    if (nextIndex >= sequence.unitIds.length) {
      nextSequenceHandler();
    }
  };

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unitId) - 1;
    const newUnitId = sequence.unitIds[previousIndex];
    handleNavigate(newUnitId);

    if (previousIndex < 0) {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (destinationUnitId) => {
    unitNavigationHandler(destinationUnitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.length > 0 ? sequence.unitIds.indexOf(unitId) : 0;
    const payload = {
      current_tab: currentIndex + 1,
      id: unitId,
      tab_count: sequence.unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = sequence.unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  };

  useSequenceBannerTextAlert(sequenceId);
  useSequenceEntranceExamAlert(courseId, sequenceId, intl);

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'entranceExam.passed') {
        // I know this seems (is) intense. It is implemented this way since we need to refetch the underlying
        // course blocks that were originally hidden because the Entrance Exam was not passed.
        global.location.reload();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };

  // We want hide the unit navigation if we're in the middle of navigating to another unit
  // but not if other things about the unit change, like the bookmark status.
  // The array property of this useEffect ensures that we only hide the unit navigation
  // while navigating to another unit.
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [(unit || {}).id]);

  // If sequence might be a unit, we want to keep showing a spinner - the courseware container will redirect us when
  // it knows which sequence to actually go to.
  const loading = sequenceStatus === 'loading' || (sequenceStatus === 'failed' && sequenceMightBeUnit);
  if (loading) {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages.noContent)} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loadingSequence)}
      />
    );
  }

  // Hiển thị loading khi đang kiểm tra sequential learning
  if (isCheckingSequentialLock) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loadingSequence)}
      />
    );
  }

  if (sequenceStatus === 'loaded' && sequence.isHiddenAfterDue) {
    // Shouldn't even be here - these sequences are normally stripped out of the navigation.
    // But we are here, so render a notice instead of the normal content.
    return <HiddenAfterDue courseId={courseId} />;
  }

  // Kiểm tra sequential learning lock - chặn nếu có sequence trước chưa complete
  if (sequenceStatus === 'loaded' && sequentialLockInfo?.isLocked) {
    return (
      <SequentialLock
        courseId={courseId}
        previousSequenceId={sequentialLockInfo.firstIncompleteSequenceId}
        previousSequenceTitle={sequentialLockInfo.firstIncompleteSequenceTitle}
        currentSequenceTitle={sequence?.title || 'This Section'}
      />
    );
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;

  const renderUnitNavigation = (isAtTop) => (
    <UnitNavigation
      sequenceId={sequenceId}
      unitId={unitId}
      isAtTop={isAtTop}
      onClickPrevious={() => {
        logEvent('edx.ui.lms.sequence.previous_selected', 'bottom');
        handlePrevious();
      }}
      onClickNext={() => {
        logEvent('edx.ui.lms.sequence.next_selected', 'bottom');
        handleNext();
      }}
    />
  );

  const defaultContent = (
    <>
      <div className="sequence-container d-inline-flex flex-row w-100">
        <CourseOutlineTrigger />
        <CourseOutlineTray />
        <div className="sequence w-100">
          {!isEnabledOutlineSidebar && (
            <div className="sequence-navigation-container">
              <SequenceNavigation
                sequenceId={sequenceId}
                unitId={unitId}
                nextHandler={() => {
                  logEvent('edx.ui.lms.sequence.next_selected', 'top');
                  handleNext();
                }}
                onNavigate={(destinationUnitId) => {
                  logEvent('edx.ui.lms.sequence.tab_selected', 'top', destinationUnitId);
                  handleNavigate(destinationUnitId);
                }}
                previousHandler={() => {
                  logEvent('edx.ui.lms.sequence.previous_selected', 'top');
                  handlePrevious();
                }}
              />
            </div>
          )}

          <div className="unit-container flex-grow-1 pt-4">
            <SequenceContent
              courseId={courseId}
              gated={gated}
              sequenceId={sequenceId}
              unitId={unitId}
              unitLoadedHandler={handleUnitLoaded}
            />
            {unitHasLoaded && renderUnitNavigation(false)}
          </div>
        </div>
        {isNewDiscussionSidebarViewEnabled ? <NewSidebar /> : <Sidebar />}
      </div>
      <SequenceContainerSlot courseId={courseId} unitId={unitId} />
    </>
  );

  if (sequenceStatus === 'loaded') {
    return (
      <div>
        <SequenceExamWrapper
          sequence={sequence}
          courseId={courseId}
          isStaff={isStaff}
          originalUserIsStaff={originalUserIsStaff}
          canAccessProctoredExams={canAccessProctoredExams}
        >
          {isEnabledOutlineSidebar && renderUnitNavigation(true)}
          {defaultContent}
        </SequenceExamWrapper>
        <CourseLicense license={license || undefined} />
      </div>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages.loadFailure)}
    </p>
  );
};

Sequence.propTypes = {
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default Sequence;
