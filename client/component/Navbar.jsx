import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css';

const Navbar = () => {
  return (
    <>  
    
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand text-light mx-5 polly" href="#">POLLIFY </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav ms-auto">
              <a className="nav-link active text-light" aria-current="page" href="#">Home</a>
              <a className="nav-link text-light" href="#">Create Instant</a>
              <a className="nav-link text-light" href="#"> Features</a>
              <a className="nav-link text-light" href="#">Poll</a>
            </div>
            <div className="mx-5 d-flex flex-column flex-lg-row justify-content-md-start">
              <button className="btn btn-primary mx-2 my-1 my-lg-0" type="button">SignIn</button>
              <button className="btn btn-primary my-1 my-lg-0" type="button">SignUp</button>
          </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar