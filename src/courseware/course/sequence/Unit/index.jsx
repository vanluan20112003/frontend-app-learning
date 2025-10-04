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

// Report Button Component
const ReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');
  const dropdownRef = useRef(null);

  const reportOptions = [
    { value: 'video-not-working', label: 'Video không hoạt động' },
    { value: 'spelling-error', label: 'Lỗi chính tả' },
    { value: 'video-error', label: 'Video bị lỗi' },
    { value: 'missing-content', label: 'Thiếu nội dung' },
    { value: 'audio-problem', label: 'Lỗi âm thanh' },
    { value: 'loading-issue', label: 'Lỗi tải trang' },
    { value: 'broken-link', label: 'Liên kết hỏng' },
    { value: 'other', label: 'Vấn đề khác' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle report submission
    console.log('Report submitted:', {
      issue: selectedIssue,
      comment: additionalComment
    });
    
    // Reset form and close dropdown
    setSelectedIssue('');
    setAdditionalComment('');
    setIsOpen(false);
    
    // Show success message (you can replace with actual notification system)
    alert('Báo cáo đã được gửi. Cảm ơn bạn đã phản hồi!');
  };

  return (
    <div className="report-button-container" ref={dropdownRef}>
      {/* FontAwesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <style jsx>{`
        .report-button-container {
          position: relative;
          display: inline-block;
        }
        
        .report-toggle-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 14px;
          color: #6c757d;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .report-toggle-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
          color: #495057;
        }
        
        .report-toggle-btn.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .dots-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .report-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 300px;
          z-index: 1000;
          margin-top: 4px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          pointer-events: none;
        }
        
        .report-dropdown.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        .report-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .report-title {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          margin: 0;
        }
        
        .report-form {
          padding: 16px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          margin-bottom: 8px;
        }
        
        .report-options {
          display: grid;
          gap: 8px;
        }
        
        .option-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        
        .option-item:hover {
          background: #f8f9fa;
          border-color: #dee2e6;
        }
        
        .option-item.selected {
          background: #e3f2fd;
          border-color: #2196f3;
          color: #1976d2;
        }
        
        .option-radio {
          margin-right: 10px;
          width: 16px;
          height: 16px;
        }
        
        .option-label {
          font-size: 14px;
          flex: 1;
        }
        
        .form-textarea {
          width: 100%;
          min-height: 80px;
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s ease;
        }
        
        .form-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-cancel {
          background: white;
          border-color: #ced4da;
          color: #6c757d;
        }
        
        .btn-cancel:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
        }
        
        .btn-submit {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .btn-submit:hover:not(:disabled) {
          background: #0056b3;
          border-color: #0056b3;
        }
        
        .btn-submit:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
        }
        
        @media (max-width: 480px) {
          .report-dropdown {
            min-width: 280px;
            right: -20px;
          }
        }
      `}</style>
      
      <button
        className={`report-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="dots-icon">
          <i className="fas fa-flag"></i>
        </div>
        <span>Báo cáo</span>
      </button>
      
      <div className={`report-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="report-header">
          <h4 className="report-title">Báo cáo vấn đề</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label className="form-label">Chọn loại vấn đề:</label>
            <div className="report-options">
              {reportOptions.map((option) => (
                <div
                  key={option.value}
                  className={`option-item ${selectedIssue === option.value ? 'selected' : ''}`}
                  onClick={() => setSelectedIssue(option.value)}
                >
                  <input
                    type="radio"
                    className="option-radio"
                    name="issue"
                    value={option.value}
                    checked={selectedIssue === option.value}
                    onChange={() => setSelectedIssue(option.value)}
                  />
                  <span className="option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="additional-comment">
              Mô tả chi tiết (tùy chọn):
            </label>
            <textarea
              id="additional-comment"
              className="form-textarea"
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
              value={additionalComment}
              onChange={(e) => setAdditionalComment(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => setIsOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={!selectedIssue}
            >
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Iframe Loading Manager Class
class IFrameLoadingManager {
  constructor(iframeContainer, onComplete) {
    this.iframeContainer = iframeContainer;
    this.onComplete = onComplete;
    this.loadingStates = {
      iframeInit: false,
      contentLoad: false,
      resourcesReady: false
    };
    this.loadingElement = null;
    this.totalSteps = Object.keys(this.loadingStates).length;
    this.completedSteps = 0;
    this.isDestroyed = false;
    this.timeoutId = null;
  }

  init() {
    if (this.isDestroyed || !this.iframeContainer) return;
    this.createLoadingOverlay();
    this.setupLoadingSequence();
    this.setAutoHideTimeout();
  }

  createLoadingOverlay() {
    if (this.isDestroyed || !this.iframeContainer) return;

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
    if (this.isDestroyed) return;

    if (this.loadingStates[step] !== undefined && !this.loadingStates[step]) {
      this.loadingStates[step] = true;
      this.completedSteps++;
      
      const progress = (this.completedSteps / this.totalSteps) * 100;
      const progressFill = this.loadingElement?.querySelector('[data-progress="iframe-progress"]');
      const progressText = this.loadingElement?.querySelector('[data-text="iframe-progress-text"]');
      const statusText = this.loadingElement?.querySelector('[data-status="iframe-status"]');
      
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${Math.round(progress)}%`;
      if (statusText) statusText.textContent = message;
      
      console.log(`IFrame loading step: ${step} - ${message} (${progress.toFixed(1)}%)`);
      
      if (this.completedSteps === this.totalSteps) {
        setTimeout(() => this.hideLoading(), 500);
      }
    }
  }

  setupLoadingSequence() {
    if (this.isDestroyed) return;

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
    if (this.isDestroyed) return;

    const checkContent = () => {
      if (this.isDestroyed) return;

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
    if (this.isDestroyed) return;

    const checkResources = () => {
      if (this.isDestroyed) return;

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
    if (this.isDestroyed || !this.loadingElement) return;

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
  const [isContentReady, setIsContentReady] = useState(false);
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
  const checkHlsLibrary = () => {
    return new Promise((resolve) => {
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
            const hlsResource = resources.find(resource => 
              resource.name.includes('hls.js') || resource.name.includes('hls')
            );
            
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
  };

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
    setIsContentReady(true);
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

  // Initialize iframe loading manager when iframe container is ready
  useEffect(() => {
    if (iframeContainerRef.current && iframeUrl && !loadingManagerRef.current) {
      loadingManagerRef.current = new IFrameLoadingManager(
        iframeContainerRef.current,
        () => {
          console.log('IFrame content loading completed');
          setIsContentReady(true);
        }
      );
      loadingManagerRef.current.init();
    }

    return () => {
      if (loadingManagerRef.current) {
        loadingManagerRef.current.destroy();
        loadingManagerRef.current = null;
      }
    };
  }, [iframeUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loadingManagerRef.current) {
        loadingManagerRef.current.destroy();
      }
      if (hlsCheckTimeoutRef.current) {
        clearTimeout(hlsCheckTimeoutRef.current);
      }
      if (defaultLoadingTimeoutRef.current) {
        clearTimeout(defaultLoadingTimeoutRef.current);
      }
    };
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
      <div className="content-wrapper" style={{ position: 'relative' }}>
        {/* Content Loading Overlay - positioned absolutely to prevent user interaction */}
        {isContentLoading && (
          <div className="content-loading-overlay">
            <style jsx>{`
              .content-loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(248, 249, 250, 0.95);
                backdrop-filter: blur(2px);
                border-radius: 8px;
                min-height: 400px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 200;
                cursor: wait;
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
                min-height: 400px;
              }
              
              .iframe-container {
                position: relative;
                min-height: 400px;
                border-radius: 8px;
                overflow: hidden;
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
            `}</style>
            
            <div className="content-loading-container">
              <div className="content-loading-spinner"></div>
              <h4 className="content-loading-title">Đang tải nội dung</h4>
              <p className="content-loading-subtitle">Vui lòng đợi trong giây lát...</p>
              <div className="content-loading-progress">
                <div className="content-loading-bar"></div>
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
      
      {/* Report Button - positioned below the course content */}
      <div className="unit-actions" style={{ 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <ReportButton />
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