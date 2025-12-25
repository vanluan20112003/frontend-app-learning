import React, { useEffect, useState } from 'react';
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
  Form,
} from '@openedx/paragon';
import {
  School,
  Schedule,
  CheckCircle,
  Search,
} from '@openedx/paragon/icons';
import { LearningHeader as Header } from '@edx/frontend-component-header';

const AllMicroUnitsPage = () => {
  const navigate = useNavigate();
  const [allMicroUnits, setAllMicroUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllMicroUnits = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;

        // Step 1: Fetch user's enrolled courses
        const enrollmentResponse = await client.get(`${baseUrl}/api/enrollment/v1/enrollment`);
        const enrollments = enrollmentResponse.data;

        if (!Array.isArray(enrollments) || enrollments.length === 0) {
          setAllMicroUnits([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch micro units and completion status for each course
        const microUnitsPromises = enrollments.map(async (enrollment) => {
          const courseId = enrollment.course_details?.course_id;
          if (!courseId) { return []; }

          try {
            // Fetch micro units for this course
            const microUnitsUrl = `${baseUrl}/api/micro_unit/v1/courses/${courseId}/micro-units/`;
            const microUnitsResponse = await client.get(microUnitsUrl);
            const { data } = microUnitsResponse;

            let courseMicroUnits = [];
            if (Array.isArray(data)) {
              courseMicroUnits = data;
            } else if (data && typeof data === 'object') {
              const microUnitsArray = data.results || data.micro_units || data.items || data.data || [];
              courseMicroUnits = Array.isArray(microUnitsArray) ? microUnitsArray : [];
            }

            // Filter only active micro units
            const activeMicroUnits = courseMicroUnits.filter(unit => unit.is_active === true);

            // Fetch completion status for this course
            let completedUnits = new Set();
            try {
              const completionUrl = `${baseUrl}/api/micro_unit/v1/units/${courseId}`;
              const completionResponse = await client.get(completionUrl);
              if (completionResponse.data && Array.isArray(completionResponse.data.units)) {
                completedUnits = new Set(
                  completionResponse.data.units
                    .filter(unit => unit.complete === true)
                    .map(unit => unit.id),
                );
              }
            } catch (err) {
              console.error(`Error fetching completion for ${courseId}:`, err);
            }

            // Add course info and completion to each micro unit
            return activeMicroUnits.map(microUnit => ({
              ...microUnit,
              courseId,
              courseTitle: enrollment.course_details?.course_name || 'Unknown Course',
              completedUnits,
            }));
          } catch (err) {
            console.error(`Error fetching micro units for ${courseId}:`, err);
            return [];
          }
        });

        // Wait for all promises to resolve
        const resultsArrays = await Promise.all(microUnitsPromises);

        // Flatten the array of arrays
        const flattenedMicroUnits = resultsArrays.flat();

        setAllMicroUnits(flattenedMicroUnits);
      } catch (err) {
        console.error('Error fetching micro units:', err);
        setError(err.message || 'Failed to load micro units');
      } finally {
        setLoading(false);
      }
    };

    fetchAllMicroUnits();
  }, []);

  const handleMicroUnitClick = (microUnit) => {
    if (microUnit && microUnit.id && microUnit.courseId) {
      if (microUnit.blocks && microUnit.blocks.length > 0) {
        const firstBlock = microUnit.blocks[0];
        navigate(`/micro-units/${microUnit.courseId}/${microUnit.id}/${encodeURIComponent(firstBlock.block_usage_key)}`);
      } else {
        navigate(`/micro-units/${microUnit.courseId}/${microUnit.id}`);
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
      block => microUnit.completedUnits && microUnit.completedUnits.has(block.block_usage_key),
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

  // Filter micro units based on search term
  const filteredMicroUnits = allMicroUnits.filter(microUnit => {
    if (!searchTerm) { return true; }
    const searchLower = searchTerm.toLowerCase();
    return (
      microUnit.title?.toLowerCase().includes(searchLower)
      || microUnit.description?.toLowerCase().includes(searchLower)
      || microUnit.courseTitle?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
            <h4>Đang tải Micro Units...</h4>
            <p className="text-muted">Đang tìm kiếm tất cả micro units từ các khóa học của bạn...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="all-micro-units-page">
        <style jsx>{`
          .all-micro-units-page {
            background: #f5f7fa;
            min-height: 100vh;
          }

          .page-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0 2rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.75rem 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .page-subtitle {
            opacity: 0.95;
            margin: 0 0 1.5rem 0;
            font-size: 1.125rem;
          }

          .search-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .search-input-wrapper {
            position: relative;
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            pointer-events: none;
          }

          .search-input {
            padding-left: 3rem;
            border-radius: 50px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.95);
            font-size: 1rem;
            height: 3.5rem;
          }

          .search-input:focus {
            background: white;
            border-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .stats-bar {
            background: white;
            padding: 1.5rem 0;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .stats-container {
            display: flex;
            justify-content: center;
            gap: 3rem;
            flex-wrap: wrap;
          }

          .stat-item {
            text-align: center;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
            margin: 0;
          }

          .stat-label {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .micro-units-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
            padding-bottom: 3rem;
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
            height: 100%;
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
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .course-badge {
            display: inline-block;
            background: #f1f5f9;
            color: #475569;
            padding: 0.25rem 0.625rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
            flex: 1;
          }

          .micro-unit-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.8125rem;
            color: #64748b;
            flex-wrap: wrap;
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

          .empty-state {
            text-align: center;
            padding: 5rem 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
          }

          .empty-icon {
            font-size: 5rem;
            opacity: 0.2;
            color: #667eea;
            margin-bottom: 1.5rem;
          }

          @media (max-width: 768px) {
            .page-title {
              font-size: 1.75rem;
            }

            .micro-units-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
        </style>

        <div className="page-header">
          <Container>
            <h1 className="page-title">My Micro Units</h1>
            <p className="page-subtitle">
              Khám phá tất cả micro units từ các khóa học của bạn
            </p>
            <div className="search-container">
              <div className="search-input-wrapper">
                <Icon src={Search} className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm micro units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </Container>
        </div>

        {allMicroUnits.length > 0 && (
          <div className="stats-bar">
            <div className="stats-container">
              <div className="stat-item">
                <h3 className="stat-value">{allMicroUnits.length}</h3>
                <p className="stat-label">Tổng Micro Units</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">
                  {allMicroUnits.filter(mu => calculateCompletion(mu).percentage === 100).length}
                </h3>
                <p className="stat-label">Đã hoàn thành</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-value">
                  {allMicroUnits.filter(mu => {
                    const comp = calculateCompletion(mu);
                    return comp.percentage > 0 && comp.percentage < 100;
                  }).length}
                </h3>
                <p className="stat-label">Đang học</p>
              </div>
            </div>
          </div>
        )}

        <Container>
          {filteredMicroUnits.length === 0 ? (
            <div className="empty-state">
              <Icon src={School} className="empty-icon" />
              <h3>
                {searchTerm ? 'Không tìm thấy kết quả' : 'Không có micro units'}
              </h3>
              <p className="text-muted">
                {searchTerm
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Bạn chưa có micro units nào. Hãy đăng ký khóa học có micro units để bắt đầu!'}
              </p>
            </div>
          ) : (
            <div className="micro-units-grid">
              {filteredMicroUnits.map((microUnit, index) => {
                const thumbnailUrl = getThumbnailUrl(microUnit);
                const completion = calculateCompletion(microUnit);

                return (
                  <Card
                    key={`${microUnit.courseId}-${microUnit.id}-${index}`}
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
                      <div className="course-badge" title={microUnit.courseTitle}>
                        {microUnit.courseTitle}
                      </div>

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
          )}
        </Container>
      </div>
    </>
  );
};

export default AllMicroUnitsPage;
