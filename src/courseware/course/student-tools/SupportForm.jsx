import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Button, Alert, Spinner,
} from '@openedx/paragon';
import { Send, CheckCircle } from '@openedx/paragon/icons';
import messages from './messages';
import './SupportForm.scss';

const SupportForm = () => {
  const intl = useIntl();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Check last submit time on mount
  useEffect(() => {
    const lastSubmitTime = localStorage.getItem('support-last-submit-time');
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
        message: intl.formatMessage(messages.supportThrottleWarning, { time: formatTime(timeRemaining) }),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/support', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, subject, message }),
      // });

      // Simulate API call
      await new Promise((resolve) => { setTimeout(resolve, 1500); });

      // Save submit time
      localStorage.setItem('support-last-submit-time', Date.now().toString());

      setSubmitStatus({
        type: 'success',
        message: intl.formatMessage(messages.supportSubmitSuccess),
      });

      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

      // Set throttle
      setCanSubmit(false);
      setTimeRemaining(15 * 60);
    } catch (error) {
      setSubmitStatus({
        type: 'danger',
        message: intl.formatMessage(messages.supportSubmitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-form-container">
      <div className="support-form-header">
        <h3>{intl.formatMessage(messages.supportFormTitle)}</h3>
        <p className="text-muted">{intl.formatMessage(messages.supportFormDescription)}</p>
      </div>

      {submitStatus && (
        <Alert variant={submitStatus.type} dismissible onClose={() => setSubmitStatus(null)}>
          {submitStatus.type === 'success' && <CheckCircle className="mr-2" />}
          {submitStatus.message}
        </Alert>
      )}

      {!canSubmit && (
        <Alert variant="info">
          {intl.formatMessage(messages.supportNextSubmitIn, { time: formatTime(timeRemaining) })}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.supportNameLabel)}</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={intl.formatMessage(messages.supportNamePlaceholder)}
            required
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.supportEmailLabel)}</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={intl.formatMessage(messages.supportEmailPlaceholder)}
            required
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.supportSubjectLabel)}</Form.Label>
          <Form.Control
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={intl.formatMessage(messages.supportSubjectPlaceholder)}
            required
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{intl.formatMessage(messages.supportMessageLabel)}</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={intl.formatMessage(messages.supportMessagePlaceholder)}
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
              {intl.formatMessage(messages.supportSubmitting)}
            </>
          ) : (
            <>
              <Send className="mr-2" />
              {intl.formatMessage(messages.supportSubmitButton)}
            </>
          )}
        </Button>
      </Form>
    </div>
  );
};

export default SupportForm;
