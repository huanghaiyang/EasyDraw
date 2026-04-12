<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>欢迎回来</h2>
        <p>请登录您的EasyDraw账号</p>
      </div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="0" class="login-form">
        <el-form-item prop="username" class="form-item">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" class="input-field" />
        </el-form-item>
        <el-form-item prop="password" class="form-item">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password class="input-field" />
        </el-form-item>
        <div class="form-actions">
          <el-checkbox v-model="rememberMe" class="remember-checkbox">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password">忘记密码？</el-link>
        </div>
        <el-form-item class="form-item">
          <el-button type="primary" class="login-button" @click="login" :loading="loading">登录</el-button>
        </el-form-item>
        <div class="form-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        :closable="false"
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const loginFormRef = ref();
const loginForm = reactive({
  username: '',
  password: ''
});
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
});
const loading = ref(false);
const errorMsg = ref('');
const rememberMe = ref(false);

const login = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    
    loading.value = true;
    errorMsg.value = '';
    
    // 真实登录请求
    const response = await axios.post('/api/auth/login', loginForm);
    
    if (response.data.status === 'success') {
      // 保存token到localStorage
      localStorage.setItem('token', response.data.data.token);
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // 保存记住我状态
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('username', loginForm.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('username');
      }
      // 跳转到画布列表
      router.push('/');
    } else {
      errorMsg.value = response.data.message;
    }
  } catch (error: any) {
    if (error.errors) {
      // 表单验证错误
      return;
    }
    errorMsg.value = error.response?.data?.message || '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};

// 初始化时检查记住我状态
const initForm = () => {
  const rememberMeFlag = localStorage.getItem('rememberMe');
  if (rememberMeFlag === 'true') {
    rememberMe.value = true;
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      loginForm.username = savedUsername;
    }
  }
};

// 初始化表单
initForm();
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 40px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.input-field {
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-checkbox {
  font-size: 14px;
  color: #666;
}

.forgot-password {
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 30px;
  }
}
</style>
