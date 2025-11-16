import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';
import DashboardCards from '../component/DashboardCards';
import CountdownTimer from '../component/CountdownTimer';
import CategoryBadge from '../component/CategoryBadge';
import CategoryFilter from '../component/CategoryFilter';
import { Table, Badge, Button, Spinner, Card, Row, Col, Modal } from 'react-bootstrap';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [name, setName] = useState('Admin'); 
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchPolls();
  }, []);

  const fetchProfile = async () => {
    try {
      // Try to fetch from backend first
      try {
        const response = await api.get('/api/user/profile');
        setName(response.data.name || 'Admin');
        setAvatar(response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name || 'Admin')}&background=dc3545&color=fff&size=200`);
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
          const userName = storedName || user.name || 'Admin';
          setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc3545&color=fff&size=200`);
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
      const response = await api.get('/api/polls/admin/all');
      setPolls(response.data);
      setFilteredPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      if (error.response?.status === 403) {
        // Not admin, redirect to user dashboard
        navigate('/user-dashboard');
      }
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

  const handleViewResults = (pollId) => {
    navigate(`/results?id=${pollId}`);
  };

  const handleEditPoll = (pollId) => {
    navigate(`/edit-poll?id=${pollId}`);
  };

  const handleClearAllPollsClick = () => {
    setShowConfirmModal(true);
  };

  const handleClearAllPollsConfirm = async () => {
    setShowConfirmModal(false);
    
    try {
      const response = await api.delete('/api/polls');
      
      if (response.status === 200) {
        setPolls([]);
        setMessage(`All polls have been deleted successfully! (${response.data.deletedCount} polls deleted)`);
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting polls:', error);
      setMessage(error.response?.data?.error || 'Failed to delete polls. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center me-md-5 my-2">
            <div className="mb-2 mb-md-0">
              <h4 className="mb-0">Admin Dashboard</h4>
              <small className="text-muted">Manage polls, votes, and results</small>
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
                    border: '2px solid #dc3545',
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
          
          <DashboardCards />
          
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
          
          <Card className="mt-4">
            <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <h5 className="mb-0">Recent Polls with Results</h5>
              <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                <Button 
                  variant="danger" 
                  size="sm"
                  className="w-100 w-sm-auto"
                  onClick={handleClearAllPollsClick}
                  disabled={polls.length === 0}
                >
                  <i className="bi bi-trash me-1"></i> Clear All Polls
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-100 w-sm-auto"
                  onClick={() => navigate('/create-poll')}
                >
                  <i className="bi bi-plus-circle me-1"></i> Create New Poll
                </Button>
              </div>
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
                      {polls.length === 0 && (
                        <Button variant="primary" onClick={() => navigate('/create-poll')}>
                          Create Your First Poll
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th className="d-none d-md-table-cell">Category</th>
                              <th className="d-none d-lg-table-cell">Created By</th>
                              <th className="d-none d-md-table-cell">Created Date</th>
                              <th>Status</th>
                              <th className="d-none d-lg-table-cell">Expiration</th>
                              <th className="d-none d-sm-table-cell">Total Votes</th>
                              <th className="d-none d-xl-table-cell">Voters Count</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                        <tbody>
                          {filteredPolls.slice(0, 10).map((poll) => (
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
                              <td className="d-none d-lg-table-cell">{poll.createdByName || 'Unknown'}</td>
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
                              <td className="d-none d-xl-table-cell">{poll.voters?.length || 0}</td>
                              <td>
                                <div className="d-flex flex-column flex-sm-row gap-1 gap-sm-2">
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    className="w-100 w-sm-auto"
                                    onClick={() => handleViewResults(poll._id)}
                                  >
                                    <span className="d-none d-sm-inline">View </span>Results
                                  </Button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    className="w-100 w-sm-auto"
                                    onClick={() => handleEditPoll(poll._id)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        </Table>
                      </div>
                      {filteredPolls.length > 10 && (
                        <div className="text-center mt-3">
                          <small className="text-muted">Showing 10 of {filteredPolls.length} polls</small>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Clear All Polls Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-6 fs-md-5">Confirm Delete All Polls</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4">
          <Card className="border-danger">
            <Card.Body className="p-3">
              <Card.Title className="text-danger fs-6">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Warning!
              </Card.Title>
              <Card.Text className="small">
                Are you sure you want to delete <strong>ALL {polls.length} polls</strong>?
                <br /><br />
                This action <strong>cannot be undone</strong> and will permanently delete:
                <ul className="mt-2">
                  <li>All poll data</li>
                  <li>All vote records</li>
                  <li>All voter information</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
          <Button 
            variant="secondary" 
            className="w-100 w-sm-auto order-2 order-sm-1"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="w-100 w-sm-auto order-1 order-sm-2"
            onClick={handleClearAllPollsConfirm}
          >
            <i className="bi bi-trash me-1"></i>
            Yes, Delete All Polls
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminDashboard;

