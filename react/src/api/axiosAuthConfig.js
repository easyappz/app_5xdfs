import { instance } from './axios';

let isAuthInterceptorAttached = false;

export function attachAuthInterceptor() {
  if (isAuthInterceptorAttached) {
    return;
  }

  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('authToken');
        if (token) {
          if (!config.headers) {
            config.headers = {};
          }
          config.headers.Authorization = `Token ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  isAuthInterceptorAttached = true;
}
