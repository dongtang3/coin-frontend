import React, { useState } from 'react';
import { message, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false); // Switch between login and register
  const [registerData, setRegisterData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('http://localhost:8080/auth/authenticate', loginData)
      .then((response) => {
        const resp = response.data;
        if (resp.code === 0) {
          message.success('Login successful');
          localStorage.setItem('access_token', resp.accessToken);
          localStorage.setItem('refresh_token', resp.refreshToken);
          localStorage.setItem('email', resp.email);
          navigate('/');
        } else {
          message.error(resp.message);
        }
      })
      .catch((error) => {
        message.error('Login failed');
        console.error('Login Error:', error);
      });
  };

  const handleRegister = () => {
    if (registerData.password !== registerData.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    axios.post('http://localhost:8080/auth/register', registerData)
      .then((response) => {
        message.success('Registration successful');
        setIsRegistering(false); // Switch back to login
      })
      .catch((error) => {
        message.error('Registration failed');
        console.error('Registration Error:', error);
      });
  };

  return (
    <div style={{ maxWidth: '300px', margin: '0 auto', padding: '50px' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      
      {isRegistering ? (
        <>
          <Input
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <Input.Password
            placeholder="Password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <Input.Password
            placeholder="Confirm Password"
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <Button type="primary" onClick={handleRegister}>
            Register
          </Button>
          <p>
            Already have an account?{' '}
            <a onClick={() => setIsRegistering(false)}>Login here</a>
          </p>
        </>
      ) : (
        <>
          <Input
            placeholder="Email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <Input.Password
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <Button type="primary" onClick={handleLogin}>
            Login
          </Button>
          <p>
            Don't have an account?{' '}
            <a onClick={() => setIsRegistering(true)}>Register here</a>
          </p>
        </>
      )}
    </div>
  );
};

export default LoginPage;
