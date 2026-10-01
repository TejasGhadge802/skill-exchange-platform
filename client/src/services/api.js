import axios from 'axios';
import { auth } from '../firebase/firebase';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1' });
api.interceptors.request.use(async (config) => {
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
