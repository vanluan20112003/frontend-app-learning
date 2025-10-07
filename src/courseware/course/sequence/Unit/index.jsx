import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useModel } from '@src/generic/model-store';
import { usePluginsCallback } from '@src/generic/plugin-store';
import BookmarkButton from '../../bookmark/BookmarkButton';
import messages from '../messages';
import ContentIFrame from './ContentIFrame';
import UnitSuspense from './UnitSuspense';
import { modelKeys, views } from './constants';
import { useExamAccess, useShouldDisplayHonorCode } from './hooks';
import { getIFrameUrl } from './urls';
import UnitTitleSlot from '../../../../plugin-slots/UnitTitleSlot';

// Iframe Loading Manager Class
// eslint-disable-next-line no-unused-vars
class IFrameLoadingManager {
  constructor(iframeContainer, onComplete) {
    this.iframeContainer = iframeContainer;
    this.onComplete = onComplete;
    this.loadingStates = {
      iframeInit: false,
      contentLoad: false,
      resourcesReady: false,
    };
    this.loadingElement = null;
    this.totalSteps = Object.keys(this.loadingStates).length;
    this.completedSteps = 0;
    this.isDestroyed = false;
    this.timeoutId = null;
  }

  init() {
    if (this.isDestroyed || !this.iframeContainer) { return; }
    this.createLoadingOverlay();
    this.setupLoadingSequence();
    this.setAutoHideTimeout();
  }

  createLoadingOverlay() {
    if (this.isDestroyed || !this.iframeContainer) { return; }

    // Remove existing loading overlay
    const existingOverlay = this.iframeContainer.querySelector('.iframe-loading-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'iframe-loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="iframe-loading-container">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-content">
          <h4 class="loading-title">Loading content...</h4>
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill" data-progress="iframe-progress"></div>
            </div>
            <span class="progress-text" data-text="iframe-progress-text">0%</span>
          </div>
          <p class="loading-status" data-status="iframe-status">Initializing...</p>
        </div>
      </div>
    `;

    // Add styles for iframe overlay
    if (!document.getElementById('iframe-loading-styles')) {
      const styles = document.createElement('style');
      styles.id = 'iframe-loading-styles';
      styles.textContent = `
        .iframe-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(248, 249, 250, 0.95);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          border-radius: 8px;
          opacity: 1;
          transition: opacity 0.4s ease;
          min-height: 300px;
        }
        
        .iframe-loading-container {
          text-align: center;
          max-width: 320px;
          padding: 2rem 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .iframe-loading-overlay .loading-spinner {
          margin-bottom: 1.2rem;
        }
        
        .iframe-loading-overlay .spinner-ring {
          width: 40px;
          height: 40px;
          border: 3px solid #e9ecef;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: iframe-spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes iframe-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .iframe-loading-overlay .loading-title {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .iframe-loading-overlay .loading-progress {
          margin-bottom: 1rem;
        }
        
        .iframe-loading-overlay .progress-bar {
          width: 100%;
          height: 4px;
          background: #e9f4ff;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.6rem;
        }
        
        .iframe-loading-overlay .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          width: 0%;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        
        .iframe-loading-overlay .progress-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: #007bff;
        }
        
        .iframe-loading-overlay .loading-status {
          color: #6c757d;
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.3;
        }
        
        .iframe-loading-overlay.fade-out {
          opacity: 0;
        }
        
        .iframe-container {
          position: relative;
          min-height: 400px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .iframe-loading-container {
            max-width: 280px;
            padding: 1.5rem 1rem;
          }
          
          .iframe-loading-overlay .loading-title {
            font-size: 1rem;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Make sure iframe container has relative position
    if (this.iframeContainer) {
      this.iframeContainer.style.position = 'relative';
      this.iframeContainer.appendChild(loadingOverlay);
    }

    this.loadingElement = loadingOverlay;
  }

  updateProgress(step, message) {
    if (this.isDestroyed) { return; }

    if (this.loadingStates[step] !== undefined && !this.loadingStates[step]) {
      this.loadingStates[step] = true;
      this.completedSteps++;

      const progress = (this.completedSteps / this.totalSteps) * 100;
      const progressFill = this.loadingElement?.querySelector('[data-progress="iframe-progress"]');
      const progressText = this.loadingElement?.querySelector('[data-text="iframe-progress-text"]');
      const statusText = this.loadingElement?.querySelector('[data-status="iframe-status"]');

      if (progressFill) { progressFill.style.width = `${progress}%`; }
      if (progressText) { progressText.textContent = `${Math.round(progress)}%`; }
      if (statusText) { statusText.textContent = message; }

      // eslint-disable-next-line no-console
      console.log(`IFrame loading step: ${step} - ${message} (${progress.toFixed(1)}%)`);

      if (this.completedSteps === this.totalSteps) {
        setTimeout(() => this.hideLoading(), 500);
      }
    }
  }

  setupLoadingSequence() {
    if (this.isDestroyed) { return; }

    // Step 1: IFrame initialization
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.updateProgress('iframeInit', 'Preparing content frame...');
      }
    }, 200);

