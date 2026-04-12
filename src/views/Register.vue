<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#f5576c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#f5576c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#f5576c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>创建账号</h2>
        <p>加入EasyDraw，开始您的设计之旅</p>
      </div>
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="0" class="register-form">
        <el-form-item prop="username" class="form-item">
          <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" class="input-field" />
        </el-form-item>
        <el-form-item prop="email" class="form-item">
          <el-input v-model="registerForm.email" type="email" placeholder="邮箱" prefix-icon="Message" class="input-field" />
        </el-form-item>
        <el-form-item prop="password" class="form-item">
          <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password class="input-field" />
        </el-form-item>
        <el-form-item prop="confirmPassword" class="form-item">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Check" show-password class="input-field" />
        </el-form-item>
        <el-form-item class="form-item">
          <el-button type="primary" class="register-button" @click="register" :loading="loading">注册</el-button>
        </el-form-item>
        <div class="form-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        :closable="false"
        class="error-alert"
      />
      <el-alert
        v-if="successMsg"
        :title="successMsg"
        type="success"
        :closable="false"
        class="success-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { User, Message, Lock, Check } from '@element-plus/icons-vue';

const router = useRouter();
const registerFormRef = ref();
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const register = async () => {
  if (!registerFormRef.value) return;
  
  try {
    await registerFormRef.value.validate();
    
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';
    
    // 真实注册请求
    const response = await axios.post('/api/auth/register', registerForm);
    
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
    if (error.errors) {
      // 表单验证错误
      return;
    }
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-card {
  width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 40px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.register-form {
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
  border-color: #f5576c;
  box-shadow: 0 0 0 2px rgba(245, 87, 108, 0.2);
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.register-button:active {
  transform: translateY(0);
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.error-alert,
.success-alert {
  margin-top: 16px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .register-card {
    width: 90%;
    padding: 30px;
  }
}
</style>
