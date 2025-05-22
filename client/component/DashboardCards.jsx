import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const DashboardCards = () => {
  return (
    <Row className="mb-4">
      <Col>
        <Card bg="primary" text="white">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title>Total Polls</Card.Title>
              <Card.Text className="fs-4 fw-bold">23</Card.Text>
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
              <Card.Text className="fs-4 fw-bold">5</Card.Text>
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
              <Card.Text className="fs-4 fw-bold">142</Card.Text>
            </div>
            <i className="bi bi-people-fill fs-1"></i>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCards;