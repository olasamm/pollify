const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
dotenv.config();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in production, or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const port = process.env.PORT || 5000;
const URI = process.env.URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_KEY = process.env.ADMIN_KEY || 'ADMIN2025';

const User = require('./Model/userModel');
const Poll = require('./Model/pollModel');
const Comment = require('./Model/commentModel');

// MongoDB connection with better error handling and connection options
if (!URI) {
  console.error('MongoDB URI is not defined. Please set URI in environment variables.');
} else {
  // Connection options for better reliability
  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true,
    w: 'majority'
  };

  // Disable mongoose buffering (only if supported)
  try {
    mongoose.set('bufferCommands', false);
  } catch (e) {
    // Ignore if not supported in this Mongoose version
  }

  mongoose.connect(URI, mongooseOptions)
    .then(() => {
      console.log('✓ Connected to MongoDB successfully');
    })
    .catch((err) => {
      console.error('✗ Error connecting to MongoDB:', err.message);
      console.error('Please check your MongoDB connection string in environment variables.');
      console.error('Make sure your MongoDB Atlas IP whitelist includes 0.0.0.0/0 or Render\'s IP addresses.');
    });

  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected');
  });
}

// Middleware to check MongoDB connection before processing requests
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database connection not available. Please try again in a moment.',
      status: 'service_unavailable'
    });
  }
  next();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// User Registration
