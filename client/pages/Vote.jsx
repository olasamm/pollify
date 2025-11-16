import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import CountdownTimer from '../component/CountdownTimer';
import WinnerAnnouncement from '../component/WinnerAnnouncement';
import SharePoll from '../component/SharePoll';
import CategoryBadge from '../component/CategoryBadge';
import Comments from '../component/Comments';
import api from '../src/utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Vote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pollId = searchParams.get('id');
  
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPoll, setLoadingPoll] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showWinnerAnnouncement, setShowWinnerAnnouncement] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      setLoadingPoll(true);
      let pollData = null;
      if (pollId) {
        const response = await api.get(`/api/polls/${pollId}`);
        pollData = response.data;
        setPoll(pollData);
        checkIfVoted(pollData);
      } else {
        // Get a random open poll
        const response = await api.get('/api/polls');
        const openPolls = response.data.filter(p => p.status === 'open');
        if (openPolls.length > 0) {
          const randomPoll = openPolls[Math.floor(Math.random() * openPolls.length)];
          pollData = randomPoll;
          setPoll(randomPoll);
          checkIfVoted(randomPoll);
        } else {
          setMessage('No open polls available');
          setMessageType('info');
        }
      }
      return pollData;
    } catch (error) {
      setMessage('Failed to load poll');
      setMessageType('error');
      return null;
    } finally {
      setLoadingPoll(false);
    }
  };

  const checkIfVoted = (pollData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      const voted = pollData.voters?.some(
        voter => voter.userId?.toString() === user.id.toString()
      );
      setHasVoted(voted);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    
    if (selectedOption === null) {
      setMessage('Please select an option');
      setMessageType('error');
      return;
    }

    if (!poll) {
      setMessage('Poll not found');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post(`/api/polls/${poll._id}/vote`, {
        optionIndex: selectedOption
      });

      if (response.status === 200) {
        setMessage('Vote recorded successfully!');
        setMessageType('success');
        setHasVoted(true);
        setPoll(response.data.poll);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to vote. Please try again.');
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
          <Card className="bg-info text-white">
            <Card.Body className="p-4">
              <Card.Title>No Poll Available</Card.Title>
              <Card.Text>There are no polls available to vote on at the moment.</Card.Text>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-3 p-md-4 bg-light">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center my-3 my-md-4">
          <h4 className="mb-2 mb-md-0">Vote on a Poll</h4>
          <Button variant="outline-secondary" size="sm" className="w-100 w-md-auto" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Container fluid>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <Card className="shadow">
                <Card.Body className="p-3 p-md-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1 mb-2 mb-md-0">
                      <Card.Title className="mb-2">{poll.title}</Card.Title>
                      <div className="mb-2">
                        <CategoryBadge category={poll.category} />
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => setShowShareModal(true)}
                        title="Share poll"
                      >
                        <i className="bi bi-share-fill"></i>
                      </Button>
                      {poll.expiresAt && (
                        <CountdownTimer 
                          expiresAt={poll.expiresAt}
                          onExpire={async () => {
                            setMessage('This poll has expired');
                            setMessageType('error');
                            const updatedPoll = await fetchPoll();
                            // Check if there are votes and show winner announcement
                            if (updatedPoll) {
                              const totalVotes = updatedPoll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0;
                              if (totalVotes > 0) {
                                setShowWinnerAnnouncement(true);
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {poll.description && (
                    <Card.Text className="text-muted mb-4">{poll.description}</Card.Text>
                  )}

                  <WinnerAnnouncement
                    poll={poll}
                    show={showWinnerAnnouncement}
                    onClose={() => {
                      setShowWinnerAnnouncement(false);
                      navigate('/dashboard');
                    }}
                    autoAnnounce={true}
                  />

                  {message && (
                    <Card 
                      className={`mb-3 ${
                        messageType === 'success' 
                          ? 'bg-success text-white' 
                          : messageType === 'info' 
                          ? 'bg-info text-white'
                          : 'bg-danger text-white'
                      }`}
                    >
                      <Card.Body className="p-3">
                        <p className="mb-0">{message}</p>
                      </Card.Body>
                    </Card>
                  )}

                  {hasVoted ? (
                    <div>
                      <Card className="bg-info text-white mb-3">
                        <Card.Body className="p-3">
                          <p className="mb-0">You have already voted on this poll.</p>
                        </Card.Body>
                      </Card>
                      <h6 className="mb-3">Poll Results:</h6>
                      {poll.options.map((option, index) => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                        return (
                          <div key={index} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span>{option.text}</span>
                              <span>{option.votes} votes ({percentage}%)</span>
                            </div>
                            <div className="progress" style={{ height: '25px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-center mt-4">
                        <Button variant="primary" onClick={() => navigate('/dashboard')}>
                          Back to Dashboard
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Form onSubmit={handleVote}>
                      <Form.Group className="mb-3">
                        {poll.options.map((option, index) => (
                          <Form.Check
                            key={index}
                            type="radio"
                            id={`option-${index}`}
                            label={option.text}
                            name="pollOption"
                            checked={selectedOption === index}
                            onChange={() => setSelectedOption(index)}
                            className="mb-2 p-3 border rounded"
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Form.Group>

                      <div className="text-center">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isLoading || selectedOption === null}
                          className="px-4"
                        >
                          {isLoading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Voting...
                            </>
                          ) : (
                            'Vote'
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}

                  <div className="mt-3 text-muted small text-center">
                    Created by {poll.createdByName || 'Unknown'} • {totalVotes} total votes
                  </div>
                </Card.Body>
              </Card>

              {/* Comments Section */}
              {poll && poll._id && (
                <Comments pollId={poll._id} />
              )}
            </Col>
          </Row>
        </Container>

        <SharePoll
          poll={poll}
          show={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </div>
    </div>
  );
};

export default Vote;
