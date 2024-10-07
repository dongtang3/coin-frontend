import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage  />} />
    </Routes>
  </Router>
);

export default AppRoutes;
