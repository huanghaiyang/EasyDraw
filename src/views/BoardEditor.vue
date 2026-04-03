<template>
  <div class="board-editor-container">
    <div class="board-editor-header">
      <el-button type="primary" @click="goBack">返回画布列表</el-button>
      <h1>{{ boardName }}</h1>
    </div>
    
    <div class="board-editor-content">
      <!-- 这里是画布编辑区域 -->
      <div class="canvas-container">
        <div v-if="loading" class="canvas-placeholder">
          <el-loading :fullscreen="false" :text="'加载中...'" />
        </div>
        <div v-else class="canvas-placeholder">
          <el-empty description="画布编辑区域" />
          <p style="margin-top: 20px; color: #666;">画布ID: {{ boardId }}</p>
          <p style="margin-top: 10px; color: #666;">创建时间: {{ formatDate(board.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const boardId = ref(route.params.id as string);
const boardName = ref('');
const board = ref<any>(null);
const loading = ref(true);

// 加载画布信息
const loadBoardInfo = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/boards/${boardId.value}`);
    board.value = response.data;
    boardName.value = board.value.name;
  } catch (error) {
    console.error('加载画布信息失败:', error);
    // 加载失败时使用模拟数据
    board.value = {
      id: boardId.value,
      name: `画布 ${boardId.value}`,
      createdAt: new Date().toISOString()
    };
    boardName.value = board.value.name;
  } finally {
    loading.value = false;
  }
};

// 返回画布列表
const goBack = () => {
  router.push('/');
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时加载画布信息
onMounted(() => {
  loadBoardInfo();
});
</script>

<style scoped>
.board-editor-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.board-editor-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.board-editor-header h1 {
  margin: 0 0 0 20px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.board-editor-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.canvas-container {
  width: 100%;
  min-height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-placeholder {
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
