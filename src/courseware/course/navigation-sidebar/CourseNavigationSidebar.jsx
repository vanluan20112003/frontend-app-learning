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
  VideoCamera,
  Description,
  Assignment,
} from '@openedx/paragon/icons';
import { getCourseOutline, getCourseOutlineStatus } from '../../data/selectors';
import { getCourseOutlineStructure } from '../../data/thunks';
import { LOADED } from '../../data/slice';

const CourseNavigationSidebar = ({
  courseId,
  currentSequenceId,
  currentSectionId,
  currentUnitId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const course = useModel('coursewareMeta', courseId);
  const courseOutline = useSelector(getCourseOutline);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedSequences, setExpandedSequences] = useState(new Set());

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

  // Initialize: auto-expand current sequence when unitId is present
  useEffect(() => {
    if (currentSequenceId && currentUnitId && !expandedSequences.has(currentSequenceId)) {
      setExpandedSequences(prev => new Set([...prev, currentSequenceId]));
    }
  }, [currentSequenceId, currentUnitId]);

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

  const toggleSequence = (sequenceId) => {
    setExpandedSequences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sequenceId)) {
        newSet.delete(sequenceId);
      } else {
        newSet.add(sequenceId);
      }
      return newSet;
    });
  };

  const handleSequenceClick = (sequenceId) => {
    navigate(`/course/${courseId}/${sequenceId}`);
  };

  const handleUnitClick = (sequenceId, unitId) => {
    navigate(`/course/${courseId}/${sequenceId}/${unitId}`);
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

  // Helper function to check if unit is completed
  const isUnitCompleted = (unitId) => {
    const outlineUnit = courseOutline?.units?.[unitId];
    return outlineUnit?.complete === true;
  };

  // Helper function to get unit icon based on type
  const getUnitIcon = (unit) => {
    if (!unit) {
      return Description;
    }
    const iconType = unit.icon || unit.type;
    switch (iconType) {
      case 'video':
        return VideoCamera;
      case 'problem':
        return Assignment;
      default:
        return Description;
    }
  };

  if (!course) {
    return null;
  }

  return (
    <div className={`course-nav-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <style jsx>{`
        .course-nav-sidebar {
          position: fixed;
          top: calc(var(--header-height, 60px) + var(--tabs-navigation-height, 60px) + var(--instructor-toolbar-height, 0px));
          left: 0;
          height: calc(100vh - var(--header-height, 60px) - var(--tabs-navigation-height, 60px) - var(--instructor-toolbar-height, 0px));
          background: white;
          border-right: 1px solid #e5e5e5;
          transition: all 0.3s ease;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 997;
        }

        .course-nav-sidebar.expanded {
          width: 320px;
        }

        .course-nav-sidebar.collapsed {
          width: 48px;
        }

        .collapsed .sidebar-content {
          display: none;
        }

        .collapsed .sidebar-header {
          justify-content: center;
          padding: 1rem 0.5rem;
        }

        .sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 2px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          flex-shrink: 0;
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
          width: calc(100% - 1rem);
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

        .sequence-expand-icon {
          flex-shrink: 0;
          color: #94a3b8;
          width: 18px;
          height: 18px;
        }

        .units-list {
          padding-left: 0;
          margin: 0;
          list-style: none;
          background: #f8f9fa;
          padding: 0.25rem 0;
        }

        .unit-item {
          padding: 0.625rem 1rem 0.625rem 4.5rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.8125rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          margin: 0.0625rem 0.5rem;
          border: none;
          width: calc(100% - 1rem);
        }

        .unit-item:hover {
          background: #f1f5f9;
          transform: translateX(2px);
        }

        .unit-item.active {
          background: #bfdbfe;
          color: #1e40af;
          font-weight: 600;
        }

        .unit-item.completed {
          color: #047857;
        }

        .unit-item.completed:not(.active) {
          background: #ecfdf5;
        }

        .unit-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #94a3b8;
        }

        .unit-item.active .unit-icon {
          color: #2563eb;
        }

        .unit-item.completed .unit-icon {
          color: #059669;
        }

        .unit-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

        /* Scrollbar styling - thanh mỏng, đẹp, hiện đại */
        .course-nav-sidebar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }

        .course-nav-sidebar::-webkit-scrollbar {
          width: 5px;
        }

        .course-nav-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .course-nav-sidebar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        .course-nav-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        /* Dark mode support - indigo-dark-theme from header toggle */
        body.indigo-dark-theme .course-nav-sidebar {
          background: #1f2937;
          border-right-color: #374151;
        }

        body.indigo-dark-theme .sidebar-content {
          background: #111827;
        }

        body.indigo-dark-theme .section-header {
          background: #1f2937;
        }

        body.indigo-dark-theme .section-header:hover {
          background: #374151;
        }

        body.indigo-dark-theme .section-header.active {
          background: #1e3a5f;
        }

        body.indigo-dark-theme .section-title {
          color: #f9fafb;
        }

        body.indigo-dark-theme .section-progress {
          color: #9ca3af;
        }

        body.indigo-dark-theme .section-progress.completed {
          color: #34d399;
        }

        body.indigo-dark-theme .section-icon {
          color: #818cf8;
        }

        body.indigo-dark-theme .section-header.completed .section-icon {
          color: #34d399;
        }

        body.indigo-dark-theme .section-expand-icon {
          color: #9ca3af;
        }

        body.indigo-dark-theme .sequences-list {
          background: #111827;
        }

        body.indigo-dark-theme .sequence-item {
          color: #d1d5db;
        }

        body.indigo-dark-theme .sequence-item:hover {
          background: #374151;
        }

        body.indigo-dark-theme .sequence-item.active {
          background: #1e3a5f;
          color: #93c5fd;
        }

        body.indigo-dark-theme .sequence-item.completed {
          color: #34d399;
        }

        body.indigo-dark-theme .sequence-item.completed:not(.active) {
          background: rgba(52, 211, 153, 0.1);
        }

        body.indigo-dark-theme .sequence-icon {
          color: #6b7280;
        }

        body.indigo-dark-theme .sequence-item.active .sequence-icon {
          color: #60a5fa;
        }

        body.indigo-dark-theme .sequence-item.completed .sequence-icon {
          color: #34d399;
        }

        body.indigo-dark-theme .sequence-expand-icon {
          color: #6b7280;
        }

        body.indigo-dark-theme .units-list {
          background: #0f172a;
        }

        body.indigo-dark-theme .unit-item {
          color: #9ca3af;
        }

        body.indigo-dark-theme .unit-item:hover {
          background: #1f2937;
        }

        body.indigo-dark-theme .unit-item.active {
          background: #1e3a5f;
          color: #93c5fd;
        }

        body.indigo-dark-theme .unit-item.completed {
          color: #34d399;
        }

        body.indigo-dark-theme .unit-item.completed:not(.active) {
          background: rgba(52, 211, 153, 0.05);
        }

        body.indigo-dark-theme .unit-icon {
          color: #6b7280;
        }

        body.indigo-dark-theme .unit-item.active .unit-icon {
          color: #60a5fa;
        }

        body.indigo-dark-theme .unit-item.completed .unit-icon {
          color: #34d399;
        }

        body.indigo-dark-theme .course-nav-sidebar {
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        body.indigo-dark-theme .course-nav-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }

        body.indigo-dark-theme .course-nav-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Mobile - hide course navigation sidebar */
        @media (max-width: 768px) {
          .course-nav-sidebar {
            display: none !important;
          }
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
        {sections.map((section) => {
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
                    {section.title}
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
                  {sequences.map((sequence) => {
                    if (!sequence) { return null; }

                    const isActive = sequence.id === currentSequenceId;
                    const sequenceCompleted = isSequenceCompleted(sequence.id);
                    const isSequenceExpanded = expandedSequences.has(sequence.id);
                    const units = (courseOutline?.units && sequence.unitIds)
                      ? sequence.unitIds.map(unitId => courseOutline.units[unitId]).filter(Boolean)
                      : [];
                    const hasUnits = units.length > 0;

                    let sequenceIcon = Circle;
                    if (sequenceCompleted) {
                      sequenceIcon = CheckCircle;
                    } else if (isActive) {
                      sequenceIcon = PlayCircle;
                    }

                    return (
                      <li key={sequence.id}>
                        <button
                          type="button"
                          className={`sequence-item ${isActive ? 'active' : ''} ${sequenceCompleted ? 'completed' : ''}`}
                          onClick={() => {
                            if (hasUnits) {
                              toggleSequence(sequence.id);
                            } else {
                              handleSequenceClick(sequence.id);
                            }
                          }}
                        >
                          <span className="sequence-icon">
                            <Icon src={sequenceIcon} />
                          </span>
                          <span className="sequence-title">
                            {sequence.title}
                          </span>
                          {hasUnits && !isCollapsed && (
                            <span className="sequence-expand-icon">
                              <Icon src={isSequenceExpanded ? ExpandLess : ExpandMore} />
                            </span>
                          )}
                        </button>

                        {isSequenceExpanded && hasUnits && (
                          <ul className="units-list">
                            {units.map((unit) => {
                              if (!unit) { return null; }

                              const isUnitActive = unit.id === currentUnitId;
                              const unitCompleted = isUnitCompleted(unit.id);
                              const unitIconSrc = unitCompleted ? CheckCircle : getUnitIcon(unit);

                              return (
                                <button
                                  key={unit.id}
                                  type="button"
                                  className={`unit-item ${isUnitActive ? 'active' : ''} ${unitCompleted ? 'completed' : ''}`}
                                  onClick={() => handleUnitClick(sequence.id, unit.id)}
                                >
                                  <span className="unit-icon">
                                    <Icon src={unitIconSrc} />
                                  </span>
                                  <span className="unit-title">
                                    {unit.title}
                                  </span>
                                </button>
                              );
                            })}
                          </ul>
                        )}
                      </li>
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
  currentUnitId: PropTypes.string,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func.isRequired,
};

CourseNavigationSidebar.defaultProps = {
  currentSequenceId: null,
  currentSectionId: null,
  currentUnitId: null,
  isCollapsed: false,
};

export default CourseNavigationSidebar;
