import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Spinner,
  Alert,
  Badge,
  Icon,
  Form,
  Button,
  ProgressBar,
} from '@openedx/paragon';
import {
  School,
  Schedule,
  Search,
  LightbulbOutline,
  CheckCircle,
  ExpandMore,
  ExpandLess,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import messages from './messages';
import './MicroUnitsList.scss';

const MicroUnitsList = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [microUnits, setMicroUnits] = useState([]);
  const [completedUnits, setCompletedUnits] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedMicroUnits, setExpandedMicroUnits] = useState(new Set());

  // Fetch completion status from units API
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!courseId) {
        return;
      }

      try {
        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        const url = `${baseUrl}/api/micro_unit/v1/units/${courseId}`;

        const response = await client.get(url);
        const { data } = response;

        // Create a Set of completed unit IDs for fast lookup
        if (data && Array.isArray(data.units)) {
          const completed = new Set(
            data.units
              .filter(unit => unit.complete === true)
              .map(unit => unit.id),
          );
          setCompletedUnits(completed);
        }
      } catch (err) {
        console.error('Error fetching completion status:', err);
        // Don't set error state here, just log it
        // We still want to show micro units even if completion fetch fails
      }
    };

    fetchCompletionStatus();
  }, [courseId]);

  // Fetch micro units
  useEffect(() => {
    const fetchMicroUnits = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        const url = `${baseUrl}/api/micro_unit/v1/courses/${courseId}/micro-units/`;

        const response = await client.get(url);

        // Ensure response.data is an array and filter only active items
        const { data } = response;
        let allMicroUnits = [];

        if (Array.isArray(data)) {
          allMicroUnits = data;
        } else if (data && typeof data === 'object') {
          // If API returns an object with a property containing the array
          // Try common patterns: data.results, data.micro_units, data.items, etc.
          const microUnitsArray = data.results || data.micro_units || data.items || data.data || [];
          allMicroUnits = Array.isArray(microUnitsArray) ? microUnitsArray : [];
        }

        // Filter only active micro units
        const activeMicroUnits = allMicroUnits.filter(unit => unit.is_active === true);
        setMicroUnits(activeMicroUnits);
      } catch (err) {
        console.error('Error fetching micro units:', err);
        setError(err.message || 'Failed to load micro units');
        setMicroUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMicroUnits();
  }, [courseId]);

  const handleMicroUnitClick = (microUnit) => {
    // Navigate to micro units page with microUnitId
    if (microUnit && microUnit.id) {
      if (microUnit.blocks && microUnit.blocks.length > 0) {
        const firstBlock = microUnit.blocks[0];
        navigate(`/micro-units/${courseId}/${microUnit.id}/${encodeURIComponent(firstBlock.block_usage_key)}`);
      } else {
        navigate(`/micro-units/${courseId}/${microUnit.id}`);
      }
    }
  };

  const toggleExpand = (microUnitId, event) => {
    // Stop propagation to prevent triggering card click
    event.stopPropagation();

    setExpandedMicroUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(microUnitId)) {
        newSet.delete(microUnitId);
      } else {
        newSet.add(microUnitId);
      }
      return newSet;
    });
  };

  const handleUnitClick = (microUnit, block, event) => {
    // Stop propagation to prevent triggering card click
    event.stopPropagation();

    // Navigate to specific unit in micro unit
    if (microUnit && block) {
      navigate(`/micro-units/${courseId}/${microUnit.id}/${encodeURIComponent(block.block_usage_key)}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return intl.formatMessage(messages.microUnitsEasy);
      case 'medium':
        return intl.formatMessage(messages.microUnitsMedium);
      case 'hard':
        return intl.formatMessage(messages.microUnitsHard);
      default:
        return difficulty;
    }
  };

  // Calculate completion percentage for a micro unit
  const calculateCompletion = (microUnit) => {
    if (!microUnit || !microUnit.blocks || microUnit.blocks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = microUnit.blocks.length;
    const completed = microUnit.blocks.filter(
      block => completedUnits.has(block.block_usage_key),
    ).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const getThumbnailUrl = (microUnit) => {
    // Priority: thumbnail_display > thumbnail_url
    const baseUrl = getConfig().LMS_BASE_URL;

    if (microUnit.thumbnail_display) {
      // If thumbnail_display is a relative path, combine with baseUrl
      if (microUnit.thumbnail_display.startsWith('/')) {
        return `${baseUrl}${microUnit.thumbnail_display}`;
      }
      // If it's already a full URL, return as is
      return microUnit.thumbnail_display;
    }

    if (microUnit.thumbnail_url) {
      // If thumbnail_url is a relative path, combine with baseUrl
      if (microUnit.thumbnail_url.startsWith('/')) {
        return `${baseUrl}${microUnit.thumbnail_url}`;
      }
      // If it's already a full URL, return as is
      return microUnit.thumbnail_url;
    }

    return null;
  };

  // Filter micro units
  const filteredMicroUnits = microUnits.filter((microUnit) => {
    // Search filter
    const matchesSearch = searchTerm === ''
      || microUnit.title.toLowerCase().includes(searchTerm.toLowerCase())
      || (microUnit.description && microUnit.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Difficulty filter
    const matchesDifficulty = difficultyFilter === 'all'
      || microUnit.difficulty_level === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="micro-units-list-loading">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p>{intl.formatMessage(messages.microUnitsLoading)}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>{intl.formatMessage(messages.microUnitsError)}</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!Array.isArray(microUnits) || microUnits.length === 0) {
    return (
      <div className="micro-units-list-empty">
        <Icon src={School} className="empty-icon mb-3" />
        <h4>{intl.formatMessage(messages.microUnitsEmpty)}</h4>
        <p className="text-muted">{intl.formatMessage(messages.microUnitsEmptyDescription)}</p>
      </div>
    );
  }

  return (
    <div className="micro-units-list">
      <div className="micro-units-list-header">
        <h4>
          <Icon src={School} />
          {intl.formatMessage(messages.microUnitsTitle)}
        </h4>
        <p>
          {microUnits.length} {intl.formatMessage(messages.microUnitsBlocks)}
          {filteredMicroUnits.length !== microUnits.length && ` • ${filteredMicroUnits.length} ${intl.formatMessage(messages.microUnitsFiltered)}`}
        </p>
      </div>

      <div className="micro-units-banner">
        <Icon src={LightbulbOutline} className="banner-icon" />
        <div className="banner-content">
          <h6>{intl.formatMessage(messages.microUnitsBannerTitle)}</h6>
          <p>{intl.formatMessage(messages.microUnitsBannerDescription)}</p>
        </div>
      </div>

      <div className="micro-units-filters">
        <div className="filter-search">
          <Form.Control
            type="text"
            placeholder={intl.formatMessage(messages.microUnitsSearchPlaceholder)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leadingElement={<Icon src={Search} />}
          />
        </div>

        <div className="filter-buttons">
          <div className="filter-group">
            <Button
              size="sm"
              variant={difficultyFilter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setDifficultyFilter('all')}
            >
              {intl.formatMessage(messages.microUnitsAll)}
            </Button>
            <Button
              size="sm"
              variant={difficultyFilter === 'easy' ? 'success' : 'outline-success'}
              onClick={() => setDifficultyFilter('easy')}
            >
              {intl.formatMessage(messages.microUnitsEasy)}
            </Button>
            <Button
              size="sm"
              variant={difficultyFilter === 'medium' ? 'warning' : 'outline-warning'}
              onClick={() => setDifficultyFilter('medium')}
            >
              {intl.formatMessage(messages.microUnitsMedium)}
            </Button>
            <Button
              size="sm"
              variant={difficultyFilter === 'hard' ? 'danger' : 'outline-danger'}
              onClick={() => setDifficultyFilter('hard')}
            >
              {intl.formatMessage(messages.microUnitsHard)}
            </Button>
          </div>
        </div>
      </div>

      <div className="micro-units-content">
        {filteredMicroUnits.length === 0 ? (
          <div className="micro-units-list-empty">
            <Icon src={School} className="empty-icon" />
            <h4>{intl.formatMessage(messages.microUnitsNoResults)}</h4>
            <p className="text-muted">{intl.formatMessage(messages.microUnitsNoResultsDescription)}</p>
          </div>
        ) : (
          <div className="micro-units-grid">
            {Array.isArray(filteredMicroUnits) && filteredMicroUnits.map((microUnit) => {
              const thumbnailUrl = getThumbnailUrl(microUnit);
              const completion = calculateCompletion(microUnit);
              const isExpanded = expandedMicroUnits.has(microUnit.id);
              const hasBlocks = microUnit.blocks && microUnit.blocks.length > 0;

              return (
                <Card
                  key={microUnit.id}
                  className={`micro-unit-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleMicroUnitClick(microUnit)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMicroUnitClick(microUnit);
                    }
                  }}
                >
                  {thumbnailUrl ? (
                    <Card.ImageCap
                      src={thumbnailUrl}
                      srcAlt={microUnit.title}
                      logoSrc={null}
                      logoAlt=""
                    />
                  ) : (
                    <div className="micro-unit-thumbnail-placeholder">
                      <Icon src={School} className="placeholder-icon" />
                    </div>
                  )}
                  <Card.Body>
                    <div className="micro-unit-content-wrapper">
                      <div className="micro-unit-main">
                        <div className="micro-unit-title-row">
                          <h5 className="micro-unit-title">{microUnit.title}</h5>
                          {hasBlocks && (
                          <button
                            type="button"
                            className="expand-button"
                            onClick={(e) => toggleExpand(microUnit.id, e)}
                            aria-label={isExpanded ? 'Collapse units list' : 'Expand units list'}
                          >
                            <Icon src={isExpanded ? ExpandLess : ExpandMore} />
                          </button>
                          )}
                        </div>

                        {microUnit.description && (
                        <p className="micro-unit-description">{microUnit.description}</p>
                        )}

                        <div className="micro-unit-meta">
                          {microUnit.estimated_duration && (
                          <span className="meta-item">
                            <Icon src={Schedule} className="meta-icon" />
                            {microUnit.estimated_duration} {intl.formatMessage(messages.microUnitsMinutes)}
                          </span>
                          )}
                          {microUnit.total_blocks > 0 && (
                          <span className="meta-item">
                            {microUnit.total_blocks} {intl.formatMessage(messages.microUnitsBlocks)}
                          </span>
                          )}
                        </div>

                        {/* Completion Progress */}
                        {completion.total > 0 && (
                        <div className="micro-unit-progress">
                          <div className="progress-header">
                            <span className="progress-text">
                              {intl.formatMessage(messages.microUnitsProgressLabel, {
                                completed: completion.completed,
                                total: completion.total,
                              })}
                            </span>
                            <span className="progress-percentage">
                              {completion.percentage}%
                            </span>
                          </div>
                          <ProgressBar
                            now={completion.percentage}
                            variant={completion.percentage === 100 ? 'success' : 'info'}
                            className="micro-unit-progress-bar"
                          />
                        </div>
                        )}
                      </div>

                      <div className="micro-unit-badges">
                        {completion.percentage === 100 && (
                        <Badge variant="success" className="completion-badge">
                          <Icon src={CheckCircle} className="badge-icon" />
                          {intl.formatMessage(messages.microUnitsCompleted)}
                        </Badge>
                        )}
                        {microUnit.difficulty_level && (
                        <Badge variant={getDifficultyColor(microUnit.difficulty_level)}>
                          {getDifficultyLabel(microUnit.difficulty_level)}
                        </Badge>
                        )}
                      </div>
                    </div>

                    {/* Dropdown list of units */}
                    {isExpanded && hasBlocks && (
                    <div className="micro-unit-dropdown">
                      <div className="dropdown-header">
                        Danh sách bài học ({microUnit.blocks.length})
                      </div>
                      <ul className="units-list">
                        {microUnit.blocks.map((block, index) => {
                          const isCompleted = completedUnits.has(block.block_usage_key);
                          return (
                            <li key={block.id || index} className="unit-item">
                              <button
                                type="button"
                                className={`unit-button ${isCompleted ? 'completed' : ''}`}
                                onClick={(e) => handleUnitClick(microUnit, block, e)}
                              >
                                <Icon
                                  src={isCompleted ? CheckCircle : Schedule}
                                  className="unit-icon"
                                />
                                <span className="unit-name">{block.display_name}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroUnitsList;