    // Step 2: Wait for iframe content
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.waitForContent();
      }
    }, 800);

    // Step 3: Wait for resources
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.waitForResources();
      }
    }, 1500);
  }

  waitForContent() {
    if (this.isDestroyed) { return; }

    const checkContent = () => {
      if (this.isDestroyed) { return; }

      const iframe = this.iframeContainer?.querySelector('iframe');
      if (iframe && iframe.src && iframe.src !== 'about:blank') {
        this.updateProgress('contentLoad', 'Loading course content...');

        const onLoad = () => {
          if (!this.isDestroyed) {
            setTimeout(() => this.waitForResources(), 300);
          }
        };

        if (iframe.complete) {
          onLoad();
        } else {
          iframe.addEventListener('load', onLoad, { once: true });
        }
      } else {
        setTimeout(checkContent, 300);
      }
    };

    checkContent();
  }

  waitForResources() {
    if (this.isDestroyed) { return; }

    const checkResources = () => {
      if (this.isDestroyed) { return; }

      const iframe = this.iframeContainer?.querySelector('iframe');
      let resourcesReady = false;

      try {
        if (iframe && iframe.contentWindow && iframe.contentDocument) {
          const iframeDoc = iframe.contentDocument;
          const hasBody = iframeDoc.body && iframeDoc.body.children.length > 0;
          const hasScripts = iframeDoc.querySelectorAll('script').length > 0;
          resourcesReady = hasBody || hasScripts;
        } else {
          // Cross-origin iframe, assume ready after reasonable time
          resourcesReady = iframe && iframe.src;
        }
      } catch (e) {
        // Cross-origin restriction, assume ready
        resourcesReady = true;
      }

      if (resourcesReady) {
        this.updateProgress('resourcesReady', 'Content ready!');
      } else {
        setTimeout(checkResources, 400);
      }
    };

    setTimeout(checkResources, 300);
  }

  hideLoading() {
    if (this.isDestroyed || !this.loadingElement) { return; }

    this.clearTimeout();
    this.loadingElement.classList.add('fade-out');

    setTimeout(() => {
      if (!this.isDestroyed && this.loadingElement && this.loadingElement.parentNode) {
        this.loadingElement.parentNode.removeChild(this.loadingElement);
        this.loadingElement = null;
      }
      if (this.onComplete) {
        this.onComplete();
      }
    }, 400);
  }

  setAutoHideTimeout() {
    this.timeoutId = setTimeout(() => {
      if (!this.isDestroyed) {
        // eslint-disable-next-line no-console
        console.log('IFrame loading timeout - forcing hide');
        this.hideLoading();
      }
    }, 10000); // 10 seconds timeout
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.clearTimeout();

    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
      this.loadingElement = null;
    }
  }

  forceHide() {
    if (!this.isDestroyed) {
      this.hideLoading();
    }
  }
}

