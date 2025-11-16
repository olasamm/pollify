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
      <div className="flex-grow-1 p-3 p-md-4 bg-light">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center my-3 my-md-4 gap-2">
          <h4 className="mb-0">My Polls</h4>
          <Button 
            variant="primary" 
            size="sm"
            className="w-100 w-md-auto"
            onClick={() => navigate('/create-poll')}
          >
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
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th className="d-none d-md-table-cell">Category</th>
                  <th className="d-none d-lg-table-cell">Created Date</th>
                  <th>Status</th>
                  <th className="d-none d-sm-table-cell">Total Votes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
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
                    <td className="d-none d-lg-table-cell">{formatDate(poll.createdAt)}</td>
                    <td>
                      <Badge bg={poll.status === 'open' ? 'success' : 'secondary'}>
                        {poll.status === 'open' ? 'Open' : 'Closed'}
                      </Badge>
                    </td>
                    <td className="d-none d-sm-table-cell">{getTotalVotes(poll)}</td>
                    <td>
                      <div className="d-flex flex-column flex-sm-row gap-1 gap-sm-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100 w-sm-auto"
                          onClick={() => navigate(`/vote?id=${poll._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant={poll.status === 'open' ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          className="w-100 w-sm-auto"
                          onClick={() => handleToggleStatus(poll)}
                        >
                          {poll.status === 'open' ? 'Close' : 'Open'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="w-100 w-sm-auto"
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
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-6 fs-md-5">Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            Are you sure you want to delete the poll <strong>"{pollToDelete?.title}"</strong>? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
            <Button 
              variant="secondary" 
              className="w-100 w-sm-auto order-2 order-sm-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="w-100 w-sm-auto order-1 order-sm-2"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MyPolls;


