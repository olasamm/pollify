import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import Sidebar from '../component/Sidebar'; // Adjust the path based on your folder structure

const Vote = () => {
  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-grow-1 p-4 bg-light">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Vote on a Poll</h4>
          <div
            className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
          >
            H
          </div>
        </div>

        {/* Poll Content */}
        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <div className="p-4 bg-white shadow rounded">
                <h5 className="text-center mb-3">VOTE</h5>
                <p className="text-center">Choose your favourite</p>

                <Form>
                  <Form.Check
                    type="radio"
                    label="Option A"
                    name="pollOption"
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    label="Option B"
                    name="pollOption"
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    label="Option C"
                    name="pollOption"
                    className="mb-3"
                  />
                  <div className="text-center">
                    <Button variant="primary" className="px-4">
                      Vote
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Vote;