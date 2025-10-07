import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Button, Alert, Spinner,
} from '@openedx/paragon';
import { Send, CheckCircle } from '@openedx/paragon/icons';
import messages from './messages';
import './BugReport.scss';

const BugReport = () => {
  const intl = useIntl();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Check last submit time on mount
  useEffect(() => {
    const lastSubmitTime = localStorage.getItem('bug-report-last-submit-time');
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
        message: intl.formatMessage(messages.bugReportThrottleWarning, { time: formatTime(timeRemaining) }),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/bug-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ title, description, category, severity }),
      // });

      // Simulate API call
      await new Promise((resolve) => { setTimeout(resolve, 1500); });

      // Save submit time
      localStorage.setItem('bug-report-last-submit-time', Date.now().toString());

      setSubmitStatus({
        type: 'success',
        message: intl.formatMessage(messages.bugReportSubmitSuccess),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('bug');
      setSeverity('medium');

      // Set throttle
      setCanSubmit(false);
      setTimeRemaining(15 * 60);
    } catch (error) {
      setSubmitStatus({
        type: 'danger',
        message: intl.formatMessage(messages.bugReportSubmitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bug-report-container">
      <div className="bug-report-header">
        <h3>{intl.formatMessage(messages.bugReportFormTitle)}</h3>
        <p className="text-muted">{intl.formatMessage(messages.bugReportFormDescription)}</p>
      </div>

      {submitStatus && (
        <Alert variant={submitStatus.type} dismissible onClose={() => setSubmitStatus(null)}>
          {submitStatus.type === 'success' && <CheckCircle className="mr-2" />}
          {submitStatus.message}
        </Alert>
      )}

      {!canSubmit && (
        <Alert variant="info">
          {intl.formatMessage(messages.bugReportNextSubmitIn, { time: formatTime(timeRemaining) })}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.bugReportCategoryLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="bug">{intl.formatMessage(messages.bugReportCategoryBug)}</option>
            <option value="feature">{intl.formatMessage(messages.bugReportCategoryFeature)}</option>
            <option value="improvement">{intl.formatMessage(messages.bugReportCategoryImprovement)}</option>
            <option value="content">{intl.formatMessage(messages.bugReportCategoryContent)}</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.bugReportSeverityLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">{intl.formatMessage(messages.bugReportSeverityLow)}</option>
            <option value="medium">{intl.formatMessage(messages.bugReportSeverityMedium)}</option>
            <option value="high">{intl.formatMessage(messages.bugReportSeverityHigh)}</option>
            <option value="critical">{intl.formatMessage(messages.bugReportSeverityCritical)}</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.bugReportTitleLabel)}</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={intl.formatMessage(messages.bugReportTitlePlaceholder)}
            required
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.bugReportDescriptionLabel)}</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={intl.formatMessage(messages.bugReportDescriptionPlaceholder)}
            required
            disabled={isSubmitting}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="submit-button"
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="mr-2" />
              {intl.formatMessage(messages.bugReportSubmitting)}
            </>
          ) : (
            <>
              <Send className="mr-2" />
              {intl.formatMessage(messages.bugReportSubmitButton)}
            </>
          )}
        </Button>
      </Form>
    </div>
  );
};

export default BugReport;
