import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Prices from './components/Prices.jsx';
import Advice from './components/Advice.jsx';
import Weather from './components/Weather.jsx';
import Identify from './components/Identify.jsx';
import History from './components/History.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import { useAuth } from './context/useAuth.js';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const { logout, token } = useAuth();
  const [isNewUser, setIsNewUser] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsNewUser(false);
    localStorage.removeItem('token');
  };

  const getRedirectPath = () => {
    if (!isLoggedIn && isNewUser) return '/signup';
    if (!isLoggedIn) return '/login';
    return '/home';
  };

  return (
    <div className="p-4">
      <nav className="mb-4">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded ml-4">
            Logout
          </button>
        ) : null}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prices"
          element={
            <ProtectedRoute>
              <Prices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advice"
          element={
            <ProtectedRoute>
              <Advice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />
        <Route
          path="/identify"
          element={
            <ProtectedRoute>
              <Identify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={getRedirectPath()} />} />
      </Routes>
    </div>
  );
};

export default App;