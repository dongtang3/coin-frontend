// Profile.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8080/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        form.setFieldsValue({
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          email: response.data.email
        });
      } catch (error) {
        message.error('Failed to fetch profile data');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put('http://localhost:8080/users/profile', values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
 
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={userData}
      >
             <Form.Item
        label="First Name"
        name="firstname"
        rules={[{ required: true, message: 'Please input your first name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Last Name"
        name="lastname"
        rules={[{ required: true, message: 'Please input your last name!' }]}
      >
        <Input />
      </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { 
              required: true, 
              message: 'Please input your email!',
            },
            {
              type: 'email',
              message: 'Please enter a valid email!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { 
              required: false, 
              message: 'Please input your password!',
            },
            {
              min: 6,
              message: 'Password must be at least 6 characters!',
            },
          ]}
        >
          <Input.Password placeholder="Enter new password to change" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;