import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { getAuthMember, getAuthToken, saveAuth } from '../../authStorage';

export const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existingToken = getAuthToken();
    const existingMember = getAuthMember();

    if (existingToken && existingMember) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login({ username, password });
      saveAuth({ token: data.token, member: data.member });
      navigate('/', { replace: true });
    } catch (err) {
      let message = 'Неверное имя пользователя или пароль.';

      if (err && err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (typeof data.username === 'string') {
          message = data.username;
        } else if (Array.isArray(data.username) && data.username.length > 0) {
          message = data.username[0];
        }
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-easytag="id1-src/components/Login/index.jsx" className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-username" className="auth-label">
              Имя пользователя
            </label>
            <input
              id="login-username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Введите имя пользователя"
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-label">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Нет аккаунта? </span>
          <Link to="/register">Создать аккаунт</Link>
        </div>
      </div>
    </div>
  );
};
