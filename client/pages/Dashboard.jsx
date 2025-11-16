import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || 'user';
    
    // Redirect based on role
    if (role === 'admin') {
      // Will render AdminDashboard
    } else {
      // Will render UserDashboard
    }
  }, [navigate]);

  const role = localStorage.getItem('role') || 'user';

  // Render appropriate dashboard based on role
  if (role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;