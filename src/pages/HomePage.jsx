// Import necessary libraries and components
import React, { useState, useEffect, useRef } from 'react';
import { Menu ,Table, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SvgLine from '../components/exchange/SvgLine';
import SvgIndex from '../components/exchange/SvgIndex';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';
import './HomePage.css';

// Import icons from @ant-design/icons
import {
  StarOutlined,
  StarFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HomeOutlined, // Add icons to use with the Menu
  UserOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const HomePage = () => {
  const [lineValues, setLineValues] = useState(Array(60).fill(0));
  const [trendData, setTrendData] = useState({
    highest: 0,
    lowest: 0,
    close: 0,
    volume: 0,
  });
  const [loading, setLoading] = useState(false);
  const [FAQList, setFAQList] = useState([]);
  const [CNYRate, setCNYRate] = useState(null);
  const [dataIndex, setDataIndex] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [coins, setCoins] = useState({
    _map: {},
    USDT: [],
    USDT2: [],
    BTC: [],
    BTC2: [],
    ETH: [],
    ETH2: [],
    favor: [],
  });
  const [indexBtn] = useState([
    { text: 'Favorites' },
    { text: 'USDT' },
    { text: 'BTC' },
    { text: 'ETH' },
  ]);
  const [chosenBtn, setChosenBtn] = useState(0);
  const [picList, setPicList] = useState([]);
  const [picShow, setPicShow] = useState(false);
  const svgIndexRef = useRef(null);
  const trendPanelRef = useRef(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state

  useEffect(() => {
    init();
    // Uncomment the following code if you need to display your widget
    // zE('webWidget', 'show');
    // zE('webWidget', 'setLocale', 'zh_CN');
    return () => {
      // zE('webWidget', 'hide');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize data
  const init = () => {
    loadPicData();
    handleTabClick(1);
    loadDataPage(1);
    getCNYRate();
    getSymbol();
  };
  // Handle login/logout click
  const handleLoginLogout = () => {
    if (isLoggedIn) {
      // Handle logout logic
      setIsLoggedIn(false);
      message.success('Logged out successfully');
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  // Load carousel image data
  const loadPicData = () => {
    const params = {
      sysAdvertiseLocation: 1,
      lang: 'CN',
    };
    axios.post('/uc/ancillary/system/advertise', params).then((response) => {
      const result = response.data;
      if (result.code === 0 && result.data.length > 2) {
        setPicList(result.data);
        setPicShow(true);
        setTimeout(() => {
          initSwiper();
        }, 1000);
      } else {
        setPicShow(false);
      }
    });
  };

  // Initialize Swiper carousel
  const initSwiper = () => {
    const swiper = new Swiper('.swiper-container', {
      loop: true,
      autoplay: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      slidesPerView: 4,
      spaceBetween: 25,
    });
    const container = document.getElementById('swiper_container');
    container.onmouseenter = () => {
      swiper.autoplay.stop();
    };
    container.onmouseleave = () => {
      swiper.autoplay.start();
    };
  };

  // Load announcement data
  const loadDataPage = (pageIndex) => {
    const params = {
      pageNo: pageIndex,
      pageSize: 6,
      lang: 'CN',
    };
    axios.post('/uc/announcement/page', params).then((response) => {
      const resp = response.data;
      if (resp.code === 0) {
        const faqListTemp = resp.data.content;
        setFAQList(faqListTemp.slice(0, Math.min(3, resp.data.totalElements)));
      } else {
        message.error(resp.message);
      }
    });
  };

  // Get the CNY exchange rate
  const getCNYRate = () => {
    axios.post('/market/exchange-rate/usd-cny').then((response) => {
      setCNYRate(response.data.data);
    });
  };

  // Fetch market data
  const getSymbol = () => {
    setLoading(true);
    axios.post('/market/symbol-thumb-trend', {}).then((response) => {
      const resp = response.data;
      const newCoins = { ...coins };
      const coinMap = {};
      resp.forEach((coinData) => {
        const coin = {
          ...coinData,
          price: coinData.close,
          rose:
            coinData.chg > 0
              ? `+${(coinData.chg * 100).toFixed(2)}%`
              : `${(coinData.chg * 100).toFixed(2)}%`,
          coin: coinData.symbol.split('/')[0],
          base: coinData.symbol.split('/')[1],
          href: coinData.symbol.replace('/', '_').toLowerCase(),
          isFavor: false,
        };
        coinMap[coin.symbol] = coin;

        if (coin.zone === 0) {
          newCoins[coin.base].push(coin);
        } else {
          newCoins[`${coin.base}2`].push(coin);
        }

        if (coin.symbol === 'BTC/USDT') {
          setTrendData({
            highest: coin.high,
            lowest: coin.low,
            volume: coin.volume,
            close: coin.close,
            rose:
              coin.chg > 0
                ? `+${(coin.chg * 100).toFixed(2)}%`
                : `${(coin.chg * 100).toFixed(2)}%`,
          });
        }
      });
      newCoins._map = coinMap;
      setCoins(newCoins);
      if (isLogin()) {
        getFavor();
      }
      startWebsocket();
      setLoading(false);
    });

    loadTrendData();
  };

  // Load trend data
  const loadTrendData = () => {
    axios.post('/market/btc/trend', {}).then((response) => {
      setLineValues(response.data.data);
      // Update the SvgIndex component
      if (svgIndexRef.current && trendPanelRef.current) {
        svgIndexRef.current.reload(
          response.data.data,
          trendPanelRef.current.offsetWidth,
          trendPanelRef.current.offsetWidth / 8
        );
      }
    });
  };

  // Check if the user is logged in
  const isLogin = () => {
    const user = localStorage.getItem('user');
    return !!user;
  };

  // Get the user's favorite coins
  const getFavor = () => {
    axios.post('/exchange/favor/find', {}).then((response) => {
      const resp = response.data;
      const newCoins = { ...coins };
      resp.forEach((item) => {
        const coin = getCoin(item.symbol);
        if (coin) {
          coin.isFavor = true;
          newCoins.favor.push(coin);
        }
      });
      setCoins(newCoins);
    });
  };

  // Get coin info based on the symbol
  const getCoin = (symbol) => {
    return coins._map[symbol];
  };

  // Start WebSocket connection for real-time updates
  const startWebsocket = () => {
    // Implement your WebSocket connection here
    // and update coin data accordingly
  };

  // Handle market tab click event
  const handleTabClick = (index) => {
    setChosenBtn(index);
    if (index === 0) {
      setDataIndex(coins.favor);
    } else if (index === 1) {
      setDataIndex(coins.USDT);
    } else if (index === 2) {
      setDataIndex(coins.BTC);
    } else if (index === 3) {
      setDataIndex(coins.ETH);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchKey(value);
    let filteredData = [];
    if (chosenBtn === 0) {
      filteredData = coins.favor.filter((item) => item.symbol.startsWith(value));
    } else if (chosenBtn === 1) {
      filteredData = coins.USDT.filter((item) => item.symbol.startsWith(value));
    } else if (chosenBtn === 2) {
      filteredData = coins.BTC.filter((item) => item.symbol.startsWith(value));
    } else if (chosenBtn === 3) {
      filteredData = coins.ETH.filter((item) => item.symbol.startsWith(value));
    }
    setDataIndex(filteredData);
  };

  // Table column configuration
  const columns = [
    {
      title: 'Favorites',
      align: 'center',
      dataIndex: 'collection',
      width: 60,
      render: (text, record) => (
        <span onClick={(e) => handleFavoriteClick(e, record)}>
          {record.isFavor ? (
            <StarFilled style={{ color: '#f0a70a', fontSize: '18px' }} />
          ) : (
            <StarOutlined style={{ color: '#f0a70a', fontSize: '18px' }} />
          )}
        </span>
      ),
    },
    {
      title: 'Trading Pair',
      dataIndex: 'symbol',
      align: 'center',
      width: 90,
      render: (text, record) => (
        <span>
          {record.coin}/{record.base}
        </span>
      ),
    },
    {
      title: 'Latest Price',
      dataIndex: 'price',
      align: 'center',
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
      render: (text, record) => {
        const CNYRateValue = CNYRate || 6.5;
        const rmb = (record.usdRate * CNYRateValue).toFixed(2);
        return (
          <div className="price-td">
            <span>{record.price}</span>
            <span className="price-rmb"> ≈ ¥{rmb}</span>
            {parseFloat(record.rose) >= 0 ? (
              <ArrowUpOutlined style={{ color: 'green', marginLeft: '5px' }} />
            ) : (
              <ArrowDownOutlined style={{ color: 'red', marginLeft: '5px' }} />
            )}
          </div>
        );
      },
    },
    {
      title: 'Change (%)',
      dataIndex: 'rose',
      align: 'center',
      sorter: (a, b) => parseFloat(a.rose) - parseFloat(b.rose),
      render: (text) => (
        <span style={{ color: parseFloat(text) >= 0 ? 'green' : 'red' }}>{text}</span>
      ),
    },
    {
      title: 'Highest Price',
      dataIndex: 'high',
      align: 'center',
    },
    {
      title: 'Lowest Price',
      dataIndex: 'low',
      align: 'center',
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      align: 'center',
      sorter: (a, b) => parseFloat(a.volume) - parseFloat(b.volume),
    },
    {
      title: 'Price Trend',
      align: 'center',
      render: (text, record) => (
        <SvgLine
          values={record.trend.length > 0 ? record.trend : Array(25).fill(0)}
          rose={record.rose}
          width={100}
          height={25}
        />
      ),
    },
    {
      title: 'Action',
      align: 'center',
      render: (text, record) => (
        <div>
          <span
            style={{ cursor: 'pointer', color: '#f0a70a', padding: '2px 8px' }}
            onClick={() => navigate(`/exchange/${record.href}`)}
          >
            Trade
          </span>
        </div>
      ),
    },
  ];

  // Handle favorite click event
  const handleFavoriteClick = (e, record) => {
    e.stopPropagation();
    if (!isLogin()) {
      message.warning('Please log in first');
      return;
    }
    if (record.isFavor) {
      cancelFavorite(record);
    } else {
      addFavorite(record);
    }
  };

  // Add to favorites
  const addFavorite = (record) => {
    axios.post('/exchange/favor/add', { symbol: record.symbol }).then((response) => {
      const resp = response.data;
      if (resp.code === 0) {
        message.success('Added to favorites');
        const newCoins = { ...coins };
        const coin = getCoin(record.symbol);
        coin.isFavor = true;
        newCoins.favor.push(coin);
        setCoins(newCoins);
      } else {
        message.error(resp.message);
      }
    });
  };

  // Remove from favorites
  const cancelFavorite = (record) => {
    axios.post('/exchange/favor/delete', { symbol: record.symbol }).then((response) => {
      const resp = response.data;
      if (resp.code === 0) {
        message.success('Removed from favorites');
        const newCoins = { ...coins };
        const coin = getCoin(record.symbol);
        coin.isFavor = false;
        newCoins.favor = newCoins.favor.filter((item) => item.symbol !== record.symbol);
        setCoins(newCoins);
      } else {
        message.error(resp.message);
      }
    });
  };

  return (
    <div>
      {/* Menu Bar */}
      <Menu mode="horizontal" theme="dark" style={{ lineHeight: '64px' }}>
        <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
          Home
        </Menu.Item>
        <Menu.Item key="favorites" icon={<StarOutlined />} onClick={() => navigate('/favorites')}>
          Favorites
        </Menu.Item>
        <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
          Profile
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
          Settings
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
          Settings
        </Menu.Item>
        <Menu.Item
          key="login"
          icon={isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />}
          onClick={handleLoginLogout}
          style={{ marginLeft: 'auto' }} // Push to the right
        >
          {isLoggedIn ? 'Logout' : 'Login'}
        </Menu.Item>
      </Menu>
      <div id="fullpage">
        <div
          style={{
            backgroundImage: 'linear-gradient(135deg, #F0A70A 10%, #0D25B9 100%)',
            textAlign: 'center',
            height: '30px',
            lineHeight: '30px',
            letterSpacing: '1px',
          }}
        >
        </div>
        <div id="pagetips" style={{ borderBottom: '1px solid rgb(28, 39, 58)' }}>
          <div className="topnav">
            <div className="carl">
              <div className="notice-list">
                {FAQList.map((item, index) => (
                  <div className="notice-item" key={index}>
                    <div className="cal_content">
                      <span></span>
                      <Link target="_blank" to={`/announcement/${item.id}`}>
                        [ {item.createTime} ] {item.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="more">
                <Link to="/announcement/0" target="_blank">
                  More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel section */}
        <div className="section" id="page1">
          <div className="spin-wrap banner-panel">
            <img style={{ height: '100%' }} src="../../assets/images/bannerbg.png" alt="Banner" />
            <p
              style={{
                textAlign: 'center',
                fontSize: '40px',
                color: '#fff',
                position: 'absolute',
                top: '70px',
                width: '100%',
                letterSpacing: '5px',
                textShadow: '0px 0px 10px #000000',
              }}
            >
              Trand Site
            </p>
            <p
              style={{
                textAlign: 'center',
                fontSize: '20px',
                color: '#828ea1',
                position: 'absolute',
                top: '130px',
                width: '100%',
                letterSpacing: '2px',
              }}
            >
              588 site
            </p>
            {picShow && (
              <div className="activity-list">
                <div className="swiper-container" id="swiper_container">
                  <div className="swiper-wrapper">
                    {picList.map((item, index) => (
                      <div className="swiper-slide" key={index}>
                        {item.linkUrl && item.linkUrl.trim() !== '' && item.linkUrl !== '1' ? (
                          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                            <div className="activity-item">
                              <img src={item.url} alt="Activity" />
                            </div>
                          </a>
                        ) : (
                          <div className="activity-item">
                            <img src={item.url} alt="Activity" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="swiper-pagination"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New user guide section */}
        <div id="pagetips" style={{ background: '#172636' }}>
          {/* Add your content here */}
        </div>

        {/* Trend data section */}
        <div className="section" style={{ padding: '0px 14%', paddingTop: '50px', background: '#141e2c' }}>
          <div
            ref={trendPanelRef}
            style={{
              width: '100%',
              borderTop: '1px solid #1e2834',
              borderLeft: '1px solid #1e2834',
              borderRight: '1px solid #1e2834',
              textAlign: 'center',
              padding: '50px 0 0 0',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#828ea1',
              }}
            >
              BTC/USDT trend
            </div>
            <SvgIndex ref={svgIndexRef} width={800} height={150} values={lineValues} style={{ marginBottom: '-5px' }} />
            <div
              style={{
                position: 'absolute',
                top: '50px',
                left: '20px',
                color: '#828ea1',
              }}
            >
              <span className="latest-price" style={{ fontSize: '40px', fontWeight: 'normal' }}>
                {trendData.close.toFixed(2)}
              </span>
              <span style={{ fontWeight: 'bold' }}>/USDT</span>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '20px',
                color: '#828ea1',
              }}
            >
              <span>Maximum price: {trendData.highest}</span>
              <span style={{ marginLeft: '15px' }}>Minimum price: {trendData.lowest}</span>
              <span style={{ marginLeft: '15px' }}>Rise and fall (24H): {trendData.rose}</span>
              <span style={{ marginLeft: '15px' }}>Trading volume (24H): {trendData.volume}</span>
            </div>
          </div>
        </div>

        {/* Market data section */}
        <div className="section" id="page2">
          <div className="page2nav">
            <div className="board-title" style={{ display: 'none' }}>
            Mainboard &nbsp; >>>
            </div>
            <ul className="brclearfix">
              {indexBtn.map((item, index) => (
                <li
                  key={index}
                  className={index === chosenBtn ? 'active' : ''}
                  onClick={() => handleTabClick(index)}
                >
                  {item.text}
                </li>
              ))}
              <li style={{ float: 'right', paddingRight: '6px' }}>
                <Input.Search placeholder="search" onChange={handleSearchChange} value={searchKey} />
              </li>
            </ul>
          </div>
          <div className="ptjy">
            <Table
              columns={columns}
              dataSource={dataIndex}
              className="tables"
              loading={loading}
              locale={{ emptyText: 'No data available' }}
            />
          </div>
        </div>

        {/* Other sections */}
        {/* Add other sections as needed */}
      </div>
    </div>
  );
};

export default HomePage;
