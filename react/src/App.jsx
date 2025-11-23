import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Header } from './components/Header';
import { Home } from './components/Home';
import { Register } from './components/Register';
import { Login } from './components/Login';
import { Profile } from './components/Profile';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

  return (
    <div data-easytag="id1-src/App.jsx" className="app-root">
      <Header />
      <main className="app-main">
        <div className="app-main-inner">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
