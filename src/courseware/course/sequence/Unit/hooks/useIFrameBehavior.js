import { getConfig } from '@edx/frontend-platform';
import React from 'react';
import { useDispatch } from 'react-redux';

import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';
import { logError } from '@edx/frontend-platform/logging';

import { fetchCourse } from '@src/courseware/data';
import { processEvent } from '@src/course-home/data/thunks';
import { useEventListener } from '@src/generic/hooks';
import { messageTypes } from '../constants';

import useLoadBearingHook from './useLoadBearingHook';

export const stateKeys = StrictDict({
  iframeHeight: 'iframeHeight',
  hasLoaded: 'hasLoaded',
  showError: 'showError',
  windowTopOffset: 'windowTopOffset',
});

const useIFrameBehavior = ({
  elementId,
  id,
  iframeUrl,
  onLoaded,
}) => {
  // Do not remove this hook.  See function description.
  useLoadBearingHook(id);

  const dispatch = useDispatch();

  const [iframeHeight, setIframeHeight] = useKeyedState(stateKeys.iframeHeight, 0);
  const [hasLoaded, setHasLoaded] = useKeyedState(stateKeys.hasLoaded, false);
  const [showError, setShowError] = useKeyedState(stateKeys.showError, false);
  const [windowTopOffset, setWindowTopOffset] = useKeyedState(stateKeys.windowTopOffset, null);

  // Throttle iframe height updates to prevent shaking
  const throttleTimerRef = React.useRef(null);
  const lastHeightRef = React.useRef(0);
  const pendingHeightRef = React.useRef(null);

  // Throttled function to update iframe height
  const throttledSetHeight = React.useCallback((newHeight) => {
    // Ignore if height hasn't changed significantly (less than 5px difference)
    if (Math.abs(newHeight - lastHeightRef.current) < 5) {
      return;
    }

    // Store the pending height
    pendingHeightRef.current = newHeight;

    // If there's no pending update, schedule one
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        if (pendingHeightRef.current !== null) {
          setIframeHeight(pendingHeightRef.current);
          lastHeightRef.current = pendingHeightRef.current;
          pendingHeightRef.current = null;
        }
        throttleTimerRef.current = null;
      }, 150); // Throttle to max 1 update per 150ms
    }
  }, [setIframeHeight]);

  // Cleanup throttle timer on unmount
  React.useEffect(() => () => {
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    const frame = document.getElementById(elementId);
    if (!frame) return;

    const { hash } = window.location;
    if (hash) {
      // The url hash will be sent to LMS-served iframe in order to find the location of the
      // hash within the iframe.
      frame.contentWindow.postMessage({ hashName: hash }, `${getConfig().LMS_BASE_URL}`);
    }

    // Inject bridge script into LMS iframe to forward H5P messages
    const injectBridgeScript = () => {
      try {
        const iframeDoc = frame.contentDocument || frame.contentWindow.document;

        // Check if bridge already injected
        if (iframeDoc.getElementById('h5p-bridge-script')) {
          return;
        }

        const script = iframeDoc.createElement('script');
        script.id = 'h5p-bridge-script';
        script.textContent = `
          (function() {
            // Forward H5P → Frontend React App
            window.addEventListener('message', function(event) {
              if (event.origin === 'https://h5p.itp.vn' &&
                  event.data && event.data.type === 'mooc_get_user_id') {
                window.parent.postMessage(event.data, '*');
              }
            });

            // Forward Frontend React App → H5P
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'mooc_user_id_response') {
                var h5pIframes = document.querySelectorAll('iframe[src*="h5p.itp.vn"]');
                h5pIframes.forEach(function(iframe) {
                  if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(event.data, 'https://h5p.itp.vn');
                  }
                });
              }
            });
          })();
        `;

        iframeDoc.body.appendChild(script);
      } catch (error) {
        // Cross-origin restriction - cannot inject
        // Silent fail as this is expected for cross-origin iframes
      }
    };

    // Try to inject bridge after iframe loads
    const timeoutId = setTimeout(() => {
      if (frame && frame.contentWindow) {
        injectBridgeScript();
      }
    }, 1500); // Wait for iframe to load

    return () => clearTimeout(timeoutId);
  }, [id, onLoaded, iframeHeight, hasLoaded, elementId]);

  const receiveMessage = React.useCallback((event) => {
    let { data } = event;

    // Handle H5P messages that come as JSON strings
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // Not JSON, ignore
        return;
      }
    }

    const { type, payload } = data;

    // Handle H5P mooc_get_user_id request
    // According to HUONG_DAN_MOOC_POSTMESSAGE.md spec
    if (type === 'mooc_get_user_id' || type === messageTypes.h5pGetUserId) {
      // Accept from both h5p.itp.vn AND LMS origin
      const h5pOrigin = 'https://h5p.itp.vn';
      const lmsOrigin = getConfig().LMS_BASE_URL;

      if (event.origin !== h5pOrigin && event.origin !== lmsOrigin) {
        return;
      }

      // Fetch user ID from API
      fetch('/api/custom/v1/users/me/', {
        method: 'GET',
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          return response.json();
        })
        .then((responseData) => {
          // Extract user_id from response
          const userId = responseData.success && responseData.data && responseData.data.id
            ? responseData.data.id
            : null;

          // Send response back to H5P iframe using event.source
          event.source.postMessage({
            type: 'mooc_user_id_response',
            user_id: userId,
            timestamp: Date.now(),
          }, h5pOrigin);
        })
        .catch((error) => {
          // Send error response with null user_id
          event.source.postMessage({
            type: 'mooc_user_id_response',
            user_id: null,
            error: error.message,
            timestamp: Date.now(),
          }, h5pOrigin);
        });

      return; // Early return after handling
    }

    if (type === messageTypes.resize) {
      // Use throttled height update to prevent shaking
      throttledSetHeight(payload.height);

      if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
        setHasLoaded(true);
        if (onLoaded) {
          onLoaded();
        }
      }
    } else if (type === messageTypes.videoFullScreen) {
      // We observe exit from the video xblock fullscreen mode
      // and scroll to the previously saved scroll position
      if (!payload.open && windowTopOffset !== null) {
        window.scrollTo(0, Number(windowTopOffset));
      }

      // We listen for this message from LMS to know when we need to
      // save or reset scroll position on toggle video xblock fullscreen mode
      setWindowTopOffset(payload.open ? window.scrollY : null);
    } else if (data.offset) {
      // We listen for this message from LMS to know when the page needs to
      // be scrolled to another location on the page.
      window.scrollTo(0, data.offset + document.getElementById('unit-iframe').offsetTop);
    }
  }, [
    id,
    onLoaded,
    hasLoaded,
    setHasLoaded,
    iframeHeight,
    throttledSetHeight,
    windowTopOffset,
    setWindowTopOffset,
    elementId,
  ]);

  useEventListener('message', receiveMessage);

  /**
  * onLoad *should* only fire after everything in the iframe has finished its own load events.
  * Which means that the plugin.resize message (which calls setHasLoaded above) will have fired already
  * for a successful load. If it *has not fired*, we are in an error state. For example, the backend
  * could have given us a 4xx or 5xx response.
  */

  const handleIFrameLoad = () => {
    if (!hasLoaded) {
      setShowError(true);
      logError('Unit iframe failed to load. Server possibly returned 4xx or 5xx response.', {
        iframeUrl,
      });
    }
    window.onmessage = (e) => {
      if (e.data.event_name) {
        dispatch(processEvent(e.data, fetchCourse));
      }
    };
  };

  return {
    iframeHeight,
    handleIFrameLoad,
    showError,
    hasLoaded,
  };
};

export default useIFrameBehavior;
