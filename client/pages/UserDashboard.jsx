import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';
import CountdownTimer from '../component/CountdownTimer';
import CategoryBadge from '../component/CategoryBadge';
import CategoryFilter from '../component/CategoryFilter';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [name, setName] = useState('User'); 
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchPolls();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      // Try to fetch from backend first
      try {
        const response = await api.get('/api/user/profile');
        setName(response.data.name || 'User');
        setAvatar(response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name || 'User')}&background=02021b&color=fff&size=200`);
        // Update localStorage
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('avatar', response.data.avatar || '');
      } catch (apiError) {
        // Fallback to localStorage if API fails
        const storedName = localStorage.getItem('name');
        if (storedName) {
          setName(storedName);
        }
        const storedAvatar = localStorage.getItem('avatar'); 
        if (storedAvatar) {
          setAvatar(storedAvatar);
        } else {
          // Use default avatar if none stored
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const userName = storedName || user.name || 'User';
          setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=02021b&color=fff&size=200`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage
      const storedName = localStorage.getItem('name');
      if (storedName) {
        setName(storedName);
      }
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await api.get('/api/polls');
      setPolls(response.data.slice(0, 10));
      setFilteredPolls(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPolls(polls);
    } else {
      setFilteredPolls(polls.filter(poll => poll.category === selectedCategory));
    }
  }, [selectedCategory, polls]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  const checkIfVoted = (poll) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id && poll.voters) {
      return poll.voters.some(
        voter => voter.userId?.toString() === user.id.toString()
      );
    }
    return false;
  };

  return (
    <>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center me-md-5 my-2">
            <div className="mb-2 mb-md-0">
              <h4 className="mb-0">Voting Dashboard</h4>
              <small className="text-muted">Browse and vote on polls</small>
            </div>
            <div className="d-flex align-items-center">
              <p className="mb-0 me-2 me-md-3 d-none d-sm-block">Hello, {name}!</p>
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate('/profile')}
                title="View Profile"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid #02021b',
                  }}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <Row className="mb-4 g-3">
            <Col xs={12} sm={6} md={4}>
              <Card bg="primary" text="white">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="fs-6">Total Polls</Card.Title>
                    <Card.Text className="fs-4 fw-bold">{stats.totalPolls}</Card.Text>
                  </div>
                  <i className="bi bi-bar-chart-fill fs-1 d-none d-sm-block"></i>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card bg="success" text="white">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="fs-6">Active Polls</Card.Title>
                    <Card.Text className="fs-4 fw-bold">{stats.activePolls}</Card.Text>
                  </div>
                  <i className="bi bi-check-circle-fill fs-1 d-none d-sm-block"></i>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card bg="info" text="white">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="fs-6">Total Votes</Card.Title>
                    <Card.Text className="fs-4 fw-bold">{stats.totalVotes}</Card.Text>
                  </div>
                  <i className="bi bi-people-fill fs-1 d-none d-sm-block"></i>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Available Polls to Vote</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                  {filteredPolls.length === 0 ? (
                    <div className="text-center p-5">
                      <p className="text-muted">
                        {polls.length === 0 
                          ? 'No polls available yet.' 
                          : `No polls found in ${selectedCategory} category.`}
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th className="d-none d-md-table-cell">Category</th>
                            <th className="d-none d-lg-table-cell">Description</th>
                            <th className="d-none d-md-table-cell">Created Date</th>
                            <th>Status</th>
                            <th className="d-none d-lg-table-cell">Expiration</th>
                            <th className="d-none d-sm-table-cell">Total Votes</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPolls.map((poll) => {
                            const hasVoted = checkIfVoted(poll);
                            return (
                              <tr key={poll._id}>
                                <td>
                                  <div className="fw-bold">{poll.title}</div>
                                  <div className="d-md-none small text-muted">
                                    <CategoryBadge category={poll.category} /> | {formatDate(poll.createdAt)}
                                  </div>
                                </td>
                                <td className="d-none d-md-table-cell">
                                  <CategoryBadge category={poll.category} />
                                </td>
                                <td className="d-none d-lg-table-cell">{poll.description || 'No description'}</td>
                                <td className="d-none d-md-table-cell">{formatDate(poll.createdAt)}</td>
                                <td>
                                  <Badge bg={poll.status === 'open' ? 'success' : 'secondary'}>
                                    {poll.status === 'open' ? 'Open' : 'Closed'}
                                  </Badge>
                                </td>
                                <td className="d-none d-lg-table-cell">
                                  {poll.expiresAt ? (
                                    <CountdownTimer expiresAt={poll.expiresAt} />
                                  ) : (
                                    <Badge bg="secondary">No expiration</Badge>
                                  )}
                                </td>
                                <td className="d-none d-sm-table-cell">{getTotalVotes(poll)}</td>
                                <td>
                                  <Button
                                    variant={hasVoted ? "outline-secondary" : "primary"}
                                    size="sm"
                                    className="w-100 w-sm-auto"
                                    onClick={() => navigate(`/vote?id=${poll._id}`)}
                                    disabled={poll.status === 'closed' || hasVoted}
                                  >
                                    {hasVoted ? 'Already Voted' : poll.status === 'open' ? 'Vote Now' : 'Closed'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;

