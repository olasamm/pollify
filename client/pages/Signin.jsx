import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';
import signin from '../src/assets/signin.svg';
import axios from 'axios';

const Signin = () => {
  const [mail, setMail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState(""); 
  const navigate = useNavigate(); 


const Submit = async (e) => {
  e.preventDefault();

  if (!mail || !password) {
      setMessage("Please fill all the fields");
      setMessageType("error");
      setTimeout(() => setMessage(""), 2000);
      return;
  }

  const allData = { mail, password };
  const url = "https://pollify-ugm2.onrender.com/signin";

  try {
      const res = await axios.post(url, allData);
      if (res.status === 200) {
          setMessage("User Signed In Successfully");
          setMessageType("success");
          setTimeout(() => navigate("/dashboard"), 2000);
      }
  } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
          setMessage(error.response.data.error);
      } else {
          setMessage("An unexpected error occurred");
      }
      setMessageType("error");

}
};

  return (
    <>
     <Navbar />
    <div className="container-fluid vh-100">
    <div className="row h-100">

      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
        <h3 className="mb-4">Create Account</h3>

        {message && (
  <p
    className={`alert mt-3 text-center ${
      messageType === "success" ? "alert-success" : "alert-danger"
    }`}
  >
    {message}
  </p>
)}

        <form className="w-75" method='POST' action={Signin}>
          <div className="mb-3">
            <input type="email" className="form-control up rounded-pill text-dark"  placeholder="Email" value={mail} onChange={e => setMail(e.target.value)}/> 
          </div>
          <div className="mb-3">
            <input type="password" className="form-control up rounded-pill text-dark" placeholder="Password"  value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          <div className="d-grid">
            <button type="submit"  className="btn sign rounded-pill text-light" onClick={Submit}>SIGN IN</button>
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
    <div>
  <Footer />
  </div>

    </>
  )
}

export default Signin