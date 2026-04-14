import axios from 'axios';

// 创建axios实例
const service = axios.create({
  baseURL: '',
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token');
    // 如果有token，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 处理未授权错误的公共函数
const handleUnauthorizedError = () => {
  // 清除本地存储的token和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 跳转到登录页面
  window.location.href = '/login';
};

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      handleUnauthorizedError();
    }
    // 处理403错误（禁止访问）
    if (error.response && error.response.status === 403) {
      console.error('403 Forbidden:', error);
      handleUnauthorizedError();
    }
    return Promise.reject(error);
  }
);

export default service;
