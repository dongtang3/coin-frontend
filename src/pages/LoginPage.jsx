import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const query = new URLSearchParams(location.search);
  const userKey = query.get('key');

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    // Send credential to backend for verification
    axios.post('http://localhost:8080/api/google-login', {
      credential: credentialResponse.credential,
    })
    .then((response) => {
      const resp = response.data;
      if (resp.code === 0) {
        message.success('Google Login successful');
        localStorage.setItem('user', JSON.stringify(resp.data));
        navigate('/dashboard');
      } else {
        message.error(resp.message);
      }
    })
    .catch((error) => {
      message.error('Google Login failed');
      console.error('Google Login Error:', error);
    });  
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failed:', error);
    message.error('Google Login failed');
  };

  return (
    <GoogleOAuthProvider clientId="985502286243-ge3o1guebh9ai0k7jce5cd5g8q319k10.apps.googleusercontent.com">
      <div style={{ maxWidth: '300px', margin: '0 auto', padding: '50px' }}>
        <h2>Login with Google</h2>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;