import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { getAuthMember, getAuthToken, saveAuth } from '../../authStorage';

export const Register = () => {
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
      const data = await register({ username, password });
      saveAuth({ token: data.token, member: data.member });
      navigate('/', { replace: true });
    } catch (err) {
      let message = 'Произошла ошибка при регистрации. Попробуйте ещё раз.';

      if (err && err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (typeof data.username === 'string') {
          message = data.username;
        } else if (Array.isArray(data.username) && data.username.length > 0) {
          message = data.username[0];
        } else if (Array.isArray(data.password) && data.password.length > 0) {
          message = data.password[0];
        } else {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const value = data[firstKey];
            if (typeof value === 'string') {
              message = value;
            } else if (Array.isArray(value) && value.length > 0) {
              message = value[0];
            }
          }
        }
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-easytag="id1-src/components/Register/index.jsx" className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="register-username" className="auth-label">
              Имя пользователя
            </label>
            <input
              id="register-username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Введите имя пользователя"
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password" className="auth-label">
              Пароль
            </label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="new-password"
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
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Уже есть аккаунт? </span>
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};
