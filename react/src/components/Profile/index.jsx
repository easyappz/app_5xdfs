import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMember } from '../../api/auth';
import { clearAuth, getAuthMember, getAuthToken, saveAuth } from '../../authStorage';

export const Profile = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedMember = getAuthMember();

    if (!token || !storedMember) {
      clearAuth();
      navigate('/login', { replace: true });
      return;
    }

    setMember(storedMember);

    const loadProfile = async () => {
      try {
        const freshMember = await getCurrentMember();
        setMember(freshMember);
        saveAuth({ token, member: freshMember });
        setIsLoading(false);
      } catch (err) {
        if (err && err.response && err.response.status === 401) {
          clearAuth();
          navigate('/login', { replace: true });
        } else {
          setError('Не удалось загрузить профиль. Попробуйте обновить страницу.');
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    if (isLoading) {
      return <p>Загрузка профиля...</p>;
    }

    if (error) {
      return <p className="auth-error">{error}</p>;
    }

    if (!member) {
      return <p>Пользователь не найден.</p>;
    }

    let createdAtText = '';
    if (member.created_at) {
      try {
        const date = new Date(member.created_at);
        createdAtText = date.toLocaleString('ru-RU');
      } catch (e) {
        createdAtText = member.created_at;
      }
    }

    return (
      <>
        <h1 className="auth-title">Профиль пользователя</h1>
        <div className="profile-info">
          <p>
            <strong>Имя пользователя:</strong> {member.username}
          </p>
          {createdAtText && (
            <p>
              <strong>Дата регистрации:</strong> {createdAtText}
            </p>
          )}
        </div>
        <button type="button" className="auth-button" onClick={handleLogout}>
          Выйти
        </button>
      </>
    );
  };

  return (
    <div data-easytag="id1-src/components/Profile/index.jsx" className="auth-page">
      <div className="auth-card">
        {renderContent()}
      </div>
    </div>
  );
};
