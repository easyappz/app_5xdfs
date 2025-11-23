import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getAuthMember, getAuthToken } from '../../authStorage';

export const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    const member = getAuthMember();

    if (token && member) {
      setIsAuthenticated(true);
      setUsername(member.username || '');
    } else {
      setIsAuthenticated(false);
      setUsername('');
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login', { replace: true });
  };

  return (
    <header
      data-easytag="id1-src/components/Header/index.jsx"
      className="app-header"
    >
      <div className="app-header-inner">
        <div className="app-header-left">
          <Link to="/" className="app-logo">
            Групповой чат
          </Link>
        </div>
        <nav className="app-nav">
          <Link to="/" className="app-nav-link">
            Чат
          </Link>
          <Link to="/profile" className="app-nav-link">
            Профиль
          </Link>
          {isAuthenticated ? (
            <>
              {username && (
                <span className="app-nav-user">{username}</span>
              )}
              <button
                type="button"
                className="app-nav-button"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="app-nav-link">
                Войти
              </Link>
              <Link to="/register" className="app-nav-link app-nav-link-primary">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
