import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Badge, Spinner, Modal, Dropdown } from 'react-bootstrap';
import api from '../src/utils/api';
import './Comments.css';

const Comments = ({ pollId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('role') || 'user';
  const userName = localStorage.getItem('name') || user.name || 'User';
  const userAvatar = localStorage.getItem('avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=02021b&color=fff&size=200`;

  useEffect(() => {
    if (pollId) {
      fetchComments();
    }
  }, [pollId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/polls/${pollId}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setMessage('Failed to load comments');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setMessage('Please enter a comment');
      setMessageType('error');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      const response = await api.post(`/api/polls/${pollId}/comments`, {
        text: newComment
      });

      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setMessage('Comment added successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add comment');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      setMessage('Please enter a comment');
      setMessageType('error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.put(`/api/comments/${commentId}`, {
        text: editText
      });

      setComments(comments.map(comment => 
        comment._id === commentId ? response.data.comment : comment
      ));
      setEditingCommentId(null);
      setEditText('');
      setMessage('Comment updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update comment');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await api.delete(`/api/comments/${commentToDelete._id}`);
      setComments(comments.filter(comment => comment._id !== commentToDelete._id));
      setShowDeleteModal(false);
      setCommentToDelete(null);
      setMessage('Comment deleted successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete comment');
      setMessageType('error');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      // Refresh comments to get updated like status
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      setMessage('Failed to like comment');
      setMessageType('error');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) {
      setMessage('Please enter a reply');
      setMessageType('error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/api/comments/${commentId}/reply`, {
        text: replyText
      });

      setComments(comments.map(comment => 
        comment._id === commentId ? response.data.comment : comment
      ));
      setReplyingToId(null);
      setReplyText('');
      setMessage('Reply added successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add reply');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const isCommentLiked = (comment) => {
    if (!user.id || !comment.likes || comment.likes.length === 0) return false;
    return comment.likes.some(like => {
      const likeUserId = typeof like === 'object' && like.userId 
        ? like.userId.toString() 
        : (typeof like === 'string' ? like : null);
      return likeUserId === user.id.toString();
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const canEditComment = (comment) => {
    return user.id && comment.userId?.toString() === user.id.toString();
  };

  const canDeleteComment = (comment) => {
    return user.id && (comment.userId?.toString() === user.id.toString() || userRole === 'admin');
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 text-muted">Loading comments...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="bg-light">
          <h6 className="mb-0">
            <i className="bi bi-chat-dots me-2"></i>
            Comments ({comments.length})
          </h6>
        </Card.Header>
        <Card.Body>
          {message && (
            <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} py-2 mb-3`}>
              {message}
            </div>
          )}

          {/* Add Comment Form */}
          {user.id ? (
            <Form onSubmit={handleAddComment} className="mb-4">
              <div className="d-flex gap-2">
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={1000}
                    disabled={submitting}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Form.Text className="text-muted">
                      {newComment.length}/1000 characters
                    </Form.Text>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          ) : (
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              Please log in to comment
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex gap-3">
                    <img
                      src={comment.userAvatar || comment.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName || 'User')}&background=02021b&color=fff&size=200`}
                      alt="Avatar"
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <strong>{comment.userName || comment.userId?.name || 'User'}</strong>
                          {comment.isEdited && (
                            <small className="text-muted ms-2">
                              <i className="bi bi-pencil"></i> edited
                            </small>
                          )}
                        </div>
                        {(canEditComment(comment) || canDeleteComment(comment)) && (
                          <Dropdown>
                            <Dropdown.Toggle variant="link" className="p-0 text-muted" style={{ textDecoration: 'none' }}>
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {canEditComment(comment) && (
                                <Dropdown.Item onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditText(comment.text);
                                }}>
                                  <i className="bi bi-pencil me-2"></i>Edit
                                </Dropdown.Item>
                              )}
                              {canDeleteComment(comment) && (
                                <Dropdown.Item 
                                  onClick={() => {
                                    setCommentToDelete(comment);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-danger"
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>

                      {editingCommentId === comment._id ? (
                        <div className="mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            maxLength={1000}
                            className="mb-2"
                          />
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditComment(comment._id)}
                              disabled={submitting}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-2">{comment.text}</p>
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <Button
                              variant="link"
                              size="sm"
                              className={`p-0 ${isCommentLiked(comment) ? 'text-danger' : 'text-muted'}`}
                              onClick={() => handleLikeComment(comment._id)}
                              disabled={!user.id}
                              style={{ textDecoration: 'none' }}
                            >
                              <i className={`bi ${isCommentLiked(comment) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                              <span className="ms-1">{comment.likes?.length || 0}</span>
                            </Button>
                            {user.id && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-muted"
                                onClick={() => {
                                  setReplyingToId(replyingToId === comment._id ? null : comment._id);
                                  setReplyText('');
                                }}
                              >
                                <i className="bi bi-reply"></i>
                                <span className="ms-1">Reply</span>
                              </Button>
                            )}
                            <small className="text-muted">
                              {formatDate(comment.createdAt)}
                            </small>
                          </div>

                          {/* Reply Form */}
                          {replyingToId === comment._id && (
                            <div className="ms-4 mt-2 p-3 bg-light rounded">
                              <Form onSubmit={(e) => {
                                e.preventDefault();
                                handleReply(comment._id);
                              }}>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  maxLength={500}
                                  className="mb-2"
                                />
                                <div className="d-flex gap-2">
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="primary"
                                    disabled={submitting || !replyText.trim()}
                                  >
                                    Reply
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => {
                                      setReplyingToId(null);
                                      setReplyText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Form>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ms-4 mt-2">
                              {comment.replies
                                .filter(reply => !reply.isDeleted)
                                .map((reply, idx) => (
                                  <div key={idx} className="mb-2 p-2 bg-light rounded">
                                    <div className="d-flex gap-2 align-items-start">
                                      <img
                                        src={reply.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName || 'User')}&background=02021b&color=fff&size=200`}
                                        alt="Avatar"
                                        className="rounded-circle"
                                        style={{ width: '30px', height: '30px', objectFit: 'cover', flexShrink: 0 }}
                                      />
                                      <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <strong className="small">{reply.userName}</strong>
                                          {reply.isEdited && (
                                            <small className="text-muted">
                                              <i className="bi bi-pencil"></i> edited
                                            </small>
                                          )}
                                        </div>
                                        <p className="mb-1 small">{reply.text}</p>
                                        <small className="text-muted">
                                          {formatDate(reply.createdAt)}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteComment}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Comments;

