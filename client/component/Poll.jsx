import React from 'react'
import { Link } from 'react-router-dom'
import './Poll.css';
import 'animate.css';
import poll from '../src/assets/selecting-team-animate.svg';
const Poll = () => {
  return (
    <>  
    

    <div className="container-fluid text-center mt-5">
        <div className="row align-items-center">
          <div className="col-12 col-md-6 my-5">
            <div className="wave-container">
              <h1 className="wave-text">
                <div className="text-light">
                  <span>C</span><span>R</span><span>E</span><span>A</span><span>T</span>
                  <span className="me-3">E</span><span>I</span><span>N</span><span>S</span>
                  <span>T</span><span>A</span><span>N</span><span>T</span>
                  <h3 className="my-2 animate__animated animate__flash">
                    Polls with Pollify
                  </h3>
                </div>
              </h1>
            </div>
            <p className="mx-5 my-3 text-light fs-6 fs-md-5 text-md-start text-center">
              Effortlessly create engaging polls and surveys to gather valuable feedback and insights. Whether you're organizing a project, planning an event, or conducting research, Pollify makes it easy to design and share polls across any platform.
            </p>
            <div className="d-flex justify-content-center justify-content-center">
            <Link to="/signup" >  <button type="button" className="btn btn-primary rounded-pill px-4 py-2">
                Create Your First Poll
              </button> </Link>
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
            <img
              src={poll}
              alt="Poll illustration"
              className="img-fluid my-3 w-75"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Poll