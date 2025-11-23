const AUTH_TOKEN_KEY = 'authToken';
const AUTH_MEMBER_KEY = 'authMember';

function isStorageAvailable() {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!window.localStorage) {
    return false;
  }

  return true;
}

export function saveAuth({ token, member }) {
  if (!isStorageAvailable()) {
    return;
  }

  if (typeof token === 'string') {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (member) {
    try {
      const serializedMember = JSON.stringify(member);
      window.localStorage.setItem(AUTH_MEMBER_KEY, serializedMember);
    } catch (error) {
      // Ignore serialization errors
    }
  }
}

export function getAuthToken() {
  if (!isStorageAvailable()) {
    return null;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return null;
  }

  return token;
}

export function getAuthMember() {
  if (!isStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_MEMBER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed || null;
  } catch (error) {
    return null;
  }
}

export function clearAuth() {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_MEMBER_KEY);
}
