import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import CategoryBadge from './CategoryBadge';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const PollTable = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/api/polls');
      // Get only the 10 most recent polls
      setPolls(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching polls:', error);
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

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Recent Polls</h5>
        <Button variant="primary" onClick={() => navigate('/create-poll')}>
          <i className="bi bi-plus-circle me-1"></i> Create New Poll
        </Button>
      </div>
      {polls.length === 0 ? (
        <div className="text-center p-5">
          <p className="text-muted">No polls available yet.</p>
          <Button variant="primary" onClick={() => navigate('/create-poll')}>
            Create Your First Poll
          </Button>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Total Votes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {polls.map((poll) => (
              <tr key={poll._id}>
                <td>{poll.title}</td>
                <td>
                  <CategoryBadge category={poll.category} />
                </td>
                <td>{poll.createdByName || 'Unknown'}</td>
                <td>{formatDate(poll.createdAt)}</td>
                <td>
                  <Badge bg={poll.status === 'open' ? 'success' : 'secondary'}>
                    {poll.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                </td>
                <td>{getTotalVotes(poll)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/vote?id=${poll._id}`)}
                    disabled={poll.status === 'closed'}
                  >
                    {poll.status === 'open' ? 'Vote' : 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default PollTable;
