<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>登录</h2>
        <p>欢迎使用EasyDraw</p>
      </div>
      <el-form :model="loginForm" label-width="80px" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="login" :loading="loading">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </el-form-item>
      </el-form>
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const loginForm = ref({
  username: '',
  password: ''
});
const loading = ref(false);
const errorMsg = ref('');

const login = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMsg.value = '请输入用户名和密码';
    return;
  }

  try {
    loading.value = true;
    errorMsg.value = '';
    const response = await axios.post('/api/auth/login', loginForm.value);
    
    if (response.data.status === 'success') {
      // 保存token到localStorage
      localStorage.setItem('token', response.data.data.token);
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // 跳转到画布列表
      router.push('/');
    } else {
      errorMsg.value = response.data.message;
    }
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  margin-bottom: 10px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  margin-top: 10px;
}
</style>
