import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from '@openedx/paragon';
import {
  CheckCircle,
  Circle,
  PlayCircle,
  ArrowBack,
} from '@openedx/paragon/icons';

import { fetchMicroUnits } from './data/thunks';
import {
  getMicroUnits,
  getMicroUnitsStatus,
  getMicroUnitById,
} from './data/selectors';
import { LOADING, LOADED, FAILED } from './data/slice';
import MicroUnitPlayer from './MicroUnitPlayer';

const MicroUnitsPage = () => {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const units = useSelector(getMicroUnits);
  const status = useSelector(getMicroUnitsStatus);
  const [selectedUnitId, setSelectedUnitId] = useState(unitId || null);
  const [showList, setShowList] = useState(!unitId);

  const selectedUnit = useSelector((state) => (selectedUnitId
    ? getMicroUnitById(state, selectedUnitId)
    : null));

  // Fetch units on mount
  useEffect(() => {
    if (courseId && status !== LOADED) {
      dispatch(fetchMicroUnits(courseId));
    }
  }, [courseId, dispatch, status]);

  // Update selected unit when URL changes
  useEffect(() => {
    if (unitId) {
      setSelectedUnitId(unitId);
      setShowList(false);
    }
  }, [unitId]);

  const handleUnitSelect = (unit) => {
    setSelectedUnitId(unit.id);
    setShowList(false);
    navigate(`/micro-units/${courseId}/${encodeURIComponent(unit.id)}`);
  };

  const handleBackToList = () => {
    setShowList(true);
    setSelectedUnitId(null);
    navigate(`/micro-units/${courseId}`);
  };

  const renderUnitIcon = (unit) => {
    if (unit.complete) {
      return <CheckCircle className="text-success" />;
    }
    if (selectedUnitId === unit.id) {
      return <PlayCircle className="text-primary" />;
    }
    return <Circle className="text-muted" />;
  };

  if (status === LOADING) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h4>Loading micro units...</h4>
          <p className="text-muted">Please wait while we fetch the units</p>
        </div>
      </Container>
    );
  }

  if (status === FAILED) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Units</Alert.Heading>
          <p>
            We encountered an error while loading the micro units for this course.
            Please try again later.
          </p>
          <Button
            variant="primary"
            onClick={() => dispatch(fetchMicroUnits(courseId))}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="micro-units-page">
      <style jsx>{`
        .micro-units-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 0;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.3s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0;
        }

        .units-count {
          opacity: 0.9;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .units-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .unit-card {
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          height: 100%;
        }

        .unit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .unit-card.selected {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .unit-card-header {
          display: flex;
          align-items: start;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .unit-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .unit-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #212529;
          margin: 0;
          flex: 1;
        }

        .unit-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }

        .player-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .units-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 1.5rem;
          }
        }
      `}
      </style>

      <div className="page-header">
        <Container>
          <div className="header-content">
            {selectedUnitId && (
              <button
                type="button"
                className="back-button"
                onClick={handleBackToList}
              >
                <ArrowBack />
                Back to List
              </button>
            )}
            <div>
              <h1 className="page-title">Micro Learning Units</h1>
              {status === LOADED && (
                <p className="units-count">
                  {units.length} {units.length === 1 ? 'unit' : 'units'} available
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {showList && status === LOADED && (
          <div className="units-grid">
            {units.map((unit) => (
              <Card
                key={unit.id}
                className={`unit-card ${selectedUnitId === unit.id ? 'selected' : ''}`}
                onClick={() => handleUnitSelect(unit)}
              >
                <Card.Body>
                  <div className="unit-card-header">
                    <div className="unit-icon">
                      {renderUnitIcon(unit)}
                    </div>
                    <h3 className="unit-title">{unit.displayName}</h3>
                  </div>

                  <div className="unit-badges">
                    {unit.graded && (
                      <Badge variant="warning">Graded</Badge>
                    )}
                    {unit.complete && (
                      <Badge variant="success">Completed</Badge>
                    )}
                    {unit.hasScore && (
                      <Badge variant="info">Has Score</Badge>
                    )}
                    {unit.format && (
                      <Badge variant="secondary">{unit.format}</Badge>
                    )}
                  </div>

                  {unit.due && (
                    <p className="text-muted small mt-2 mb-0">
                      Due: {new Date(unit.due).toLocaleDateString()}
                    </p>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {!showList && selectedUnitId && selectedUnit && (
          <div className="player-container">
            <MicroUnitPlayer
              courseId={courseId}
              unitId={selectedUnitId}
              unit={selectedUnit}
            />
          </div>
        )}

        {!showList && selectedUnitId && !selectedUnit && (
          <Alert variant="warning">
            <Alert.Heading>Unit Not Found</Alert.Heading>
            <p>The selected unit could not be found.</p>
            <Button variant="primary" onClick={handleBackToList}>
              Back to List
            </Button>
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default MicroUnitsPage;
