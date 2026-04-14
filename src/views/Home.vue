<template>
  <div class="home-container">
    <!-- 头部导航 -->
    <header class="home-header">
      <div class="logo">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>EasyDraw</span>
      </div>
      <nav class="nav-links">
        <a href="#features" class="nav-link">功能</a>
        <a href="#pricing" class="nav-link">价格</a>
        <a href="#about" class="nav-link">关于</a>
        <el-button v-if="!isLoggedIn" type="primary" @click="goToLogin">登录</el-button>
        <el-button v-else type="info" @click="goToBoardList">进入工作台</el-button>
      </nav>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>轻松创建，无限创意</h1>
        <p>EasyDraw是一款强大的在线设计工具，让您的创意轻松实现</p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" @click="goToBoardList">开始使用</el-button>
          <el-button size="large" @click="goToBoardList">了解更多</el-button>
        </div>
      </div>
      <div class="hero-illustration">
        <!-- 精美的SVG图案 -->
        <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 背景 -->
          <rect width="500" height="400" fill="#f8f9fa"/>
          
          <!-- 抽象几何图形 -->
          <circle cx="100" cy="100" r="60" fill="#667eea" opacity="0.7"/>
          <rect x="200" y="80" width="120" height="120" rx="10" fill="#764ba2" opacity="0.7"/>
          <polygon points="400,80 460,180 340,180" fill="#f093fb" opacity="0.7"/>
          
          <!-- 设计元素 -->
          <rect x="80" y="220" width="100" height="100" rx="5" fill="white" stroke="#667eea" stroke-width="2"/>
          <circle cx="230" cy="270" r="50" fill="white" stroke="#764ba2" stroke-width="2"/>
          <polygon points="380,220 430,270 330,270" fill="white" stroke="#f093fb" stroke-width="2"/>
          
          <!-- 连接线 -->
          <path d="M180 100 L200 140" stroke="#667eea" stroke-width="2" stroke-dasharray="5,5"/>
          <path d="M320 140 L340 180" stroke="#764ba2" stroke-width="2" stroke-dasharray="5,5"/>
          <path d="M180 270 L200 270" stroke="#667eea" stroke-width="2" stroke-dasharray="5,5"/>
          <path d="M320 270 L330 270" stroke="#764ba2" stroke-width="2" stroke-dasharray="5,5"/>
        </svg>
      </div>
    </section>

    <!-- 功能特点 -->
    <section id="features" class="features-section">
      <h2>核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>直观的界面</h3>
          <p>简洁易用的界面设计，让您专注于创作，无需学习复杂的操作流程</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>丰富的工具</h3>
          <p>提供多种绘图工具和元素，满足您的各种设计需求</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>实时协作</h3>
          <p>支持多人实时协作，团队成员可以同时编辑同一个画布</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>云端存储</h3>
          <p>您的作品自动保存到云端，随时随地访问和编辑</p>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section id="about" class="about-section">
      <h2>关于EasyDraw</h2>
      <p>EasyDraw是一款专为设计师、开发者和创意人士打造的在线设计工具。我们致力于提供简单易用但功能强大的设计解决方案，让每个人都能轻松创建专业的设计作品。</p>
      <p>我们的团队由一群热爱设计和技术的专业人士组成，不断努力提升产品体验，为用户带来更好的设计工具。</p>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>EasyDraw</span>
        </div>
        <div class="footer-links">
          <a href="#features">功能</a>
          <a href="#pricing">价格</a>
          <a href="#about">关于</a>
          <a href="#contact">联系我们</a>
        </div>
        <div class="footer-copyright">
          <p>© 2026 EasyDraw. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
  // 检查用户是否已登录
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
});

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const goToBoardList = () => {
  const token = localStorage.getItem('token');
  if (token) {
    router.push('/boards');
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.logo svg {
  margin-right: 10px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #667eea;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100px 50px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  flex: 1;
}

.hero-content {
  max-width: 500px;
}

.hero-content h1 {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.hero-illustration {
  flex-shrink: 0;
}

.features-section {
  padding: 100px 50px;
  background: white;
}

.features-section h2 {
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.about-section {
  padding: 100px 50px;
  background: #f8f9fa;
  text-align: center;
}

.about-section h2 {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.about-section p {
  max-width: 800px;
  margin: 0 auto 20px;
  color: #666;
  line-height: 1.6;
}

.home-footer {
  background: #333;
  color: white;
  padding: 50px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}

.footer-logo svg {
  margin-right: 10px;
}

.footer-links {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.footer-links a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #667eea;
}

.footer-copyright {
  font-size: 14px;
  color: #999;
}

@media (max-width: 768px) {
  .home-header {
    padding: 20px;
  }

  .hero-section {
    flex-direction: column;
    padding: 50px 20px;
    text-align: center;
  }

  .hero-illustration {
    margin-top: 50px;
  }

  .features-section,
  .about-section {
    padding: 50px 20px;
  }

  .home-footer {
    padding: 30px 20px;
  }
}
</style>
