import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap'; 

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutTimer = setTimeout(() => {
      // Clear all user data
      localStorage.removeItem('name');
      localStorage.removeItem('avatar');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      // Redirect to the login page
      navigate('/signin');
    }, 1000); 

    return () => clearTimeout(logoutTimer); 
  }, [navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h3 className="mb-3">Logging out...</h3>
      <Spinner animation="border" variant="primary" /> 
    </div>
  );
};

export default Logout;