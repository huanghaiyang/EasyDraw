<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>注册</h2>
        <p>创建您的EasyDraw账号</p>
      </div>
      <el-form :model="registerForm" label-width="80px" class="register-form">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-button" @click="register" :loading="loading">注册</el-button>
          <el-button @click="goToLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const registerForm = ref({
  username: '',
  email: '',
  password: ''
});
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const register = async () => {
  if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.password) {
    errorMsg.value = '请填写所有必填字段';
    return;
  }

  if (registerForm.value.password.length < 6) {
    errorMsg.value = '密码长度至少6位';
    return;
  }

  try {
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';
    const response = await axios.post('/api/auth/register', registerForm.value);
    
    if (response.data.status === 'success') {
      successMsg.value = '注册成功，请登录';
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      errorMsg.value = response.data.message;
    }
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.register-card {
  width: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
}

.register-form {
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
  margin-bottom: 10px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  margin-top: 10px;
}

.success-message {
  color: #67c23a;
  text-align: center;
  margin-top: 10px;
}
</style>
