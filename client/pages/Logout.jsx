import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap'; // Import Bootstrap Spinner (optional)

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a delay for the logout process (e.g., clearing session data)
    const logoutTimer = setTimeout(() => {
      // Clear user data from localStorage
      localStorage.removeItem('name');
      localStorage.removeItem('avatar');
      localStorage.removeItem('token'); // If you use a token for authentication

      // Redirect to the login page
      navigate('/signin');
    }, 2000); // 2-second delay for better UX

    return () => clearTimeout(logoutTimer); // Cleanup timeout on component unmount
  }, [navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h3 className="mb-3">Logging out...</h3>
      <Spinner animation="border" variant="primary" /> {/* Bootstrap Spinner */}
    </div>
  );
};

export default Logout;