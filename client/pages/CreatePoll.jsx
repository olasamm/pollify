import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['General', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Business', 'Education', 'Health', 'Food', 'Travel', 'Other'];

  useEffect(() => {
    const role = localStorage.getItem('role') || 'user';
    if (role !== 'admin') {
      setMessage('Only admins can create polls. Redirecting...');
      setMessageType('error');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [navigate]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
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

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setMessage('Please provide at least 2 options');
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
      const response = await api.post('/api/polls', {
        title: title.trim(),
        description: description.trim(),
        category: category,
        options: validOptions.map(opt => opt.trim()),
        expiresAt: hasExpiration && expiresAt ? expiresAt : null
      });

      if (response.status === 201) {
        setMessage('Poll created successfully!');
        setMessageType('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to create poll. Please try again.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center my-4">
          <h4 className="mb-0">Create New Poll</h4>
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
                          : 'bg-danger text-white'
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

                    <Form.Label>Poll Options *</Form.Label>
                    {options.map((option, index) => (
                      <Form.Group key={index} className="mb-2 d-flex">
                        <Form.Control
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          required={index < 2}
                        />
                        {options.length > 2 && (
                          <Button
                            variant="outline-danger"
                            className="ms-2"
                            onClick={() => removeOption(index)}
                            type="button"
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        )}
                      </Form.Group>
                    ))}

                    {options.length < 10 && (
                      <Button
                        variant="outline-primary"
                        className="mb-3"
                        onClick={addOption}
                        type="button"
                      >
                        <i className="bi bi-plus me-1"></i> Add Option
                      </Button>
                    )}

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
                            Creating...
                          </>
                        ) : (
                          'Create Poll'
                        )}
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

export default CreatePoll;


