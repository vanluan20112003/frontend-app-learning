import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { LearningHeader as Header } from '@edx/frontend-component-header';

import { fetchMicroUnits, fetchMicroUnitBlocks, fetchMicroUnitDetail } from './data/thunks';
import { getMicroUnits, getMicroUnitDetail } from './data/selectors';
import { fetchCourse } from '../courseware/data';
import MicroUnitsCourse from './MicroUnitsCourse';
import MicroUnitsListPage from './MicroUnitsListPage';
import withParamsAndNavigation from '../courseware/utils';
import { useModel } from '../generic/model-store';
import PageLoading from '../generic/PageLoading';

const MicroUnitsContainer = ({
  routeCourseId,
  routeMicroUnitId,
  routeUnitId,
  courseId,
  status,
  fetchCourse: fetchCourseAction,
  fetchMicroUnits: fetchMicroUnitsAction,
  fetchMicroUnitBlocks: fetchMicroUnitBlocksAction,
  fetchMicroUnitDetail: fetchMicroUnitDetailAction,
}) => {
  // Fetch course and micro units data
  useEffect(() => {
    if (routeCourseId) {
      fetchCourseAction(routeCourseId);
      // If we have a microUnitId, fetch blocks from that micro unit with course completion data
      // Otherwise, fetch all units from the course
      if (routeMicroUnitId) {
        fetchMicroUnitBlocksAction(routeMicroUnitId, routeCourseId);
        // Also fetch micro unit detail for title, thumbnail, etc.
        fetchMicroUnitDetailAction(routeMicroUnitId);
      } else {
        fetchMicroUnitsAction(routeCourseId);
      }
    }
  }, [routeCourseId, routeMicroUnitId, fetchCourseAction, fetchMicroUnitsAction, fetchMicroUnitBlocksAction, fetchMicroUnitDetailAction]);

  // Use routeCourseId as fallback if courseId is not yet in Redux
  const activeCourseId = courseId || routeCourseId;

  // Get course metadata
  const course = useModel('coursewareMeta', activeCourseId);

  if (status === 'loading' || !course) {
    return <PageLoading srMessage="Loading micro units..." />;
  }

  return (
    <>
      <Helmet>
        <title>{`Micro Units | ${course.title || ''} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>

      <Header
        courseOrg={course.org}
        courseNumber={course.number}
        courseTitle={course.title}
      />

      <main id="main-content" style={{ minHeight: '500px' }}>
        {routeMicroUnitId ? (
          <MicroUnitsCourse
            courseId={activeCourseId}
            microUnitId={routeMicroUnitId}
            unitId={routeUnitId}
          />
        ) : (
          <MicroUnitsListPage courseId={activeCourseId} />
        )}
      </main>
    </>
  );
};

MicroUnitsContainer.propTypes = {
  routeCourseId: PropTypes.string.isRequired,
  routeMicroUnitId: PropTypes.string,
  routeUnitId: PropTypes.string,
  courseId: PropTypes.string,
  status: PropTypes.oneOf(['idle', 'loading', 'loaded', 'failed']).isRequired,
  fetchCourse: PropTypes.func.isRequired,
  fetchMicroUnits: PropTypes.func.isRequired,
  fetchMicroUnitBlocks: PropTypes.func.isRequired,
  fetchMicroUnitDetail: PropTypes.func.isRequired,
};

MicroUnitsContainer.defaultProps = {
  courseId: null,
  routeMicroUnitId: null,
  routeUnitId: null,
};

const mapStateToProps = (state) => {
  const { courseId, status } = state.microUnits;

  return {
    courseId,
    status,
    units: getMicroUnits(state),
    microUnitDetail: getMicroUnitDetail(state),
  };
};

export default connect(mapStateToProps, {
  fetchCourse,
  fetchMicroUnits,
  fetchMicroUnitBlocks,
  fetchMicroUnitDetail,
})(withParamsAndNavigation(MicroUnitsContainer));
