import React from 'react';
import './Error404.css';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';

const Error404 = () => {
  return (
    <>
    <Navbar />
    <div className="error404-container">
      <div className="error404-content">
        <h1 className="error404-title">404</h1>
        <p className="error404-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="error404-submessage">
          It might have been moved or deleted. Please check the URL or return to the homepage.
        </p>
        <button
          className="error404-button"
          onClick={() => (window.location.href = '/')}
        >
          Back to Homepage
        </button>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Error404;