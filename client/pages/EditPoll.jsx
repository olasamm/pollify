import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import api from '../src/utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EditPoll = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pollId = searchParams.get('id');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('open');
  const [expiresAt, setExpiresAt] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPoll, setLoadingPoll] = useState(true);

  const categories = ['General', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Business', 'Education', 'Health', 'Food', 'Travel', 'Other'];

  useEffect(() => {
    const role = localStorage.getItem('role') || 'user';
    if (role !== 'admin') {
      setMessage('Only admins can edit polls. Redirecting...');
      setMessageType('error');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }

    if (pollId) {
      fetchPoll();
    } else {
      setMessage('No poll ID provided');
      setMessageType('error');
      setLoadingPoll(false);
    }
  }, [pollId, navigate]);

  const fetchPoll = async () => {
    try {
      setLoadingPoll(true);
      const response = await api.get(`/api/polls/${pollId}`);
      setTitle(response.data.title);
      setDescription(response.data.description || '');
      setCategory(response.data.category || 'General');
      setStatus(response.data.status || 'open');
      
      // Handle expiration date
      if (response.data.expiresAt) {
        const expDate = new Date(response.data.expiresAt);
        setExpiresAt(expDate.toISOString().slice(0, 16));
        setHasExpiration(true);
      } else {
        setExpiresAt('');
        setHasExpiration(false);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      setMessage('Failed to load poll');
      setMessageType('error');
    } finally {
      setLoadingPoll(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!title.trim()) {
      setMessage('Please enter a poll title');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    // Validate expiration date if set
    if (hasExpiration && expiresAt) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      if (expirationDate <= now) {
        setMessage('Expiration date must be in the future');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await api.put(`/api/polls/${pollId}`, {
        title: title.trim(),
        description: description.trim(),
        category: category,
        status: status,
        expiresAt: hasExpiration && expiresAt ? expiresAt : null
      });

      if (response.status === 200) {
        setMessage('Poll updated successfully!');
        setMessageType('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to update poll. Please try again.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPoll) {
    return (
      <div className="d-flex vh-100">
        <Sidebar />
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center my-4">
          <h4 className="mb-0">Edit Poll</h4>
          <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card className="shadow">
                <Card.Body className="p-4">
                  {message && (
                    <Card 
                      className={`mb-3 ${
                        messageType === 'success' 
                          ? 'bg-success text-white' 
                          : messageType === 'error' 
                          ? 'bg-danger text-white' 
                          : 'bg-info text-white'
                      }`}
                    >
                      <Card.Body className="p-3">
                        <p className="mb-0">{message}</p>
                      </Card.Body>
                    </Card>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Poll Title *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter poll title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter poll description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Select a category to help organize your poll
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Poll Status *</Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Open polls allow voting, closed polls only show results
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="hasExpiration"
                        label="Set expiration date"
                        checked={hasExpiration}
                        onChange={(e) => {
                          setHasExpiration(e.target.checked);
                          if (!e.target.checked) {
                            setExpiresAt('');
                          }
                        }}
                      />
                    </Form.Group>

                    {hasExpiration && (
                      <Form.Group className="mb-3">
                        <Form.Label>Expiration Date & Time *</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          required={hasExpiration}
                        />
                        <Form.Text className="text-muted">
                          The poll will automatically close at this date and time
                        </Form.Text>
                      </Form.Group>
                    )}

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                        className="mt-3"
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                          </>
                        ) : (
                          'Update Poll'
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => navigate('/dashboard')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default EditPoll;

