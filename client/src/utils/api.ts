import axios from 'axios';
{/* get NODE_ENV from process.env */}
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL!
  : 'http://localhost:3000/api';

export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {} as any);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');

  const res = await fetch(`${baseURL}${path}`, { ...options, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text }
  if (!res.ok) throw data || new Error('Request failed');
  return data;
}
const apiClient = axios.create({
  baseURL: baseURL, // Your API base URL
});
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export  {apiClient};