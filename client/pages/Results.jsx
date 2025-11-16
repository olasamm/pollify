import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, ProgressBar } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import CountdownTimer from '../component/CountdownTimer';
import WinnerAnnouncement from '../component/WinnerAnnouncement';
import SharePoll from '../component/SharePoll';
import CategoryBadge from '../component/CategoryBadge';
import Comments from '../component/Comments';
import api from '../src/utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pollId = searchParams.get('id');
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showWinnerAnnouncement, setShowWinnerAnnouncement] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      setMessage('Only admins can view detailed results');
      setMessageType('error');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    if (pollId) {
      fetchPoll();
    } else {
      setMessage('No poll ID provided');
      setMessageType('error');
      setLoading(false);
    }
  }, [pollId, navigate]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      // Try to get from admin endpoint first (includes voters)
      try {
        const adminResponse = await api.get('/api/polls/admin/all');
        const poll = adminResponse.data.find(p => p._id === pollId);
        if (poll) {
          setPoll(poll);
          checkPollExpiration(poll);
        } else {
          // Fallback to regular endpoint
          const response = await api.get(`/api/polls/${pollId}`);
          setPoll(response.data);
          checkPollExpiration(response.data);
        }
      } catch (adminError) {
        // Fallback to regular endpoint if admin endpoint fails
        const response = await api.get(`/api/polls/${pollId}`);
        setPoll(response.data);
        checkPollExpiration(response.data);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      setMessage('Failed to load poll results');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const checkPollExpiration = (pollData) => {
    if (pollData.expiresAt) {
      const now = new Date().getTime();
      const expiration = new Date(pollData.expiresAt).getTime();
      if (now >= expiration && !pollExpired) {
        setPollExpired(true);
        // Auto-show winner announcement if poll just expired
        const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
        if (totalVotes > 0) {
          setShowWinnerAnnouncement(true);
        }
      }
    }
  };

  const handleCountdownExpire = () => {
    setPollExpired(true);
    fetchPoll(); // Refresh poll data
    // Check if there are votes before showing announcement
    if (poll) {
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
      if (totalVotes > 0) {
        setShowWinnerAnnouncement(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar />
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="d-flex vh-100">
        <Sidebar />
        <div className="flex-grow-1 p-4 bg-light">
          <Card className="bg-danger text-white">
            <Card.Body className="p-4">
              <Card.Title>Poll Not Found</Card.Title>
              <Card.Text>The poll you're looking for doesn't exist.</Card.Text>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const totalVoters = poll.voters?.length || 0;

  const handleDeletePoll = async (pollId) => {
    try {
      await api.delete(`/api/polls/${pollId}`);
      setMessage('Poll deleted successfully');
      setMessageType('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete poll');
      setMessageType('error');
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center my-4">
          <div>
            <h4 className="mb-0">Poll Results</h4>
            <small className="text-muted">Detailed voting statistics</small>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {message && (
          <Card 
            className={`mb-3 ${
              messageType === 'error' 
                ? 'bg-danger text-white' 
                : 'bg-info text-white'
            }`}
          >
            <Card.Body className="p-3">
              <p className="mb-0">{message}</p>
            </Card.Body>
          </Card>
        )}

        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <Card className="shadow mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-2">{poll.title}</h5>
                    <CategoryBadge category={poll.category} />
                  </div>
                  {poll.expiresAt && (
                    <CountdownTimer 
                      expiresAt={poll.expiresAt} 
                      onExpire={handleCountdownExpire}
                    />
                  )}
                </Card.Header>
                <Card.Body className="p-4">
                  {poll.description && (
                    <p className="text-muted mb-4">{poll.description}</p>
                  )}

                  <div className="mb-4">
                    <Row>
                      <Col md={4}>
                        <Card className="text-center bg-light">
                          <Card.Body>
                            <h6 className="text-muted">Total Votes</h6>
                            <h3 className="mb-0 text-primary">{totalVotes}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center bg-light">
                          <Card.Body>
                            <h6 className="text-muted">Total Voters</h6>
                            <h3 className="mb-0 text-success">{totalVoters}</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center bg-light">
                          <Card.Body>
                            <h6 className="text-muted">Status</h6>
                            <h3 className="mb-0">
                              <span className={`badge ${poll.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                                {poll.status === 'open' ? 'Open' : 'Closed'}
                              </span>
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  {poll.expiresAt && (
                    <div className="mb-4">
                      <Card className="bg-warning text-dark">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Expiration Date:</strong> {new Date(poll.expiresAt).toLocaleString()}
                            </div>
                            <CountdownTimer 
                              expiresAt={poll.expiresAt} 
                              onExpire={handleCountdownExpire}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  )}

                  <WinnerAnnouncement
                    poll={poll}
                    show={showWinnerAnnouncement}
                    onClose={() => {
                      setShowWinnerAnnouncement(false);
                    }}
                    autoAnnounce={true}
                  />

                  <h6 className="mb-3">Voting Results:</h6>
                  {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                    const isWinner = totalVotes > 0 && option.votes === Math.max(...poll.options.map(opt => opt.votes)) && option.votes > 0;
                    
                    return (
                      <div key={index} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <span className="fw-bold me-2">{option.text}</span>
                            {isWinner && (
                              <span className="badge bg-success">Winner</span>
                            )}
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{option.votes} votes</div>
                            <small className="text-muted">{percentage}%</small>
                          </div>
                        </div>
                        <ProgressBar 
                          now={parseFloat(percentage)} 
                          label={`${percentage}%`}
                          variant={isWinner ? 'success' : 'primary'}
                          style={{ height: '30px' }}
                          className="mb-2"
                        />
                      </div>
                    );
                  })}

                  {totalVoters > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3">Voter Information:</h6>
                      <div className="bg-light p-3 rounded">
                        <small className="text-muted">
                          {totalVoters} {totalVoters === 1 ? 'person has' : 'people have'} voted on this poll
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    {totalVotes > 0 && (
                      <Button 
                        variant="success" 
                        onClick={() => setShowWinnerAnnouncement(true)}
                        className="me-2 mb-2"
                      >
                        <i className="bi bi-megaphone-fill me-2"></i>
                        Announce Winner
                      </Button>
                    )}
                    <Button 
                      variant="info" 
                      onClick={() => setShowShareModal(true)}
                      className="me-2 mb-2"
                    >
                      <i className="bi bi-share-fill me-2"></i>
                      Share Poll
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/dashboard')}
                      className="me-2 mb-2"
                    >
                      Back to Dashboard
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this poll?')) {
                          handleDeletePoll(poll._id);
                        }
                      }}
                      className="mb-2"
                    >
                      Delete Poll
                    </Button>
                  </div>

                  <SharePoll
                    poll={poll}
                    show={showShareModal}
                    onClose={() => setShowShareModal(false)}
                  />
                </Card.Body>
              </Card>

              {/* Comments Section */}
              <Comments pollId={poll._id} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Results;

