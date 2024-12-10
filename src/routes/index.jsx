import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import Profile from '../pages/Profile.jsx';
import TradePage from '../pages/TradePage.jsx';
const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage  />} />
      <Route path="/profile" element={<Profile  />} />
      <Route path="/trade" element={<TradePage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
