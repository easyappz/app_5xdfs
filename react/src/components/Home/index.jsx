import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/chat';
import { clearAuth, getAuthMember, getAuthToken } from '../../authStorage';

export const Home = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    const member = getAuthMember();

    if (token && member) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) {
        setIsLoadingMessages(false);
        setLoadError('Чтобы просматривать сообщения, войдите или зарегистрируйтесь.');
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      setLoadError('');

      try {
        const data = await getMessages();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err && err.response && err.response.status === 401) {
          clearAuth();
          setIsAuthenticated(false);
          setLoadError('Сессия истекла. Пожалуйста, войдите снова.');
        } else {
          setLoadError('Не удалось загрузить сообщения. Попробуйте обновить страницу.');
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };

    load();
  }, [isAuthenticated]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSendError('');

    if (!isAuthenticated) {
      setSendError('Чтобы отправлять сообщения, войдите или зарегистрируйтесь.');
      return;
    }

    const trimmed = newMessage.trim();
    if (!trimmed) {
      return;
    }

    setIsSending(true);

    try {
      const createdMessage = await sendMessage({ content: trimmed });
      setMessages((prev) => [...prev, createdMessage]);
      setNewMessage('');
    } catch (err) {
      if (err && err.response && err.response.status === 401) {
        clearAuth();
        setIsAuthenticated(false);
        setSendError('Сессия истекла. Пожалуйста, войдите снова.');
        navigate('/login', { replace: true });
      } else {
        setSendError('Не удалось отправить сообщение. Попробуйте ещё раз.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const renderMessages = () => {
    if (isLoadingMessages) {
      return <div className="chat-info">Загрузка сообщений...</div>;
    }

    if (loadError) {
      return <div className="chat-info chat-info-error">{loadError}</div>;
    }

    if (!messages.length) {
      return <div className="chat-info">Сообщений пока нет. Напишите первое сообщение!</div>;
    }

    return messages.map((message) => {
      const username =
        message.member && message.member.username
          ? message.member.username
          : 'Неизвестный пользователь';

      let createdAtText = '';
      if (message.created_at) {
        try {
          const date = new Date(message.created_at);
          createdAtText = date.toLocaleString('ru-RU');
        } catch (e) {
          createdAtText = message.created_at;
        }
      }

      return (
        <div key={message.id} className="chat-message">
          <div className="chat-message-header">
            <span className="chat-message-author">{username}</span>
            {createdAtText && (
              <span className="chat-message-time">{createdAtText}</span>
            )}
          </div>
          <div className="chat-message-content">{message.content}</div>
        </div>
      );
    });
  };

  const renderInputArea = () => {
    if (!isAuthenticated) {
      return (
        <div className="chat-auth-hint">
          <span>Чтобы отправлять сообщения, </span>
          <Link to="/login">войдите</Link>
          <span> или </span>
          <Link to="/register">зарегистрируйтесь</Link>
          <span>.</span>
        </div>
      );
    }

    return (
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          className="chat-input"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Введите сообщение..."
          rows={2}
        />
        {sendError && <div className="chat-info chat-info-error">{sendError}</div>}
        <div className="chat-input-actions">
          <button
            type="submit"
            className="chat-send-button"
            disabled={isSending}
          >
            {isSending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div
      data-easytag="id1-src/components/Home/index.jsx"
      className="chat-page"
    >
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">Групповой чат</h1>
          <p className="chat-subtitle">
            Обменивайтесь сообщениями с другими пользователями в режиме реального времени.
          </p>
        </div>
        <div ref={messagesContainerRef} className="chat-messages">
          {renderMessages()}
        </div>
        <div className="chat-input-area">{renderInputArea()}</div>
      </div>
    </div>
  );
};
