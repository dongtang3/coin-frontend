// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Menu, Tabs, Carousel, Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import KLineChart from '../components/KLineChart';
import {
  StarOutlined,
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './HomePage.css';

const { TabPane } = Tabs;

const HomePage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [klineData, setKlineData] = useState([]);
   // Symbol mapping from frontend to backend
   const SYMBOL_MAP = {
    BTC: 'XBT/USD',
    ETH: 'ETH/USD',
    LTC: 'LTC/USD',
    // Add more mappings as needed
  };
  // Resolution mapping
  const RESOLUTIONS = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1d': '1D'
  };

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setUserEmail(email);
    }
    fetchMarketData();
    fetchKlineData(selectedCurrency);
  }, []);

  useEffect(() => {
    fetchKlineData(selectedCurrency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurrency]);

  // Fetch market data from backend API
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/market/symbol'); // Relative path
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      message.error('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };
    // Fetch KLine data from backend API
    const fetchKlineData = async (currency) => {
      const symbol = SYMBOL_MAP[currency] || 'XBT/USD';
      const resolution = '1m'; // Example resolution
      const to = Math.floor(Date.now() / 1000); // Current time in seconds
      const from = to - 60 * 60; // 1 hour ago
  
      try {
        const response = await axios.get('/market/history', {
          params: {
            symbol: symbol,
            from: from,
            to: to,
            resolution: resolution,
          },
        });
        setKlineData(response.data);
      } catch (error) {
        console.error('Error fetching KLine data:', error);
        message.error('Failed to fetch KLine data');
      }
    };
  


    const handleTabChange = (currency) => {
      setSelectedCurrency(currency);
      // KLine data will be fetched automatically via useEffect
    };
  

  const handleLoginLogout = () => {
    if (userEmail) {
      Modal.confirm({
        title: 'Confirm Logout',
        content: 'Are you sure you want to logout?',
        onOk: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('email');
          setUserEmail('');
          message.success('Logged out successfully');
          navigate('/login');
        },
      });
    } else {
      navigate('/login');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => text.toUpperCase(),
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => `$${Number(price).toLocaleString()}`,
    },
    {
      title: 'Market Cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      render: (cap) => `$${Number(cap).toLocaleString()}`,
    },
  ];

  return (
    <div className="homepage-container">
      <Menu theme="light" mode="horizontal">
        <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
          Home
        </Menu.Item>
        <Menu.Item
          key="favorites"
          icon={<StarOutlined />}
          onClick={() => navigate('/favorites')}
        >
          Favorites
        </Menu.Item>
        <Menu.Item
          key="profile"
          icon={<UserOutlined />}
          onClick={() => navigate('/profile')}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          key="login"
          icon={userEmail ? <LogoutOutlined /> : <LoginOutlined />}
          onClick={handleLoginLogout}
          style={{ marginLeft: 'auto' }}
        >
          {userEmail ? userEmail : 'Login'}
        </Menu.Item>
      </Menu>

      {/* Header Tabs for multiple currencies */}
      <Tabs defaultActiveKey="BTC" onChange={handleTabChange} centered>
        <TabPane tab="BTC" key="BTC" />
        <TabPane tab="ETH" key="ETH" />
        <TabPane tab="LTC" key="LTC" />
        {/* Add more tabs for other currencies */}
      </Tabs>
      {/* Add KLine Chart */}
      <div className="kline-chart-container">
        <KLineChart data={klineData} />
      </div>
      {/* Carousel for announcements or market updates */}
      <Carousel autoplay className="announcement-carousel">
        <div>
          <h3>Welcome to Our Crypto Platform!</h3>
        </div>
        <div>
          <h3>Latest Market Trends</h3>
        </div>
        <div>
          <h3>Join Our Community</h3>
        </div>
        <div>
          <h3>Secure Your Investments</h3>
        </div>
      </Carousel>

      {/* Market Data Table */}
      <Table
        dataSource={marketData}
        loading={loading}
        columns={columns}
        rowKey="symbol"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default HomePage;