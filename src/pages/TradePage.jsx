// src/pages/TradePage.jsx
import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Table, Radio, message, Card } from 'antd';
import axios from 'axios';
import './TradePage.css';

const SYMBOL_MAP = {
  BTC: 'XBT/USD',
  ETH: 'ETH/USD',
  LTC: 'LTC/USD',
  // Add more mappings as needed
};

const TradePage = () => {
  const [form] = Form.useForm();
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [countdown, setCountdown] = useState(5);
  const [wallet, setWallet] = useState({
    usdtBalance: 0,
    coinBalances: {},
  });

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => text.toLowerCase(),
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => Number(amount).toFixed(8),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${Number(price).toLocaleString()}`,
    },
  ];

  useEffect(() => {
    fetchTradeHistory();
    fetchCurrentPrice();
    fetchWalletBalance();
    setCountdown(5);

    const priceInterval = setInterval(() => {
      fetchCurrentPrice();
      setCountdown(5);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(priceInterval);
  }, [selectedSymbol]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const fetchCurrentPrice = async () => {
    try {
      const symbol = SYMBOL_MAP[selectedSymbol];
      const response = await axios.get(`/market/price?symbol=${encodeURIComponent(symbol)}`);
      setCurrentPrice(response.data.price);
    } catch (error) {
      console.error('Failed to fetch current price:', error);
      message.error('Failed to fetch current price');
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Authentication required. Please log in.');
        return;
      }

      const response = await axios.get('/trades/user/trades', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTradeHistory(response.data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      message.error('Failed to fetch trade history');
    }
  };

  // Updated fetchWalletBalance to retrieve all balances
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Authentication required. Please log in.');
        return;
      }

      const response = await axios.get('/trades/wallet/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setWallet({
          usdtBalance: response.data.usdtBalance,
          coinBalances: response.data.coinBalances,
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      message.error('Failed to fetch wallet balance');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const endpoint = tradeType === 'buy' ? '/trades/buy' : '/trades/sell';
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Please log in first');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        endpoint,
        {
          symbol: SYMBOL_MAP[selectedSymbol],
          amount: values.amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      message.success(`${tradeType === 'buy' ? 'Buy' : 'Sell'} order executed successfully`);
      form.resetFields();
      fetchTradeHistory();
      fetchWalletBalance();
    } catch (error) {
      console.error(`${tradeType === 'buy' ? 'Buy' : 'Sell'} trade failed:`, error);
      const errorMsg =
        error.response?.data?.message || `Failed to execute ${tradeType === 'buy' ? 'buy' : 'sell'} order`;
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Wallet Balances */}
      <Card style={{ marginBottom: '20px' }}>
        <h3>Wallet Balances:</h3>
        <p>USDT: {wallet.usdtBalance} USDT</p>
        {Object.entries(wallet.coinBalances).map(([symbol, balance]) => (
          <p key={symbol}>
            {symbol}: {balance} {symbol.split('/')[0]}
          </p>
        ))}
      </Card>

      {/* Trade Form */}
      <Form onFinish={onFinish} form={form} layout="vertical">
        {/* Trade Type Selector */}
        <Form.Item label="Trade Type">
          <Radio.Group onChange={(e) => setTradeType(e.target.value)} value={tradeType}>
            <Radio.Button value="buy">Buy</Radio.Button>
            <Radio.Button value="sell">Sell</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Symbol Selector */}
        <Form.Item label="Symbol" name="symbol" initialValue={selectedSymbol}>
          <Radio.Group onChange={(e) => setSelectedSymbol(e.target.value)}>
            {Object.keys(SYMBOL_MAP).map((currency) => (
              <Radio.Button key={currency} value={currency}>
                {currency}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* Amount Input */}
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: 'Please enter the amount' },
            {
              validator: (_, value) => {
                if (value > 0) {
                  return Promise.resolve();
                }
                return Promise.reject('Amount must be a positive number');
              },
            },
          ]}
        >
          <InputNumber
            min={0.000001}
            step={0.000001}
            style={{ width: '100%' }}
            placeholder="Enter amount to trade"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {tradeType === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </Form.Item>

        {/* Countdown Timer */}
        <Form.Item>
          <div>Next refresh in: {countdown} seconds</div>
        </Form.Item>
      </Form>

      {/* Trade History Table */}
      <Table
        dataSource={tradeHistory}
        loading={loading}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default TradePage;