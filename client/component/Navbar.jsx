import React from 'react'
import './Navbar.css';
import { Link } from 'react-router-dom'
import { FaBarsStaggered } from "react-icons/fa6";

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
          <i className="fas fa-bars text-light"><FaBarsStaggered /></i> 
        </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav ms-auto">
              <a className="nav-link active text-light" aria-current="page" href="#">Home</a>
              <a className="nav-link text-light" href="#">Create Instant</a>
              <a className="nav-link text-light" href="#"> Features</a>
              <a className="nav-link text-light" href="#">Poll</a>
            </div>
            <div className="mx-5 d-flex flex-column flex-lg-row justify-content-md-start">
           <Link to="/Signin">
            <button className="btn btn-primary  my-1 my-lg-0 w-100 w-lg-auto" type="button">LOGIN</button>
          </Link> 
          <Link to="/Signup">
            <button className="btn btn-primary my-1 mx-2 my-lg-0 w-100 w-lg-auto" type="button">REGISTER</button>
          </Link>
          </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar