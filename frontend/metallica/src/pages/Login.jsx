import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import styles from '../styles/signup.module.css';
import Button from '../components/Button';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError('Email and password are required');
    }

    try {
      const url = `https://deploy-metallica-api.vercel.app/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });
      
      const result = await response.json();
      const { success, message, jwtToken, name, userId, error } = result;

      if (success) {
        handleSuccess(message);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('loggedInUser', name);
        localStorage.setItem('userId', userId);
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else if (error) {
        const details = error?.details?.[0]?.message;
        handleError(details || 'Error logging in');
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className={styles.background}>
      {/* Background video */}
      <video className={styles.video} autoPlay loop muted>
        <source src="/bgVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        {/* Use onSubmit for the form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email..."
              value={loginInfo.email}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your password..."
              value={loginInfo.password}
            />
          </div>
          {/* Button type='submit' so form submission triggers handleLogin */}
          <Button
            type="submit"
            label="Login"
            className={styles.signupButton}
          />
        </form>
        <span>
          Don't have an account? <Link to="/signup">Signup</Link>
        </span>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
