// Small helper to upload files to the server which proxies to Vercel Blob
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : 'http://localhost:3000/api';

export async function uploadFileToServer(file: File) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  const res = await axios.post(`${API_BASE}/upload`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default { uploadFileToServer };
