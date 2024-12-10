// src/pages/TradePage.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Radio, message, Card, InputNumber } from 'antd';
import axios from 'axios';
import './TradePage.css';

const SYMBOL_MAP = {
  BTC: 'XBT/USD',
  ETH: 'ETH/USD',
  LTC: 'LTC/USD',
};

const TradePage = () => {
  const [form] = Form.useForm();
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [countdown, setCountdown] = useState(5);

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'direction',
      key: 'direction',
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
    fetchCurrentPrice(); // Call it immediately
    setCountdown(5); // Reset countdown

    const priceInterval = setInterval(() => {
      fetchCurrentPrice();
      setCountdown(5); // Reset countdown after refresh
    }, 5000);

    return () => clearInterval(priceInterval);
  }, [selectedSymbol]);

  useEffect(() => {
    const timer =
      countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const fetchCurrentPrice = async () => {
    try {
      const symbol = SYMBOL_MAP[selectedSymbol];
      const response = await axios.get(`/market/price?symbol=${encodeURIComponent(symbol)}`);
      setCurrentPrice(response.data.price);
    } catch (error) {
      console.error('Failed to fetch current price:', error);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const response = await axios.get(`/trades/symbol/${selectedSymbol}`);
      setTradeHistory(response.data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const endpoint = tradeType === 'buy' ? '/trades/buy' : '/trades/sell';
      const response = await axios.post(endpoint, null, {
        params: {
          userId: localStorage.getItem('userId'),
          symbol: selectedSymbol,
          amount: values.amount,
        },
      });
      
      message.success(`${tradeType.toUpperCase()} order executed successfully`);
      form.resetFields();
      fetchTradeHistory();
    } catch (error) {
      message.error(`Failed to execute ${tradeType} order`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-page">
      <Card className="trade-card">
        <div className="price-display">
          Current Price: ${currentPrice ? Number(currentPrice).toLocaleString() : '---'}
          <br />
          Next refresh in: {countdown} seconds
        </div>
        <Radio.Group
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          buttonStyle="solid"
        >
          {Object.keys(SYMBOL_MAP).map((currency) => (
            <Radio.Button key={currency} value={currency}>
              {currency}
            </Radio.Button>
          ))}
        </Radio.Group>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { 
                validator: (_, value) => {
                  if (value > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Amount must be positive');
                }
              }
            ]}
          >
            <InputNumber 
              min={0.000001}
              step={0.000001}
              style={{ width: '100%' }}
              placeholder="Enter amount to trade"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={tradeType === 'buy' ? 'buy-button' : 'sell-button'}
              block
            >
              {tradeType.toUpperCase()}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Trade History" className="history-card">
        <Table
          columns={columns}
          dataSource={tradeHistory}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

    
    </div>
  );
};

export default TradePage;