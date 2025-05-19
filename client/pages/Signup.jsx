import React from 'react'
import { Link } from 'react-router-dom'
import './Signup.css';
import signup from '../src/assets/signup.svg';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';


const Signup = () => {
  return (
     <> 
    <Navbar  />
    <div className="container-fluid vh-100">
    <div className="row h-100">

      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
        <h3 className="mb-4">Create Account</h3>

        <form className="w-75" method='POST' action={Signup}>
          <div className="mb-3">
            <input type="text" className="form-control up rounded-pill" placeholder="Name" />
          </div>
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
        <h3 className="text-center">Welcome back to Website</h3>
        <img src={signup} alt="" srcset="" className='w-75'/>
        <p className="mt-3">Already have an account?</p>
     <Link to="/Signin">  <button className="btn btn-dark rounded-pill px-4"  > SIGN IN</button> </Link>
      </div>

    </div>
  </div>

  <Footer />
     </>
  )
}

export default Signup