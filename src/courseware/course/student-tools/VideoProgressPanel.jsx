import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, Spinner,
} from '@openedx/paragon';
import {
  ChevronLeft,
  ChevronRight,
  VideoLibrary,
  Assessment,
  Refresh,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useParams } from 'react-router-dom';
import { useModel } from '../../../generic/model-store';
import './VideoProgressPanel.scss';

const VideoProgressPanel = () => {
  // console.log("🔵 VideoProgressPanel component is rendering");
  
  const intl = useIntl();
  const { courseId, unitId } = useParams();
  const course = useModel('coursewareMeta', courseId);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [contentDetail, setContentDetail] = useState(null);
  const [h5pContentId, setH5pContentId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const h5pContentIdRef = useRef(null);

  // Auto-close panel on small screens (but still render for H5P detection)
  useEffect(() => {
    // console.log("💻 Screen size useEffect running");
    const checkScreenSize = () => {
      if (window.innerWidth < 1200) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch and extract H5P from URL
  const fetchH5PFromURL = async (url) => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const h5pIframeRegex = /<iframe[^>]+src=["']([^"']*h5p\.itp\.vn[^"']*)["'][^>]*>/gi;
      const iframeMatch = h5pIframeRegex.exec(html);

      if (iframeMatch) {
        const h5pSrc = iframeMatch[1];
        const idMatch = h5pSrc.match(/[?&]id=(\d+)/);
        if (idMatch) {
          return idMatch[1];
        }
      }

      const h5pIdRegex = /h5p\.itp\.vn[^"']*[?&]id=(\d+)/gi;
      const idMatch = h5pIdRegex.exec(html);

      if (idMatch) {
        return idMatch[1];
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  // Extract H5P content ID from iframe
  const extractH5PContentId = async () => {
    try {
      const mainIframe = document.getElementById('unit-iframe');

      if (!mainIframe) {
        return null;
      }

      try {
        const iframeDoc = mainIframe.contentDocument || mainIframe.contentWindow.document;

        if (iframeDoc) {
          const h5pIframes = iframeDoc.querySelectorAll('iframe[src*="h5p"]');

          if (h5pIframes.length > 0) {
            const { src } = h5pIframes[0];
            const match = src.match(/[?&]id=(\d+)/);
            return match ? match[1] : null;
          }

          const allIframes = iframeDoc.querySelectorAll('iframe');

          for (let i = 0; i < allIframes.length; i++) {
            const iframe = allIframes[i];
            const src = iframe.src || iframe.getAttribute('src') || '';

            if (src.includes('h5p')) {
              const match = src.match(/[?&]id=(\d+)/);
              return match ? match[1] : null;
            }
          }

          const bodyHTML = iframeDoc.body?.innerHTML || '';
          const h5pEmbedRegex = /<iframe[^>]+src=["']([^"']*h5p[^"']*)["'][^>]*>/gi;
          const embedMatch = h5pEmbedRegex.exec(bodyHTML);

          if (embedMatch) {
            const firstEmbed = embedMatch[1];
            const match = firstEmbed.match(/[?&]id=(\d+)/);
            return match ? match[1] : null;
          }

          const h5pIdRegex = /h5p[^>]*[?&]id=(\d+)/gi;
          const idMatch = h5pIdRegex.exec(bodyHTML);

          if (idMatch) {
            return idMatch[1];
          }
        }
      } catch (crossOriginError) {
        const iframeSrc = mainIframe.src;
        if (iframeSrc) {
          return fetchH5PFromURL(iframeSrc);
        }
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    const client = getAuthenticatedHttpClient();
    const { LMS_BASE_URL } = getConfig();
    const apiUrl = `${LMS_BASE_URL}/api/custom/v1/users/me/`;

    const response = await client.get(apiUrl);

    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error('Invalid API response');
  };

  // Fetch content detail for current unit
  const fetchContentDetail = async (userId, contentId) => {
    const H5P_API_BASE = 'https://h5p.itp.vn/wp-json/mooc/v1';
    const apiUrl = `${H5P_API_BASE}/content-detail/${userId}/${courseId}/${contentId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  };

  // Extract H5P content ID and fetch content detail when unit changes
  useEffect(() => {
    // console.log("⚡ useEffect triggered - userData:", userData?.id, "unitId:", unitId);
    
    const loadContentDetail = async () => {
      if (!userData?.id) {
        // console.log("❌ Skipping - no userData yet");
        return undefined;
      }

      // console.log("✅ Starting to load content detail...");

      // Reset state when unit changes
      setH5pContentId(null);
      h5pContentIdRef.current = null;
      setContentDetail(null);
      setLoading(true);

      // Try to extract H5P content ID after a delay (wait for iframe to load)
      const timeoutId = setTimeout(async () => {
        const contentId = await extractH5PContentId();
        // console.log("VideoProgressPanel: Content id extracted:", contentId);
        // console.log("VideoProgressPanel: Unit ID:", unitId);
        
        if (contentId) {
          h5pContentIdRef.current = contentId;
          setH5pContentId(contentId);
          // console.log("VideoProgressPanel: H5P content found, ID:", contentId);

          // Fetch content detail
          fetchContentDetail(userData.id, contentId)
            .then(detail => {
              // console.log("VideoProgressPanel: Content detail fetched:", detail);
              setContentDetail(detail);
            })
            .catch(() => {
              setContentDetail(null);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          // console.log("VideoProgressPanel: No H5P content detected - should hide panel");
          h5pContentIdRef.current = null;
          setH5pContentId(null);
          setContentDetail(null);
          setLoading(false);
        }
      }, 2000); // Wait 2 seconds for iframe to load (same as VideoProgressTool)

      return () => clearTimeout(timeoutId);
    };

    return loadContentDetail();
  }, [userData, unitId]); // Match VideoProgressTool dependencies

  // Polling for updates every 3 seconds
  useEffect(() => {
    // console.log("⏱️ Polling useEffect running - userData:", userData?.id);
    if (!userData?.id) {
      return undefined;
    }
    
    const intervalId = setInterval(async () => {
      const currentContentId = h5pContentIdRef.current;

      if (currentContentId) {
        try {
          const detail = await fetchContentDetail(userData.id, currentContentId);
          setContentDetail(detail);
        } catch (err) {
          console.error('Error refreshing content detail:', err);
        }
      }
    }, 3000); // 3 seconds

    return () => clearInterval(intervalId);
  }, [userData]);

  // Initial data load
  useEffect(() => {
    // console.log("👤 Initial data load useEffect running");
    const loadInitialData = async () => {
      try {
        const user = await fetchUserData();
        setUserData(user);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    loadInitialData();
  }, [courseId]);

  // Manual refresh
  const handleRefresh = async () => {
    if (!userData?.id || !h5pContentId) return;

    try {
      setRefreshing(true);
      const detail = await fetchContentDetail(userData.id, h5pContentId);
      setContentDetail(detail);
    } catch (err) {
      // console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // console.log("🔍 Render check - loading:", loading, "contentDetail:", !!contentDetail, "h5pContentId:", h5pContentId);

  // Don't render if no H5P content detected AND loading is complete (no video in this unit)
  // This matches the logic from VideoProgressTool.jsx
  if (!loading && !contentDetail && !h5pContentId) {
    // console.log("VideoProgressPanel: Not rendering - no H5P content found");
    return null;
  }

  // Show fake data if no real data or 0% progress
  const hasRealVideoProgress = contentDetail?.video_progress?.has_progress && contentDetail.video_progress.progress_percent > 0;
  const hasRealScore = contentDetail?.score?.has_score && contentDetail.score.score > 0;
  
  const videoProgress = hasRealVideoProgress
    ? contentDetail.video_progress 
    : { has_progress: true, progress_percent: 25, duration: 300, status: 'in_progress' };
    
  const scoreData = hasRealScore
    ? contentDetail.score 
    : { has_score: true, score: 5, max_score: 20, score_percent: 25 };

  return (
    <>
      {/* Progress Panel */}
      {isOpen && (
        <div className="video-progress-panel">
          {/* Toggle Button inside panel */}
          <button
            type="button"
            className="video-progress-panel-toggle panel-open"
            onClick={() => setIsOpen(!isOpen)}
            title="Ẩn tiến độ"
            style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0,
              borderRadius: '0 8px 8px 0'
            }}
          >
            <Icon src={ChevronRight} />
          </button>

          <div className="panel-body">
            <>
              {/* Video Progress */}
              {videoProgress?.has_progress && (
                <div className="progress-item">
                  <span className="progress-text">
                    Tiến độ video: <strong>{Math.round(videoProgress.progress_percent)}%</strong>
                  </span>
                </div>
              )}

              {/* Score Progress */}
              {scoreData?.has_score && (
                <div className="progress-item">
                  <span className="progress-text">
                    Điểm số: <strong>{scoreData.score}/{scoreData.max_score}</strong>
                  </span>
                </div>
              )}

              {/* No Data Message - Hidden since we always show fake data */}
            </>
          </div>
        </div>
      )}

      {/* Toggle Button when closed */}
      {!isOpen && (
        <div className="video-progress-panel panel-close">
            <button
            type="button"
            className="video-progress-panel-toggle"
            onClick={() => setIsOpen(!isOpen)}
            title="Hiện tiến độ"
            >
            <Icon src={ChevronLeft} />
            </button>
        </div>
      )}
    </>
  );
};

export default VideoProgressPanel;