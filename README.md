# Pollify - Voting Platform

A full-stack voting/polling application built with React and Node.js. Create, manage, and vote on polls with real-time results.

## Features

### ✅ Implemented Features

1. **User Authentication**
   - Secure user registration and login
   - Password hashing with bcrypt
   - JWT token-based authentication
   - Protected routes

2. **Poll Management**
   - Create polls with custom title, description, and multiple options
   - View all polls on dashboard
   - View your own polls
   - Edit poll status (open/close)
   - Delete polls
   - Real-time vote counting

3. **Voting System**
   - Vote on open polls
   - Prevent duplicate voting
   - View poll results with visual progress bars
   - See vote counts and percentages

4. **Dashboard**
   - Real-time statistics (Total Polls, Active Polls, Votes Cast, My Polls)
   - Recent polls table
   - Quick access to create new polls

5. **User Interface**
   - Modern, responsive design
   - Bootstrap components
   - Loading states and error handling
   - Success/error notifications

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Bootstrap & React Bootstrap
- Axios for API calls
- Vite for build tooling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
ADMIN_KEY=ADMIN2025
```

**Note:** `ADMIN_KEY` is the registration key required to create admin accounts. Default is `ADMIN2025`. Change it to a secure key in production.

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:2000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:2000
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /signin` - Login user

### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/my` - Get user's polls (requires auth)
- `GET /api/polls/:id` - Get single poll
- `POST /api/polls` - Create poll (requires auth)
- `PUT /api/polls/:id` - Update poll (requires auth)
- `DELETE /api/polls/:id` - Delete poll (requires auth)
- `POST /api/polls/:id/vote` - Vote on poll (requires auth)

### Statistics
- `GET /api/stats` - Get dashboard statistics (requires auth)

## Project Structure

```
pollify/
├── client/                 # Frontend React application
│   ├── component/         # Reusable components
│   ├── pages/             # Page components
│   ├── src/
│   │   ├── utils/         # Utility functions (API client)
│   │   └── assets/        # Static assets
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── Model/            # Mongoose models
    ├── Schemas/          # Mongoose schemas
    └── index.js          # Express server
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Poll**: Click "Create Poll" to make a new poll
3. **Vote**: Browse polls and vote on them
4. **Manage**: View and manage your polls in "My Polls"
5. **Dashboard**: See statistics and recent polls

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Protected API routes
- Duplicate voting prevention
- User can only edit/delete their own polls

## Future Enhancements

Potential features to add:
- Poll expiration dates
- Poll categories/tags
- Search and filter polls
- Share polls via link
- Email notifications
- Poll analytics and charts
- User profiles
- Comments on polls

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please open an issue on the repository.


