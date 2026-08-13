import axios from 'axios';

// إنشاء نسخة موحدة من Axios مرتبطة بـ Laravel API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;