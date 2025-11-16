import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Tab, Tabs, Table } from 'react-bootstrap';
import Sidebar from '../component/Sidebar';
import api from '../src/utils/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    mail: '',
    bio: '',
    avatar: '',
    role: 'user'
  });

  // Stats
  const [stats, setStats] = useState({
    pollsCreated: 0,
    totalVotes: 0,
    pollsVoted: 0
  });

  // User polls
  const [userPolls, setUserPolls] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchUserPolls();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Try to fetch from backend first
      try {
        const response = await api.get('/api/user/profile');
        const role = response.data.role || 'user';
        const bgColor = role === 'admin' ? 'dc3545' : '02021b';
        setProfile({
          name: response.data.name || '',
          mail: response.data.mail || '',
          bio: response.data.bio || '',
          avatar: response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name || 'User')}&background=${bgColor}&color=fff&size=200`,
          role: role
        });
        // Update localStorage
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('bio', response.data.bio || '');
        localStorage.setItem('avatar', response.data.avatar || '');
      } catch (apiError) {
        // If 401/403, token might be invalid - don't redirect here, let interceptor handle it
        if (apiError.response?.status === 401 || apiError.response?.status === 403) {
          // Let the axios interceptor handle the redirect
          throw apiError;
        }
        // For other errors, fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const storedName = localStorage.getItem('name') || '';
        const role = user.role || 'user';
        const bgColor = role === 'admin' ? 'dc3545' : '02021b';
        
        setProfile({
          name: storedName || user.name || '',
          mail: user.mail || '',
          bio: localStorage.getItem('bio') || '',
          avatar: localStorage.getItem('avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName || user.name || 'User')}&background=${bgColor}&color=fff&size=200`,
          role: role
        });
      }
    } catch (error) {
      // Only log non-auth errors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile');
        setMessageType('error');
      }
      // Auth errors will be handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/stats');
      const role = localStorage.getItem('role') || 'user';
      setStats({
        pollsCreated: role === 'admin' ? (response.data.userPolls || 0) : 0,
        totalVotes: response.data.totalVotes || 0,
        pollsVoted: 0 // This would need backend support
      });
    } catch (error) {
      // Don't redirect on error - just log and set defaults
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        console.error('Error fetching stats:', error);
      }
      setStats({
        pollsCreated: 0,
        totalVotes: 0,
        pollsVoted: 0
      });
    }
  };

  const fetchUserPolls = async () => {
    try {
      // Check if user is admin - only admins can create polls
      const role = localStorage.getItem('role') || 'user';
      if (role === 'admin') {
        const response = await api.get('/api/polls/my');
        setUserPolls(response.data || []);
      } else {
        // Regular users don't have polls, set empty array
        setUserPolls([]);
      }
    } catch (error) {
      // Don't redirect on error - just log and set empty array
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        console.error('Error fetching user polls:', error);
      }
      setUserPolls([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Compress and resize image
  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image is too large. Please select an image smaller than 5MB.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        e.target.value = ''; // Reset input
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        e.target.value = ''; // Reset input
        return;
      }

      try {
        setCompressingImage(true);
        setMessage('Compressing image...');
        setMessageType('info');
        
        // Compress the image
        const compressedImage = await compressImage(file);
        
        // Check compressed size (should be much smaller, but warn if still > 2MB)
        const base64Size = (compressedImage.length * 3) / 4; // Approximate size in bytes
        if (base64Size > 2 * 1024 * 1024) {
          setMessage('Warning: Image is still large after compression. Consider using a smaller image.');
          setMessageType('error');
          setTimeout(() => setMessage(''), 5000);
        } else {
          setMessage('Image compressed successfully!');
          setMessageType('success');
          setTimeout(() => setMessage(''), 2000);
        }
        
        setProfile(prev => ({
          ...prev,
          avatar: compressedImage
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        setMessage('Error processing image. Please try again.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        e.target.value = ''; // Reset input
      } finally {
        setCompressingImage(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      // Update backend first
      try {
        const response = await api.put('/api/user/profile', {
          name: profile.name,
          bio: profile.bio,
          avatar: profile.avatar
        });

        // Update localStorage with backend response
        localStorage.setItem('name', response.data.user.name);
        localStorage.setItem('bio', response.data.user.bio || '');
        localStorage.setItem('avatar', response.data.user.avatar || '');

        // Update user object in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.name = response.data.user.name;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (apiError) {
        // Fallback: update localStorage only if backend fails
        localStorage.setItem('name', profile.name);
        localStorage.setItem('bio', profile.bio);
        localStorage.setItem('avatar', profile.avatar);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.name = profile.name;
        localStorage.setItem('user', JSON.stringify(user));
        
        throw apiError;
      }

      setMessage('Profile updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.error || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setSaving(false);
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

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center my-4">
          <h4 className="mb-0">My Profile</h4>
          <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

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
              <div className="d-flex align-items-center">
                {compressingImage && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                <p className="mb-0">{message}</p>
              </div>
            </Card.Body>
          </Card>
        )}

        <Container fluid>
          <Row>
            <Col md={4}>
              <Card className="shadow mb-4">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                  <h4>{profile.name}</h4>
                  <Badge bg={profile.role === 'admin' ? 'danger' : 'primary'} className="mb-3">
                    {profile.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  <p className="text-muted mb-0">{profile.mail}</p>
                </Card.Body>
              </Card>

              <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">Statistics</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Polls Created:</span>
                      <strong>{stats.pollsCreated}</strong>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Votes:</span>
                      <strong>{stats.totalVotes}</strong>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Polls Voted:</span>
                      <strong>{stats.pollsVoted}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card className="shadow">
                <Card.Body>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                  >
                    <Tab eventKey="profile" title="Edit Profile">
                      <Form className="mt-3">
                        <Form.Group className="mb-3">
                          <Form.Label>Profile Picture</Form.Label>
                          <div className="d-flex align-items-center gap-3">
                            <div className="position-relative">
                              <img
                                src={profile.avatar}
                                alt="Avatar preview"
                                className="rounded"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              />
                              {compressingImage && (
                                <div className="position-absolute top-50 start-50 translate-middle">
                                  <Spinner animation="border" size="sm" variant="light" />
                                </div>
                              )}
                            </div>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              disabled={compressingImage}
                              style={{ maxWidth: '300px' }}
                            />
                          </div>
                          <Form.Text className="text-muted">
                            Upload an image (max 5MB). Images will be automatically compressed and resized to 400x400px.
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={profile.mail}
                            disabled
                            className="bg-light"
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Bio</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="bio"
                            value={profile.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            maxLength={500}
                          />
                          <Form.Text className="text-muted">
                            {profile.bio.length}/500 characters
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Avatar URL (Alternative)</Form.Label>
                          <Form.Control
                            type="url"
                            name="avatar"
                            value={profile.avatar}
                            onChange={handleInputChange}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </Form.Group>

                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={saving}
                          className="w-100"
                        >
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </Form>
                    </Tab>

                    <Tab eventKey="polls" title="My Polls">
                      <div className="mt-3">
                        {profile.role !== 'admin' ? (
                          <div className="text-center p-5">
                            <p className="text-muted">Only admins can create polls.</p>
                            <p className="text-muted small">Contact an administrator to create polls.</p>
                          </div>
                        ) : userPolls.length === 0 ? (
                          <div className="text-center p-5">
                            <p className="text-muted">You haven't created any polls yet.</p>
                            <Button variant="primary" onClick={() => navigate('/create-poll')}>
                              Create Your First Poll
                            </Button>
                          </div>
                        ) : (
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Created Date</th>
                                <th>Status</th>
                                <th>Total Votes</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userPolls.map((poll) => (
                                <tr key={poll._id}>
                                  <td>{poll.title}</td>
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
                                      onClick={() => navigate(`/results?id=${poll._id}`)}
                                      className="me-2"
                                    >
                                      View
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => navigate(`/edit-poll?id=${poll._id}`)}
                                    >
                                      Edit
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Profile;

