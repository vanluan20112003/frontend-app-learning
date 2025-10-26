import React from 'react';

import { useNavigate, useParams } from 'react-router-dom';

const withParamsAndNavigation = WrappedComponent => {
  const WithParamsNavigationComponent = props => {
    const {
      courseId, sequenceId, unitId, microUnitId,
    } = useParams();
    const navigate = useNavigate();
    return (
      <WrappedComponent
        routeCourseId={courseId}
        routeSequenceId={sequenceId}
        routeUnitId={unitId}
        routeMicroUnitId={microUnitId}
        navigate={navigate}
        {...props}
      />
    );
  };
  return WithParamsNavigationComponent;
};

export default withParamsAndNavigation;
