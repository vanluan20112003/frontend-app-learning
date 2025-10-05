import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useModel, useModels } from '@src/generic/model-store';
import { Icon } from '@openedx/paragon';
import {
  ChevronRight,
  ChevronLeft,
  ExpandMore,
  ExpandLess,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Circle,
  Article,
} from '@openedx/paragon/icons';
import { getCourseOutline, getCourseOutlineStatus } from '../../data/selectors';
import { getCourseOutlineStructure } from '../../data/thunks';
import { LOADED } from '../../data/slice';

const CourseNavigationSidebar = ({
  courseId,
  currentSequenceId,
  currentSectionId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const course = useModel('coursewareMeta', courseId);
  const courseOutline = useSelector(getCourseOutline);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Get all sections
  const sections = useModels('sections', course?.sectionIds || []);

  // Load course outline if not loaded
  useEffect(() => {
    if (courseId && courseOutlineStatus !== LOADED) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, courseOutlineStatus, dispatch]);

  // Initialize: auto-expand current section
  useEffect(() => {
    if (currentSectionId && !expandedSections.has(currentSectionId)) {
      setExpandedSections(prev => new Set([...prev, currentSectionId]));
    }
  }, [currentSectionId]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSequenceClick = (sequenceId) => {
    navigate(`/course/${courseId}/${sequenceId}`);
  };

  // Helper function to check if sequence is completed
  const isSequenceCompleted = (sequenceId) => {
    const outlineSeq = courseOutline?.sequences?.[sequenceId];
    if (!outlineSeq) { return false; }

    // Check if explicitly marked complete
    if (outlineSeq.complete === true) { return true; }

    // Check completionStat
    if (outlineSeq.completionStat) {
      const { completed = 0, total = 0 } = outlineSeq.completionStat;
      return total > 0 && completed === total;
    }

    return false;
  };

  // Helper function to get section completion status
  const getSectionCompletionStatus = (sectionId) => {
    const outlineSection = courseOutline?.sections?.[sectionId];

    if (!outlineSection) {
      return { completed: 0, total: 0 };
    }

    if (outlineSection.completionStat) {
      return {
        completed: outlineSection.completionStat.completed || 0,
        total: outlineSection.completionStat.total || 0,
      };
    }

    return { completed: 0, total: 0 };
  };

  if (!course) {
    return null;
  }

  return (
    <div className={`course-nav-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <style jsx>{`
        .course-nav-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          background: white;
          border-right: 1px solid #e5e5e5;
          transition: all 0.3s ease;
          overflow-y: auto;
          overflow-x: hidden;
          flex-shrink: 0;
        }

        .course-nav-sidebar.expanded {
          width: 320px;
        }

        .course-nav-sidebar.collapsed {
          width: 60px;
        }

        .sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 2px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sidebar-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-title-icon {
          flex-shrink: 0;
        }

        .toggle-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .sidebar-content {
          padding: 0.75rem 0;
          background: #fafafa;
        }

        .section-item {
          margin-bottom: 0.5rem;
          border-radius: 8px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          padding: 1rem 1rem;
          cursor: pointer;
          background: white;
          border: none;
          width: 100%;
          text-align: left;
          transition: all 0.2s;
          gap: 0.75rem;
        }

        .section-header:hover {
          background: #f0f4ff;
        }

        .section-header.active {
          background: #e3f2fd;
        }

        .section-icon {
          flex-shrink: 0;
          color: #667eea;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-header.completed .section-icon {
          color: #10b981;
        }

        .section-expand-icon {
          flex-shrink: 0;
          color: #6c757d;
          transition: transform 0.2s;
        }

        .section-info {
          flex: 1;
          min-width: 0;
        }

        .section-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .section-progress {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .section-progress.completed {
          color: #10b981;
          font-weight: 500;
        }

        .sequences-list {
          padding-left: 0;
          margin: 0;
          list-style: none;
          background: #fafafa;
          padding: 0.25rem 0;
        }

        .sequence-item {
          padding: 0.75rem 1rem 0.75rem 3rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: transparent;
          margin: 0.125rem 0.5rem;
          border: none;
        }

        .sequence-item:hover {
          background: #f8fafc;
          transform: translateX(2px);
        }

        .sequence-item.active {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 600;
        }

        .sequence-item.completed {
          color: #059669;
        }

        .sequence-item.completed:not(.active) {
          background: #f0fdf4;
        }

        .sequence-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: #94a3b8;
        }

        .sequence-item.active .sequence-icon {
          color: #3b82f6;
        }

        .sequence-item.completed .sequence-icon {
          color: #10b981;
        }

        .sequence-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .collapsed .sidebar-title,
        .collapsed .section-info,
        .collapsed .sequence-title,
        .collapsed .section-expand-icon {
          display: none;
        }

        .collapsed .section-header {
          justify-content: center;
          padding: 0.75rem 0.5rem;
        }

        .collapsed .sequence-item {
          padding: 0.625rem 0.5rem;
          justify-content: center;
          margin: 0.125rem 0.25rem;
        }

        .collapsed .sequences-list {
          padding-left: 0;
        }

        @media (max-width: 768px) {
          .course-nav-sidebar.expanded {
            position: fixed;
            width: 280px;
            z-index: 1000;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          }

          .course-nav-sidebar.collapsed {
            width: 0;
            border: none;
          }
        }

        /* Scrollbar styling */
        .course-nav-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .course-nav-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .course-nav-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .course-nav-sidebar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}
      </style>

      <div className="sidebar-header">
        {!isCollapsed && (
          <h3 className="sidebar-title">
            <span className="sidebar-title-icon">
              <Icon src={BookOpen} />
            </span>
            Nội dung khóa học
          </h3>
        )}
        <button
          type="button"
          className="toggle-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <Icon src={isCollapsed ? ChevronRight : ChevronLeft} />
        </button>
      </div>

      <div className="sidebar-content">
        {sections.map((section, sectionIndex) => {
          if (!section) { return null; }

          const isExpanded = expandedSections.has(section.id);
          const isCurrentSection = section.id === currentSectionId;
          const sequences = useModels('sequences', section.sequenceIds || []);
          const { completed, total } = getSectionCompletionStatus(section.id);
          const isCompleted = completed === total && total > 0;

          // Debug log - log courseOutline data
          // if (sectionIndex === 0 && courseOutline) {
          //   console.log('CourseOutline Debug:', {
          //     hasOutline: !!courseOutline,
          //     outlineStatus: courseOutlineStatus,
          //     sectionData: courseOutline?.sections?.[section.id],
          //     sequencesData: section.sequenceIds?.map(seqId => ({
          //       id: seqId,
          //       data: courseOutline?.sequences?.[seqId],
          //     })),
          //   });
          // }

          return (
            <div key={section.id} className="section-item">
              <button
                type="button"
                className={`section-header ${isCurrentSection ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => toggleSection(section.id)}
              >
                <span className="section-icon">
                  <Icon src={isCompleted ? CheckCircle : Article} />
                </span>
                <div className="section-info">
                  <div className="section-title">
                    {sectionIndex + 1}. {section.title}
                  </div>
                  {!isCollapsed && (
                    <div className={`section-progress ${isCompleted ? 'completed' : ''}`}>
                      {completed}/{total} bài học
                    </div>
                  )}
                </div>
                <span className="section-expand-icon">
                  <Icon src={isExpanded ? ExpandLess : ExpandMore} />
                </span>
              </button>

              {isExpanded && (
                <ul className="sequences-list">
                  {sequences.map((sequence, seqIndex) => {
                    if (!sequence) { return null; }

                    const isActive = sequence.id === currentSequenceId;
                    const sequenceCompleted = isSequenceCompleted(sequence.id);
                    let sequenceIcon = Circle;
                    if (sequenceCompleted) {
                      sequenceIcon = CheckCircle;
                    } else if (isActive) {
                      sequenceIcon = PlayCircle;
                    }

                    return (
                      <button
                        key={sequence.id}
                        type="button"
                        className={`sequence-item ${isActive ? 'active' : ''} ${sequenceCompleted ? 'completed' : ''}`}
                        onClick={() => handleSequenceClick(sequence.id)}
                      >
                        <span className="sequence-icon">
                          <Icon src={sequenceIcon} />
                        </span>
                        <span className="sequence-title">
                          {sectionIndex + 1}.{seqIndex + 1} {sequence.title}
                        </span>
                      </button>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

CourseNavigationSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
  currentSectionId: PropTypes.string,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func.isRequired,
};

CourseNavigationSidebar.defaultProps = {
  currentSequenceId: null,
  currentSectionId: null,
  isCollapsed: false,
};

export default CourseNavigationSidebar;
