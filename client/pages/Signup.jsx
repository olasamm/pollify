import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css';
import signup from '../src/assets/signup.svg';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';
import { useState } from 'react';
import api from '../src/utils/api';


const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [adminKey, setAdminKey] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    setIsLoading(true);
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

    // Validate admin key if admin account is selected
    if (accountType === "admin" && !adminKey.trim()) {
      setMessage("Admin key is required for admin account");
      setMessageType("error");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const allData = {
      name, 
      mail, 
      password, 
      role: accountType,
      adminKey: accountType === "admin" ? adminKey : undefined
    };

    try {
      const res = await api.post('/signup', allData);
      if (res.status === 201) {
        // Store token and user info
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('name', res.data.user.name);
        localStorage.setItem('role', res.data.user.role || 'user');
        
        setMessage(`${accountType === 'admin' ? 'Admin' : 'User'} Account Created Successfully`);
        setMessageType("success"); 
        setTimeout(() => navigate("/dashboard"), 2000); 
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("An error occurred. Please try again.");
      }
      setMessageType("error"); 
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  }
  return (
     <> 
    <Navbar  />
    <div className="container-fluid vh-100">
    <div className="row h-100">

      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
        <h3 className="mb-4">Create Account</h3>
        
        {accountType === "admin" && (
          <div className="alert alert-warning mb-3 w-100 text-center">
            <strong>Admin Account Registration</strong>
            <br />
            <small>You are creating an admin account. Admin key is required.</small>
          </div>
        )}

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
  <div className="mb-3">
    <label className="form-label">Account Type</label>
    <select 
      className="form-control up rounded-md text-dark border-black focus:border-black focus:ring-black" 
      value={accountType}
      onChange={e => {
        setAccountType(e.target.value);
        setAdminKey(""); // Clear admin key when switching
      }}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  </div>
  {accountType === "admin" && (
    <div className="mb-3">
      <label className="form-label fw-bold">Admin Registration Key *</label>
      <input 
        type="password" 
        className="form-control up rounded-md text-dark border-warning focus:border-warning focus:ring-warning" 
        placeholder="Enter ADMIN2025 (or your custom admin key)" 
        value={adminKey} 
        onChange={e => setAdminKey(e.target.value)} 
        required
      />
      <small className="text-muted d-block mt-1">
        <i className="bi bi-shield-lock me-1"></i>
        Enter the admin registration key to create an admin account
      </small>
    </div>
  )}
  <div className="d-grid">
    <button type="submit" className="btn sign rounded-pill text-light" onClick={handleSubmit}>
      {isLoading ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        <span>REGISTER</span>
      )}
      </button>
  </div>
</form>
      </div>





      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-white welcome p-5">
        <h3 className="text-center">Welcome back to Website</h3>
        <img src={signup} alt="" srcset="" className='w-75'/>
        <p className="mt-3">Already have an account?</p>
     <Link to="/signin">  <button className="btn btn-dark rounded-pill px-4"  > LOGIN</button> </Link>
      </div>

    </div>
  </div>
    
  <Footer />
     </>
  )
}

export default Signup