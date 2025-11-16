import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Card, Modal, Spinner } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import CategoryBadge from '../component/CategoryBadge';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const MyPolls = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchMyPolls();
  }, []);

  const fetchMyPolls = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await api.get('/api/polls/my');
      setPolls(response.data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load polls';
      setMessage(errorMessage);
      setMessageType('error');
      // If it's a 403 or 401, the user might not be authenticated or authorized
      if (error.response?.status === 403) {
        setMessage('You do not have permission to view polls. Only admins can create polls.');
      } else if (error.response?.status === 401) {
        setMessage('Please log in to view your polls.');
      }
    } finally {
      setLoading(false);
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

  const handleDeleteClick = (poll) => {
    setPollToDelete(poll);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pollToDelete) return;

    try {
      await api.delete(`/api/polls/${pollToDelete._id}`);
      setMessage('Poll deleted successfully');
      setMessageType('success');
      setShowDeleteModal(false);
      setPollToDelete(null);
      fetchMyPolls();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete poll');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggleStatus = async (poll) => {
    try {
      const newStatus = poll.status === 'open' ? 'closed' : 'open';
      await api.put(`/api/polls/${poll._id}`, { status: newStatus });
      setMessage(`Poll ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
      setMessageType('success');
      fetchMyPolls();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update poll status');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar />
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center my-4">
          <h4 className="mb-0">My Polls</h4>
          <Button variant="primary" onClick={() => navigate('/create-poll')}>
            <i className="bi bi-plus-circle me-1"></i> Create New Poll
          </Button>
        </div>

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

        {polls.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <Card.Title>No Polls Yet</Card.Title>
              <Card.Text className="text-muted mb-4">
                You haven't created any polls yet. Create your first poll to get started!
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/create-poll')}>
                Create Your First Poll
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Total Votes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => (
                <tr key={poll._id}>
                  <td>{poll.title}</td>
                  <td>
                    <CategoryBadge category={poll.category} />
                  </td>
                  <td>{formatDate(poll.createdAt)}</td>
                  <td>
                    <Badge bg={poll.status === 'open' ? 'success' : 'secondary'}>
                      {poll.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                  </td>
                  <td>{getTotalVotes(poll)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/vote?id=${poll._id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant={poll.status === 'open' ? 'outline-warning' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleStatus(poll)}
                      >
                        {poll.status === 'open' ? 'Close' : 'Open'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(poll)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the poll "{pollToDelete?.title}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MyPolls;


