import React from 'react'
import { Link } from 'react-router-dom'
import './Signup.css';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';
import signin from '../src/assets/signin.svg';

const Signin = () => {
  return (
    <>
     <Navbar />
    <div className="container-fluid vh-100">
    <div className="row h-100">

      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
        <h3 className="mb-4">Create Account</h3>

        <form className="w-75" method='POST' action={Signin}>
          <div className="mb-3">
            <input type="email" className="form-control up rounded-pill" placeholder="Email" /> 
          </div>
          <div className="mb-3">
            <input type="password" className="form-control up rounded-pill" placeholder="Password"  />
          </div>
          <div className="d-grid">
            <button type="submit"  className="btn sign rounded-pill text-light">SIGN UP</button>
          </div>
        </form>
      </div>





      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-white welcome p-5">
        <h3 className="text-center">Welcometo Website</h3>
        <img src={signin} alt="" srcset="" className='w-75'/>
        <p className="mt-3">New here</p>
       <Link to="/signup"><button className="btn btn-dark rounded-pill px-4">SIGN UP</button></Link> 
      </div>

    </div>
  </div>

  <Footer />
    </>
  )
}

export default Signin