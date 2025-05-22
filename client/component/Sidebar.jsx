import React, { useState } from 'react';
import './Sidebar.css'; 
import { Nav, Button, Offcanvas } from 'react-bootstrap';

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
          <Nav.Link href="#" className="text-white mb-2">
            <i className="fas fa-home me-2"></i> Dashboard
          </Nav.Link>
          <Nav.Link href="#" className="text-white mb-2">
            <i className="fas fa-poll me-2"></i> My Polls
          </Nav.Link>
          <Nav.Link href="/Vote" className="text-white mb-2">
            <i className="fas fa-vote-yea me-2"></i> Vote
          </Nav.Link>
          <Nav.Link href="#" className="text-white mb-2">
            <i className="fas fa-chart-bar me-2"></i> Results
          </Nav.Link>
          <Nav.Link href="#" className="text-white mb-2">
            <i className="fas fa-cog me-2"></i> Settings
          </Nav.Link>
          <Nav.Link href="#" className="text-white">
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </Nav.Link>
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
            <Nav.Link href="#" className="text-white mb-2">
              <i className="fas fa-home me-2"></i> Dashboard
            </Nav.Link>
            <Nav.Link href="mypolls" className="text-white mb-2">
              <i className="fas fa-poll me-2"></i> My Polls
            </Nav.Link>
            <Nav.Link href="/vote" className="text-white mb-2">
              <i className="fas fa-vote-yea me-2"></i> Vote
            </Nav.Link>
            <Nav.Link href="/result" className="text-white mb-2">
              <i className="fas fa-chart-bar me-2"></i> Results
            </Nav.Link>
            <Nav.Link href="/settings" className="text-white mb-2">
              <i className="fas fa-cog me-2"></i> Settings
            </Nav.Link>
            <Nav.Link href="/logout" className="text-white">
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;