import React from 'react'
import { FaPoll } from "react-icons/fa";
import { GiVote } from "react-icons/gi";
import { TbChartPieFilled } from "react-icons/tb";
import feature from '../src/assets/polls.svg';
import './Features.css';

const Features = () => {
  return (
    <>
        <div className="container-fluid text-center mt-5">
        <h1 className="text-light">Features</h1>
        </div>
   <div className="container-fluid text-center mt-5 ">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 border-0">
            <div className="card h-100 shadow-sm  bg-light">
              <div className="card-body p-3">
                <h5 className="card-title" > <FaPoll style={{ color: '#10002c', fontSize: '50px' }}  /></h5>
                <h5 className="card-title">Create Polls</h5>
                <p className="card-text">
                  Set up polls quickly and easily <br /> with our user-friendly interface.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 border-0">
            <div className="card h-100 shadow-sm  bg-light " >
              <div className="card-body p-3">
                <h5 className="card-title"><GiVote  style={{ color: '#10002c', fontSize: '50px' }}  /></h5>
                <h5 className="card-title">Vote Instantly</h5>
                <p className="card-text">
                  Participate in polls <br /> with a single click
                </p>
              </div>
            </div>
          </div>


          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 border-0">
            <div className="card h-100 shadow-sm  bg-light">
              <div className="card-body p-3">
                <h5 className="card-title"><TbChartPieFilled   style={{ color: '#10002c', fontSize: '50px' }}  /></h5>
                <h5 className="card-title">See Results</h5>
                <p className="card-text">
                  view real-time's <br /> as votes come in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className='container text-center mt-5'>
  <div className="row align-items-center">

    <div className="col-12 col-md-6">
      <h1 className="text-light">Create Polls</h1>
      <p className="mx-5 my-3 text-light fs-6 fs-md-5 text-md-start text-center">
        Set up polls quickly and easily with our user-friendly interface. Whether you're organizing a project, planning an event, or conducting research, Pollify makes it easy to design and share polls across any platform.  </p>
    </div>

    <div className="col-12 col-md-6">
      <img
        src={feature}
        alt="Poll illustration"
        className="img-fluid my-3 w-75"
      />
    </div>
  </div>
</div>
    </>
  )
}

export default Features