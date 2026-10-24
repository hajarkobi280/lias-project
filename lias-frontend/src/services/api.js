import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lias_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
 const currentToken = localStorage.getItem('lias_token');
 if(error.response?.status === 401 && currentToken && error.config?.headers?.Authorization === `Bearer ${currentToken}` && !error.config?.url?.includes('/auth/login')){
  localStorage.removeItem('lias_token');localStorage.removeItem('lias_user');window.dispatchEvent(new Event('lias-session-expired'));
 }
 return Promise.reject(error);
});
export default api;
