import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css';
import signup from '../src/assets/signup.svg';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';
import { useState } from 'react';
import axios from 'axios';


const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !mail || !password) {
      setMessage("Please fill all the fields");
      setMessageType("error");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setMessageType("error");
      setTimeout(() => setMessage(""), 2000);
      return;
    }




    const allData = {name, mail, password}
    // console.log(allData);

    const url = "https://pollify-ugm2.onrender.com/signup";
    axios.post(url, allData)
    .then((res) => {
      console.log(res.data);
      if (res.status === 201) {
        setMessage("User Created Successfully");
        setMessageType("success"); 
        setTimeout(() => navigate("/Signin"), 2000); 
      }
    })
    .catch((err) => {
      console.log(err);
      setMessage("User Already Exists");
      setMessageType("error"); 
      setTimeout(() => setMessage(""), 2000);
    })

  }
  return (
     <> 
    <Navbar  />
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
        <form className="w-100" method='POST' action={Signup}>
  <div className="mb-3">
    <input 
      type="text" 
      className="form-control up rounded-md text-dark border-black focus:border-black focus:ring-black" 
      placeholder="Name" 
      value={name} 
      onChange={e => setName(e.target.value)}
    />
  </div>
  <div className="mb-3">
    <input 
      type="email" 
      className="form-control up rounded-md text-dark border-black focus:border-black focus:ring-black" 
      placeholder="Email" 
      value={mail} 
      onChange={e => setMail(e.target.value)}
    /> 
  </div>
  <div className="mb-3">
    <input 
      type="password" 
      className="form-control up rounded-md text-dark border-black focus:border-black focus:ring-black" 
      placeholder="Password" 
      value={password} 
      onChange={e => setPassword(e.target.value)} 
    />
  </div>
  <div className="d-grid">
    <button type="submit" className="btn sign rounded-pill text-light" onClick={handleSubmit}>SIGN UP</button>
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