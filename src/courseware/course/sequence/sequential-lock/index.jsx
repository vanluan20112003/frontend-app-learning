import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import messages from './messages';

/**
 * Component hiển thị khi học sinh cố truy cập sequence chưa được mở khóa
 * trong chế độ học tuần tự (sequential learning)
 */
const SequentialLock = ({
  intl,
  courseId,
  previousSequenceId,
  previousSequenceTitle,
  currentSequenceTitle,
}) => {
  const navigate = useNavigate();

  const handleGoToPrevious = useCallback(() => {
    navigate(`/course/${courseId}/${previousSequenceId}`);
  }, [courseId, previousSequenceId]);

  return (
    <div className="sequence-lock-container text-center py-5">
      <h3>
        <FontAwesomeIcon icon={faLock} className="mr-2" />
        {currentSequenceTitle}
      </h3>
      <h4 className="mt-3">{intl.formatMessage(messages.contentLocked)}</h4>
      <p className="mt-3">
        {intl.formatMessage(messages.completePreviousFirst, {
          previousSequenceTitle,
        })}
      </p>
      <p className="mt-4">
        <Button variant="primary" onClick={handleGoToPrevious}>
          {intl.formatMessage(messages.goToPreviousSection)}
        </Button>
      </p>
    </div>
  );
};

SequentialLock.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  previousSequenceId: PropTypes.string.isRequired,
  previousSequenceTitle: PropTypes.string.isRequired,
  currentSequenceTitle: PropTypes.string.isRequired,
};

export default injectIntl(SequentialLock);
