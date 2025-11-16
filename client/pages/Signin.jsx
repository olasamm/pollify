import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';
import signin from '../src/assets/signin.svg';
import api from '../src/utils/api';

const Signin = () => {
  const [mail, setMail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [accountType, setAccountType] = useState("user");
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState(""); 
  const navigate = useNavigate(); 
  const [isLoading, setIsLoading] = useState(false);


const Submit = async (e) => {
  setIsLoading(true);
  e.preventDefault();

  if (!mail || !password) {
      setMessage("Please fill all the fields");
      setMessageType("error");
      setTimeout(() => setMessage(""), 2000);
      return;
  }

  const allData = { mail, password, role: accountType };

  try {
      const res = await api.post('/signin', allData);
      if (res.status === 200) {
          // Store token and user info
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('name', res.data.user.name);
          localStorage.setItem('role', res.data.user.role || 'user');
          
          const accountType = res.data.user.role === 'admin' ? 'Admin' : 'User';
          setMessage(`${accountType} Signed In Successfully`);
          setMessageType("success");
          setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            setMessage(error.response.data.error);
        } else {
            setMessage("An unexpected error occurred");
        }
        setMessageType("error");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
     <Navbar />
    <div className="container-fluid vh-100">
    <div className="row h-100">

      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
        <h3 className="mb-4">Login</h3>

        {accountType === "admin" && (
          <div className="alert alert-warning mb-3 w-100 text-center">
            <strong>Admin Login</strong>
            <br />
            <small>You are logging in as an administrator</small>
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

        <form className="w-100" method='POST' action={Signin}>
          <div className="mb-3">
            <input type="email" className="form-control up rounded-md text-dark"  placeholder="Email" value={mail} onChange={e => setMail(e.target.value)}/> 
          </div>
          <div className="mb-3">
            <input type="password" className="form-control up rounded-md text-dark" placeholder="Password"  value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label className="form-label">Login As</label>
            <select 
              className="form-control up rounded-md text-dark border-black focus:border-black focus:ring-black" 
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <small className="text-muted">Select the account type you want to login as</small>
          </div>
          <div className="d-grid">
            <button type="submit"  className="btn sign rounded-pill text-light" onClick={Submit}>
             {isLoading ?(
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
             ):(
              <span>LOGIN</span>
            )} 
               </button>
          </div>
        </form>
      </div>





      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-white welcome p-5">
        <h3 className="text-center">Welcometo Website</h3>
        <img src={signin} alt="" srcset="" className='w-75'/>
        <p className="mt-3">New here</p>
       <Link to="/signup"><button className="btn btn-dark rounded-pill px-4">REGISTER</button></Link> 
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