const Unit = ({
  courseId,
  format,
  onLoaded,
  id,
}) => {
  const { formatMessage } = useIntl();
  const { authenticatedUser } = React.useContext(AppContext);
  const examAccess = useExamAccess({ id });
  const shouldDisplayHonorCode = useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const isProcessing = unit.bookmarkedUpdateState === 'loading';
  const view = authenticatedUser ? views.student : views.public;
  const loadingManagerRef = useRef(null);
  const iframeContainerRef = useRef(null);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const hlsCheckTimeoutRef = useRef(null);
  const defaultLoadingTimeoutRef = useRef(null);

  const getUrl = usePluginsCallback('getIFrameUrl', () => getIFrameUrl({
    id,
    view,
    format,
    examAccess,
  }));
  const iframeUrl = getUrl();

  // Function to check if HLS.js is loaded
  const checkHlsLibrary = () => new Promise((resolve) => {
    // Check if HLS is already available
    if (window.Hls) {
      resolve(true);
      return;
    }

    // Check for script tags loading HLS.js
    const scripts = document.querySelectorAll('script[src*="hls.js"]');
    if (scripts.length > 0) {
      // Monitor script loading
      let scriptsLoaded = 0;
      scripts.forEach(script => {
        if (script.readyState === 'complete' || script.readyState === 'loaded') {
          scriptsLoaded++;
        } else {
          script.addEventListener('load', () => {
            scriptsLoaded++;
            if (scriptsLoaded === scripts.length && window.Hls) {
              resolve(true);
            }
          });
          script.addEventListener('error', () => {
            scriptsLoaded++;
            if (scriptsLoaded === scripts.length) {
              resolve(false);
            }
          });
        }
      });

      if (scriptsLoaded === scripts.length) {
        resolve(!!window.Hls);
      }
    } else {
      // Check network requests for HLS.js
      const checkNetworkRequests = () => {
        if (window.performance && window.performance.getEntriesByType) {
          const resources = window.performance.getEntriesByType('resource');
          const hlsResource = resources.find(resource => resource.name.includes('hls.js') || resource.name.includes('hls'));

          if (hlsResource && hlsResource.responseEnd > 0) {
            resolve(true);
            return;
          }
        }

        // Fallback: check for HLS object periodically
        const interval = setInterval(() => {
          if (window.Hls) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);

        // Stop checking after 3 seconds
        setTimeout(() => {
          clearInterval(interval);
          resolve(false);
        }, 3000);
      };

      checkNetworkRequests();
    }
  });

  // Function to hide content loading
  const hideContentLoading = () => {
    setIsContentLoading(false);
    if (hlsCheckTimeoutRef.current) {
      clearTimeout(hlsCheckTimeoutRef.current);
      hlsCheckTimeoutRef.current = null;
    }
    if (defaultLoadingTimeoutRef.current) {
      clearTimeout(defaultLoadingTimeoutRef.current);
      defaultLoadingTimeoutRef.current = null;
    }
  };

  // Enhanced onLoaded handler
  const handleLoaded = React.useCallback(() => {
    hideContentLoading();
    if (onLoaded) {
      onLoaded();
    }
  }, [onLoaded]);

  // Initialize content loading logic
  useEffect(() => {
    if (iframeUrl) {
      setIsContentLoading(true);

      // Default 7 seconds timeout
      defaultLoadingTimeoutRef.current = setTimeout(() => {
        hideContentLoading();
      }, 7000);

      // Check for HLS.js library loading
      const startHlsCheck = async () => {
        try {
          const hlsLoaded = await checkHlsLibrary();
          if (hlsLoaded) {
            hideContentLoading();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Error checking HLS library:', error);
          // Continue with default timeout
        }
      };

      // Start checking after a small delay to allow iframe to initialize
      hlsCheckTimeoutRef.current = setTimeout(startHlsCheck, 1000);
    }

    return () => {
      if (hlsCheckTimeoutRef.current) {
        clearTimeout(hlsCheckTimeoutRef.current);
        hlsCheckTimeoutRef.current = null;
      }
      if (defaultLoadingTimeoutRef.current) {
        clearTimeout(defaultLoadingTimeoutRef.current);
        defaultLoadingTimeoutRef.current = null;
      }
    };
  }, [iframeUrl]);

  // Disable iframe loading manager - using content loading overlay instead
  // useEffect(() => {
  //   if (iframeContainerRef.current && iframeUrl && !loadingManagerRef.current) {
  //     loadingManagerRef.current = new IFrameLoadingManager(
  //       iframeContainerRef.current,
  //       () => {
  //         console.log('IFrame content loading completed');
  //         setIsContentReady(true);
  //       }
  //     );
  //     loadingManagerRef.current.init();
  //   }

  //   return () => {
  //     if (loadingManagerRef.current) {
  //       loadingManagerRef.current.destroy();
  //       loadingManagerRef.current = null;
  //     }
  //   };
  // }, [iframeUrl]);

  // Clean up on unmount
  useEffect(() => () => {
    if (loadingManagerRef.current) {
      loadingManagerRef.current.destroy();
    }
    if (hlsCheckTimeoutRef.current) {
      clearTimeout(hlsCheckTimeoutRef.current);
    }
    if (defaultLoadingTimeoutRef.current) {
      clearTimeout(defaultLoadingTimeoutRef.current);
    }
  }, []);

  if (!unit) {
    return (
      <div className="unit-loading">
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unit" data-unit-id={id}>
      <div className="mb-0">
        <h3 className="h3">{unit.title}</h3>
        <UnitTitleSlot courseId={courseId} unitId={id} />
      </div>
      <h2 className="sr-only">{formatMessage(messages.headerPlaceholder)}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
      <UnitSuspense {...{ courseId, id }} />

      {/* Main Content Container with Loading Overlay */}
      <div className="content-wrapper">
        {/* Content Loading Overlay - positioned absolutely to prevent user interaction */}
        {isContentLoading && (
          <div className="content-loading-overlay">
            <style jsx>{`
              .content-loading-overlay {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(248, 249, 250, 0.98);
                backdrop-filter: blur(2px);
                border-radius: 8px;
                min-height: 200px;
                min-width: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 200;
                cursor: wait;
                padding: 2rem;
              }
              
              .content-loading-container {
                text-align: center;
                max-width: 300px;
                padding: 2rem 1rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.08);
              }
              
              .content-loading-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #e9ecef;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: content-spin 1s linear infinite;
                margin: 0 auto 1.5rem;
              }
              
              @keyframes content-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              .content-loading-title {
                color: #495057;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
              }
              
              .content-loading-subtitle {
                color: #6c757d;
                font-size: 0.9rem;
                margin-bottom: 1rem;
              }
              
              .content-loading-progress {
                width: 100%;
                height: 4px;
                background: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 0.8rem;
              }
              
              .content-loading-bar {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                width: 100%;
                animation: content-progress 7s linear;
                border-radius: 2px;
              }
              
              @keyframes content-progress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              
              .content-loading-status {
                color: #6c757d;
                font-size: 0.85rem;
                font-style: italic;
              }
              
              .content-wrapper {
                width: 100%;
              }

              .iframe-container {
                width: 100%;
                min-height: 400px;
                border-radius: 8px;
              }
              
              @media (max-width: 768px) {
                .content-loading-container {
                  padding: 1.5rem 1rem;
                  max-width: 250px;
                }
                
                .content-loading-spinner {
                  width: 40px;
                  height: 40px;
                }
                
                .content-loading-title {
                  font-size: 1rem;
                }
              }
            `}
            </style>

            <div className="content-loading-container">
              <div className="content-loading-spinner" />
              <h4 className="content-loading-title">Đang tải nội dung</h4>
              <p className="content-loading-subtitle">Vui lòng đợi trong giây lát...</p>
              <div className="content-loading-progress">
                <div className="content-loading-bar" />
              </div>
              <p className="content-loading-status">
                Đang kiểm tra thư viện video và tài nguyên
              </p>
            </div>
          </div>
        )}

        {/* IFrame Content - Always rendered but may be covered by overlay */}
        <div
          ref={iframeContainerRef}
          className="iframe-container"
        >
          <ContentIFrame
            elementId="unit-iframe"
            id={id}
            iframeUrl={iframeUrl}
            loadingMessage={formatMessage(messages.loadingSequence)}
            onLoaded={handleLoaded}
            shouldShowContent={!shouldDisplayHonorCode && !examAccess.blockAccess}
            title={unit.title}
          />
        </div>
      </div>

    </div>
  );
};

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  format: PropTypes.string,
  id: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
};

Unit.defaultProps = {
  format: null,
  onLoaded: undefined,
};

export default Unit;
