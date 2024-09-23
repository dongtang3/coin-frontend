
import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Form, Input, Button, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (values) => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      setLoading(false);
      console.log('Login Success:', values);
      navigate('/dashboard'); // 登录成功后跳转到仪表盘或主页
    }, 1000);
  };

  const handleLoginFailure = (error) => {
    console.error('Login Failed:', error);
    // 在这里处理登录失败后的逻辑
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div style={{ maxWidth: '300px', margin: '0 auto', padding: '50px' }}>
        <h2>Login</h2>
        <Form onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Or</p>
          <GoogleLogin
            onSuccess={(response) => {
              console.log('Google Login Success:', response);
              navigate('/dashboard'); // Google登录成功后跳转到仪表盘或主页
            }}
            onError={handleLoginFailure}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