app.post('/signup', checkMongoConnection, async (req, res) => {
  try {
    const { name, mail, password, role, adminKey } = req.body;

    if (!name || !mail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate admin registration
    const requestedRole = role || 'user';
    if (requestedRole === 'admin') {
      if (!adminKey) {
        return res.status(400).json({ error: 'Admin key is required for admin registration' });
      }
      if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Invalid admin key' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      mail, 
      password: hashedPassword,
      role: requestedRole 
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mail: user.mail, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, mail: user.mail, role: user.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/signin', checkMongoConnection, async (req, res) => {
  try {
    const { mail, password, role } = req.body;

    if (!mail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ mail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Validate account type matches user's role
    const requestedRole = role || 'user';
    if (requestedRole !== user.role) {
      return res.status(403).json({ 
        error: `This account is registered as a ${user.role}. Please select "${user.role}" account type to login.` 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mail: user.mail, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'User signed in successfully',
      token,
      user: { id: user._id, name: user.name, mail: user.mail, role: user.role }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Poll (Admin only)
app.post('/api/polls', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, options, expiresAt } = req.body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 options are required' });
    }

    // Validate expiration date if provided
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      if (expirationDate <= now) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
    }

    const poll = new Poll({
      title,
      description: description || '',
      category: category || 'General',
      options: options.map(opt => ({ text: opt, votes: 0 })),
      createdBy: req.user.userId,
      createdByName: req.user.name,
      status: 'open',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await poll.save();
    res.status(201).json({ message: 'Poll created successfully', poll });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to auto-close expired polls
const checkAndCloseExpiredPolls = async () => {
  try {
    const now = new Date();
    const result = await Poll.updateMany(
      { 
        status: 'open',
        expiresAt: { $lte: now, $ne: null }
      },
      { status: 'closed' }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-closed ${result.modifiedCount} expired poll(s)`);
    }
  } catch (error) {
    console.error('Error checking expired polls:', error);
  }
};

// Check expired polls every minute
setInterval(checkAndCloseExpiredPolls, 60000);

// Get All Polls (Public - for voting)
app.get('/api/polls', async (req, res) => {
  try {
    // Check and close expired polls before fetching
    await checkAndCloseExpiredPolls();
    
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name mail')
      .select('-voters');
    
    res.status(200).json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Polls with Votes (Admin only)
app.get('/api/polls/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check and close expired polls before fetching
    await checkAndCloseExpiredPolls();
    
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name mail');
    
    res.status(200).json(polls);
  } catch (error) {
    console.error('Get admin polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User's Polls (Authenticated users - shows all polls they created)
app.get('/api/polls/my', authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(polls);
  } catch (error) {
    console.error('Get my polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Poll
app.get('/api/polls/:id', async (req, res) => {
  try {
    // Check and close expired polls before fetching
    await checkAndCloseExpiredPolls();
    
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name mail');
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on Poll
app.post('/api/polls/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll is expired
    await checkAndCloseExpiredPolls();
    await poll.populate('createdBy', 'name mail');
    
    if (poll.status === 'closed') {
      return res.status(400).json({ error: 'Poll is closed' });
    }

    // Check expiration
    if (poll.expiresAt && new Date(poll.expiresAt) <= new Date()) {
      poll.status = 'closed';
      await poll.save();
      return res.status(400).json({ error: 'Poll has expired' });
    }

    // Check if user already voted
    const hasVoted = poll.voters.some(
      voter => voter.userId.toString() === req.user.userId.toString()
    );

    if (hasVoted) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.voters.push({
      userId: req.user.userId,
      votedAt: new Date()
    });

    await poll.save();
    res.status(200).json({ message: 'Vote recorded successfully', poll });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Poll (Admin only)
app.put('/api/polls/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const { title, description, category, status, expiresAt } = req.body;
    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (category) poll.category = category;
    if (status) poll.status = status;
    
    // Handle expiration date
    if (expiresAt === null) {
      poll.expiresAt = null;
    } else if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      if (expirationDate <= now) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
      poll.expiresAt = expirationDate;
    }

    await poll.save();
    res.status(200).json({ message: 'Poll updated successfully', poll });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Poll (Admin only)
app.delete('/api/polls/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    await Poll.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete All Polls (Admin only)
app.delete('/api/polls', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Poll.deleteMany({});
    res.status(200).json({ 
      message: 'All polls deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      mail: user.mail,
      role: user.role,
      bio: user.bio || '',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=02021b&color=fff&size=200`,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mail: user.mail,
        role: user.role,
        bio: user.bio || '',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=02021b&color=fff&size=200`
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== COMMENT ENDPOINTS ==========

// Get Comments for a Poll
app.get('/api/polls/:id/comments', async (req, res) => {
  try {
    const pollId = req.params.id;
    const comments = await Comment.find({ 
      pollId, 
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar')
      .populate('likes.userId', 'name')
      .limit(100);
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Comment to Poll
app.post('/api/polls/:id/comments', authenticateToken, async (req, res) => {
  try {
    const pollId = req.params.id;
    const { text } = req.body;
    const user = await User.findById(req.user.userId);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
    }

    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const comment = new Comment({
      pollId,
      userId: req.user.userId,
      userName: user.name,
      userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=02021b&color=fff&size=200`,
      text: text.trim()
    });

    await comment.save();
    await comment.populate('userId', 'name avatar');

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit Comment
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('userId', 'name avatar');

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    const isOwner = comment.userId.toString() === req.user.userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = isAdmin ? 'admin' : 'user';

    await comment.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike Comment
app.post('/api/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user.userId;
    const likeIndex = comment.likes.findIndex(
      like => like.userId.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike - remove like
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like - add like
      comment.likes.push({ userId, likedAt: new Date() });
    }

    await comment.save();

    res.status(200).json({ 
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reply to Comment
app.post('/api/comments/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    const user = await User.findById(req.user.userId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Reply must be less than 500 characters' });
    }

    const reply = {
      userId: req.user.userId,
      userName: user.name,
      userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=02021b&color=fff&size=200`,
      text: text.trim(),
      createdAt: new Date()
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate('userId', 'name avatar');

    res.status(201).json({ message: 'Reply added successfully', comment });
  } catch (error) {
    console.error('Reply to comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Dashboard Stats (Role-based)
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ status: 'open' });
    
    // Calculate total votes
    const allPolls = await Poll.find();
    const totalVotes = allPolls.reduce((sum, poll) => {
      return sum + poll.options.reduce((optSum, opt) => optSum + opt.votes, 0);
    }, 0);

    // Admin gets all stats, users get limited stats
    if (req.user.role === 'admin') {
      const userPolls = await Poll.countDocuments({ createdBy: req.user.userId });
      res.status(200).json({
        totalPolls,
        activePolls,
        userPolls,
        totalVotes,
        role: 'admin'
      });
    } else {
      res.status(200).json({
        totalPolls,
        activePolls,
        totalVotes,
        role: 'user'
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Pollify API is running!',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check endpoint for detailed status
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: {
      nodeVersion: process.version,
      port: port
    }
  };
  res.json(healthStatus);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
