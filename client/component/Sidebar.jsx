import React, { useState } from 'react';
import './Sidebar.css'; 
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Sidebar = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        variant="primary"
        className="d-md-none mb-3"
        onClick={handleShow}
        style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 1050 }}
      >
        <i className="fas fa-bars"></i> 
      </Button>

      <div
        className="text-white vh-100 p-4 d-none d-md-block shadow position-relative"
        style={{ width: '280px', backgroundColor: 'rgb(2, 2, 27)' }}
      >
        <h3 className="my-5 text-center">Pollify</h3>
        <Nav defaultActiveKey="/dashboard" className="flex-column">
          <Link to="/dashboard" className="text-white mb-2 nav-link">
            <i className="fas fa-home me-2"></i> Dashboard
          </Link>
          <Link to="/mypolls" className="text-white mb-2 nav-link">
            <i className="fas fa-poll me-2"></i> My Polls
          </Link>
          <Link to="/vote" className="text-white mb-2 nav-link">
            <i className="fas fa-vote-yea me-2"></i> Vote
          </Link>
          <Link to="/results" className="text-white mb-2 nav-link">
            <i className="fas fa-chart-bar me-2"></i> Results
          </Link>
          <Link to="/settings" className="text-white mb-2 nav-link">
            <i className="fas fa-cog me-2"></i> Settings
          </Link>
          <Link to="/logout" className="text-white nav-link">
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </Link>
        </Nav>
      </div>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        style={{ backgroundColor: 'rgb(2, 2, 27)' }}
        className="text-white"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Pollify</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav defaultActiveKey="/dashboard" className="flex-column">
            <Link to="/dashboard" className="text-white mb-2 nav-link">
              <i className="fas fa-home me-2"></i> Dashboard
            </Link>
            <Link to="/mypolls" className="text-white mb-2 nav-link">
              <i className="fas fa-poll me-2"></i> My Polls
            </Link>
            <Link to="/vote" className="text-white mb-2 nav-link">
              <i className="fas fa-vote-yea me-2"></i> Vote
            </Link>
            <Link to="/results" className="text-white mb-2 nav-link">
              <i className="fas fa-chart-bar me-2"></i> Results
            </Link>
            <Link to="/settings" className="text-white mb-2 nav-link">
              <i className="fas fa-cog me-2"></i> Settings
            </Link>
            <Link to="/logout" className="text-white nav-link">
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;