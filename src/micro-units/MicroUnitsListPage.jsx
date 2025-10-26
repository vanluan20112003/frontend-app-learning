import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Icon,
} from '@openedx/paragon';
import {
  School,
  Schedule,
  CheckCircle,
} from '@openedx/paragon/icons';

const MicroUnitsListPage = ({ courseId }) => {
  const navigate = useNavigate();
  const [microUnits, setMicroUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedUnits, setCompletedUnits] = useState(new Set());

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
        const { data } = response;

        let allMicroUnits = [];
        if (Array.isArray(data)) {
          allMicroUnits = data;
        } else if (data && typeof data === 'object') {
          const microUnitsArray = data.results || data.micro_units || data.items || data.data || [];
          allMicroUnits = Array.isArray(microUnitsArray) ? microUnitsArray : [];
        }

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
    if (microUnit && microUnit.id) {
      if (microUnit.blocks && microUnit.blocks.length > 0) {
        const firstBlock = microUnit.blocks[0];
        navigate(`/micro-units/${courseId}/${microUnit.id}/${encodeURIComponent(firstBlock.block_usage_key)}`);
      } else {
        navigate(`/micro-units/${courseId}/${microUnit.id}`);
      }
    }
  };

  const getThumbnailUrl = (microUnit) => {
    const baseUrl = getConfig().LMS_BASE_URL;

    if (microUnit.thumbnail_display) {
      if (microUnit.thumbnail_display.startsWith('/')) {
        return `${baseUrl}${microUnit.thumbnail_display}`;
      }
      return microUnit.thumbnail_display;
    }

    if (microUnit.thumbnail_url) {
      if (microUnit.thumbnail_url.startsWith('/')) {
        return `${baseUrl}${microUnit.thumbnail_url}`;
      }
      return microUnit.thumbnail_url;
    }

    return null;
  };

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
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h4>Đang tải micro units...</h4>
          <p className="text-muted">Vui lòng đợi trong giây lát</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (microUnits.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Icon src={School} style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Không có micro units</h3>
          <p className="text-muted">
            Khóa học này chưa có micro units nào. Vui lòng quay lại sau.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <div className="micro-units-list-page">
      <style jsx>{`
        .micro-units-list-page {
          background: #f5f7fa;
          min-height: 100vh;
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 0;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          opacity: 0.95;
          margin: 0;
        }

        .micro-units-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding-bottom: 2rem;
        }

        .micro-unit-card {
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e8ebef;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
        }

        .micro-unit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .thumbnail {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon {
          width: 4rem;
          height: 4rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .micro-unit-body {
          padding: 1.25rem;
        }

        .micro-unit-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .micro-unit-description {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .micro-unit-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .completion-bar {
          margin-bottom: 1rem;
        }

        .completion-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.375rem;
          font-weight: 600;
        }

        .progress-bar-wrapper {
          height: 6px;
          background: #e8ebef;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
          border-radius: 3px;
        }

        .progress-bar-fill.complete {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      `}
      </style>

      <div className="page-header">
        <Container>
          <h1 className="page-title">My Micro Units</h1>
          <p className="page-subtitle">
            {microUnits.length} micro unit{microUnits.length !== 1 ? 's' : ''} khả dụng
          </p>
        </Container>
      </div>

      <Container>
        <div className="micro-units-grid">
          {microUnits.map((microUnit) => {
            const thumbnailUrl = getThumbnailUrl(microUnit);
            const completion = calculateCompletion(microUnit);

            return (
              <Card
                key={microUnit.id}
                className="micro-unit-card"
                onClick={() => handleMicroUnitClick(microUnit)}
              >
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={microUnit.title} className="thumbnail" />
                ) : (
                  <div className="thumbnail-placeholder">
                    <Icon src={School} className="placeholder-icon" />
                  </div>
                )}

                <div className="micro-unit-body">
                  <h3 className="micro-unit-title">{microUnit.title}</h3>

                  {microUnit.description && (
                    <p className="micro-unit-description">{microUnit.description}</p>
                  )}

                  <div className="micro-unit-meta">
                    {microUnit.estimated_duration && (
                      <span className="meta-item">
                        <Icon src={Schedule} style={{ width: 16, height: 16 }} />
                        {microUnit.estimated_duration} phút
                      </span>
                    )}
                    {microUnit.total_blocks > 0 && (
                      <span className="meta-item">
                        {microUnit.total_blocks} bài học
                      </span>
                    )}
                  </div>

                  {completion.total > 0 && (
                    <div className="completion-bar">
                      <div className="completion-info">
                        <span>{completion.completed}/{completion.total} hoàn thành</span>
                        <span>{completion.percentage}%</span>
                      </div>
                      <div className="progress-bar-wrapper">
                        <div
                          className={`progress-bar-fill ${completion.percentage === 100 ? 'complete' : ''}`}
                          style={{ width: `${completion.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="badges">
                    {completion.percentage === 100 && (
                      <Badge variant="success">
                        <Icon src={CheckCircle} style={{ width: 14, height: 14, marginRight: 4 }} />
                        Hoàn thành
                      </Badge>
                    )}
                    {microUnit.difficulty_level && (
                      <Badge variant={getDifficultyColor(microUnit.difficulty_level)}>
                        {getDifficultyLabel(microUnit.difficulty_level)}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

MicroUnitsListPage.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default MicroUnitsListPage;
