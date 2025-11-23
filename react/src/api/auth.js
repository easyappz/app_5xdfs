import { instance } from './axios';
import { attachAuthInterceptor } from './axiosAuthConfig';

attachAuthInterceptor();

export async function register({ username, password }) {
  const response = await instance.post('/api/auth/register/', {
    username,
    password,
  });

  return response.data;
}

export async function login({ username, password }) {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });

  return response.data;
}

export async function getCurrentMember() {
  const response = await instance.get('/api/auth/me/');
  return response.data;
}
