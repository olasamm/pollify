import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import api from '../src/utils/api';

const DashboardCards = () => {
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    userPolls: 0,
    role: 'user'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body className="text-center">
              <Spinner animation="border" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mb-4">
      <Col>
        <Card bg="primary" text="white">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title>Total Polls</Card.Title>
              <Card.Text className="fs-4 fw-bold">{stats.totalPolls}</Card.Text>
            </div>
            <i className="bi bi-bar-chart-fill fs-1"></i>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card bg="success" text="white">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title>Active Polls</Card.Title>
              <Card.Text className="fs-4 fw-bold">{stats.activePolls}</Card.Text>
            </div>
            <i className="bi bi-check-circle-fill fs-1"></i>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card bg="info" text="white">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title>Votes Cast</Card.Title>
              <Card.Text className="fs-4 fw-bold">{stats.totalVotes}</Card.Text>
            </div>
            <i className="bi bi-people-fill fs-1"></i>
          </Card.Body>
        </Card>
      </Col>
      {stats.role === 'admin' && (
        <Col>
          <Card bg="warning" text="white">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title>My Polls</Card.Title>
                <Card.Text className="fs-4 fw-bold">{stats.userPolls || 0}</Card.Text>
              </div>
              <i className="bi bi-person-fill fs-1"></i>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default DashboardCards;
