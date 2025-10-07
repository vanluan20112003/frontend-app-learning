import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Button, Alert, Spinner,
} from '@openedx/paragon';
import { Send, CheckCircle } from '@openedx/paragon/icons';
import messages from './messages';
import './ContentReport.scss';

const ContentReport = () => {
  const intl = useIntl();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const reportOptions = [
    { value: 'video-not-working', label: intl.formatMessage(messages.contentReportVideoNotWorking) },
    { value: 'spelling-error', label: intl.formatMessage(messages.contentReportSpellingError) },
    { value: 'video-error', label: intl.formatMessage(messages.contentReportVideoError) },
    { value: 'missing-content', label: intl.formatMessage(messages.contentReportMissingContent) },
    { value: 'audio-problem', label: intl.formatMessage(messages.contentReportAudioProblem) },
    { value: 'loading-issue', label: intl.formatMessage(messages.contentReportLoadingIssue) },
    { value: 'broken-link', label: intl.formatMessage(messages.contentReportBrokenLink) },
    { value: 'other', label: intl.formatMessage(messages.contentReportOther) },
  ];

  // Check last submit time on mount
  useEffect(() => {
    const lastSubmitTime = localStorage.getItem('content-report-last-submit-time');
    if (lastSubmitTime) {
      const timeDiff = Date.now() - parseInt(lastSubmitTime, 10);
      const fifteenMinutes = 15 * 60 * 1000;
      if (timeDiff < fifteenMinutes) {
        setCanSubmit(false);
        setTimeRemaining(Math.ceil((fifteenMinutes - timeDiff) / 1000));
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!canSubmit && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [canSubmit, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      setSubmitStatus({
        type: 'warning',
        message: intl.formatMessage(messages.contentReportThrottleWarning, { time: formatTime(timeRemaining) }),
      });
      return;
    }

    if (!selectedIssue) {
      setSubmitStatus({
        type: 'warning',
        message: intl.formatMessage(messages.contentReportSelectIssue),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/content-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ issue: selectedIssue, comment: additionalComment }),
      // });

      // Simulate API call
      await new Promise((resolve) => { setTimeout(resolve, 1500); });

      // Save submit time
      localStorage.setItem('content-report-last-submit-time', Date.now().toString());

      setSubmitStatus({
        type: 'success',
        message: intl.formatMessage(messages.contentReportSubmitSuccess),
      });

      // Reset form
      setSelectedIssue('');
      setAdditionalComment('');

      // Set throttle
      setCanSubmit(false);
      setTimeRemaining(15 * 60);
    } catch (error) {
      setSubmitStatus({
        type: 'danger',
        message: intl.formatMessage(messages.contentReportSubmitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-report-container">
      <div className="content-report-header">
        <h3>{intl.formatMessage(messages.contentReportFormTitle)}</h3>
        <p className="text-muted">{intl.formatMessage(messages.contentReportFormDescription)}</p>
      </div>

      {submitStatus && (
        <Alert variant={submitStatus.type} dismissible onClose={() => setSubmitStatus(null)}>
          {submitStatus.type === 'success' && <CheckCircle className="mr-2" />}
          {submitStatus.message}
        </Alert>
      )}

      {!canSubmit && (
        <Alert variant="info">
          {intl.formatMessage(messages.contentReportNextSubmitIn, { time: formatTime(timeRemaining) })}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.contentReportIssueLabel)}</Form.Label>
          <div className="report-options">
            {reportOptions.map((option) => (
              <div
                key={option.value}
                className={`option-item ${selectedIssue === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedIssue(option.value)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedIssue(option.value);
                  }
                }}
              >
                <input
                  type="radio"
                  className="option-radio"
                  name="issue"
                  value={option.value}
                  checked={selectedIssue === option.value}
                  onChange={() => setSelectedIssue(option.value)}
                  disabled={isSubmitting}
                />
                <span className="option-label">{option.label}</span>
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.contentReportCommentLabel)}</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            placeholder={intl.formatMessage(messages.contentReportCommentPlaceholder)}
            disabled={isSubmitting}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || !canSubmit || !selectedIssue}
          className="submit-button"
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="mr-2" />
              {intl.formatMessage(messages.contentReportSubmitting)}
            </>
          ) : (
            <>
              <Send className="mr-2" />
              {intl.formatMessage(messages.contentReportSubmitButton)}
            </>
          )}
        </Button>
      </Form>
    </div>
  );
};

export default ContentReport;
