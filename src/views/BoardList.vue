<template>
  <div class="board-list-container">
    <!-- 顶部导航栏 -->
    <div class="board-list-header">
      <div class="header-left">
        <h1 class="app-title">EasyDraw</h1>
        <div class="header-nav">
          <span class="nav-item active">我的画布</span>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="goToHome" plain>
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-button>
        <el-button type="primary" @click="createBoard">
          <el-icon><Plus /></el-icon>
          <span>新建画布</span>
        </el-button>
      </div>
    </div>
    
    <!-- 画布列表 -->
    <div class="board-list-content">
      <!-- 分类筛选 -->
      <div class="filter-section">
        <div class="filter-buttons">
          <el-button 
            v-for="category in ['全部', ...categoryOptions.map(c => c.label)]" 
            :key="category"
            :type="activeCategory === category ? 'primary' : 'default'"
            plain
            @click="activeCategory = category"
          >
            {{ category }}
          </el-button>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索画布"
            prefix-icon="el-icon-search"
          />
        </div>
      </div>
      
      <!-- 画布网格 -->
      <div class="board-grid">
        <div 
          v-for="board in filteredBoards" 
          :key="board.id"
          class="board-card"
          @click="openBoard(board.id)"
        >
          <!-- 画布预览 -->
          <div class="board-preview">
            <div class="preview-placeholder">
              <el-icon class="preview-icon"><Picture /></el-icon>
            </div>
          </div>
          
          <!-- 画布信息 -->
          <div class="board-info">
            <div class="board-name-container">
              <div 
                v-if="!editingBoardId || editingBoardId !== board.id" 
                class="board-name" 
                @dblclick="startEditing(board.id)"
              >
                {{ board.name }}
              </div>
              <el-input
                v-else
                v-model="editingBoardName"
                class="board-name-input"
                @blur="saveBoardName(board.id)"
                @keyup.enter="saveBoardName(board.id)"
                @keyup.esc="cancelEditing"
                ref="nameInput"
                autofocus
              />
            </div>
            <div class="board-meta">
              <span class="board-category" v-if="board.category">{{ board.category }}</span>
              <span class="board-date">{{ formatDate(board.createdAt) }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="board-actions">
            <el-button 
              size="small" 
              link 
              @click.stop="startEditing(board.id)"
              class="action-button"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              size="small" 
              link 
              @click.stop="deleteBoard(board.id)"
              class="action-button delete"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="filteredBoards.length === 0" class="empty-state">
          <el-empty>
            <template #default>
              <div style="text-align: center;">
                <p>暂无画布</p>
                <el-button type="primary" @click="createBoard" style="margin-top: 20px;">
                  <el-icon><Plus /></el-icon>
                  <span>新建画布</span>
                </el-button>
              </div>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 新建画布对话框 -->
    <el-dialog 
      v-model="createDialogVisible" 
      title="新建画布" 
      width="500px"
      center
    >
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="画布名称">
          <el-input 
            v-model="createForm.name" 
            placeholder="请输入画布名称" 
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="画布分类">
          <el-select
            v-model="createForm.category"
            filterable
            allow-create
            placeholder="请选择或输入分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreate">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessageBox, ElMessage } from 'element-plus';
import { House, Plus, Picture, Edit, Delete, Search } from '@element-plus/icons-vue';

const router = useRouter();
const boards = ref<any[]>([]);
const loading = ref(true);
const editingBoardId = ref<string | null>(null);
const editingBoardName = ref('');
const nameInput = ref<HTMLElement | null>(null);

// 分类和搜索
const activeCategory = ref('全部');
const searchKeyword = ref('');

// 新建画布对话框
const createDialogVisible = ref(false);
const createForm = ref({
  name: '',
  category: ''
});

// 分类选项（按行业设计用途分类）
const categoryOptions = ref([
  { value: '互联网', label: '互联网' },
  { value: '金融', label: '金融' },
  { value: '教育', label: '教育' },
  { value: '医疗', label: '医疗' },
  { value: '电商', label: '电商' },
  { value: '社交', label: '社交' },
  { value: '娱乐', label: '娱乐' },
  { value: '工具', label: '工具' },
  { value: '其他', label: '其他' }
]);

// 过滤后的画布列表
const filteredBoards = computed(() => {
  let result = [...boards.value];
  
  // 分类筛选
  if (activeCategory.value !== '全部') {
    result = result.filter(board => board.category === activeCategory.value);
  }
  
  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(board => 
      board.name.toLowerCase().includes(keyword) ||
      (board.category && board.category.toLowerCase().includes(keyword))
    );
  }
  
  return result;
});

// 加载画布列表
const loadBoards = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/boards');
    // 正确处理后端返回的响应格式
    boards.value = response.data.data || [];
  } catch (error) {
    console.error('加载画布列表失败:', error);
    // 加载失败时使用模拟数据
    boards.value = [
      {
        id: '1',
        name: '产品设计草图',
        category: '互联网',
        createdAt: new Date().toISOString()
      },
      {
        id: '用户流程图',
        category: '互联网',
        createdAt: new Date().toISOString()
      },
      {
        id: '金融分析图表',
        category: '金融',
        createdAt: new Date().toISOString()
      },
      {
        id: '教育课程规划',
        category: '教育',
        createdAt: new Date().toISOString()
      },
      {
        id: '医疗系统架构',
        category: '医疗',
        createdAt: new Date().toISOString()
      },
      {
        id: '电商网站原型',
        category: '电商',
        createdAt: new Date().toISOString()
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 新建画布
const createBoard = () => {
  // 设置默认名称：画布+自增序号
  createForm.value.name = `画布${boards.value.length + 1}`;
  createForm.value.category = '';
  createDialogVisible.value = true;
};

// 确认创建画布
const confirmCreate = async () => {
  if (!createForm.value.name.trim()) {
    ElMessage.warning('请输入画布名称');
    return;
  }

  try {
    const response = await axios.post('/api/boards', {
      name: createForm.value.name,
      category: createForm.value.category
    });
    // 正确处理后端返回的响应格式
    const newBoard = response.data.data;
    boards.value.push(newBoard);
    createDialogVisible.value = false;
    ElMessage.success('创建成功');
    router.push(`/board/${newBoard.id}`);
  } catch (error) {
    console.error('创建画布失败:', error);
    ElMessage.error('创建失败');
    // 创建失败时使用模拟数据
    const newBoard = {
      id: Date.now().toString(),
      name: createForm.value.name,
      category: createForm.value.category,
      createdAt: new Date().toISOString()
    };
    boards.value.push(newBoard);
    createDialogVisible.value = false;
    router.push(`/board/${newBoard.id}`);
  }
};

// 打开画布
const openBoard = (boardId: string) => {
  router.push(`/board/${boardId}`);
};

// 开始编辑画布名称
const startEditing = (boardId: string) => {
  const board = boards.value.find(b => b.id === boardId);
  if (board) {
    editingBoardId.value = boardId;
    editingBoardName.value = board.name;
    nextTick(() => {
      (nameInput.value as any)?.focus();
    });
  }
};

// 保存画布名称
const saveBoardName = async (boardId: string) => {
  try {
    await axios.put(`/api/boards/${boardId}`, {
      name: editingBoardName.value
    });
    const board = boards.value.find(b => b.id === boardId);
    if (board) {
      board.name = editingBoardName.value;
    }
  } catch (error) {
    console.error('更新画布名称失败:', error);
    // 更新失败时直接修改本地数据
    const board = boards.value.find(b => b.id === boardId);
    if (board) {
      board.name = editingBoardName.value;
    }
  } finally {
    editingBoardId.value = null;
  }
};

// 取消编辑
const cancelEditing = () => {
  editingBoardId.value = null;
};

// 删除画布
const deleteBoard = async (boardId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个画布吗？删除后将无法恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await axios.delete(`/api/boards/${boardId}`);
    boards.value = boards.value.filter(b => b.id !== boardId);
    ElMessage.success('删除成功');
  } catch (error: any) {
    if (error.name === 'ElMessageBoxCancel') {
      // 用户取消删除
      return;
    }
    console.error('删除画布失败:', error);
    ElMessage.error('删除失败');
    // 删除失败时直接修改本地数据
    boards.value = boards.value.filter(b => b.id !== boardId);
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 跳转到首页
const goToHome = () => {
  router.push('/');
};

// 组件挂载时加载画布列表
onMounted(() => {
  loadBoards();
});
</script>

<style scoped>
/* 全局容器 */
.board-list-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.board-list-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 40px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.app-title {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 主要内容区域 */
.board-list-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 筛选区域 */
.filter-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.search-box {
  min-width: 280px;
}

/* 画布网格 */
.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 画布卡片 */
.board-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.board-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* 画布预览 */
.board-preview {
  height: 180px;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  text-align: center;
}

.preview-icon {
  font-size: 48px;
  color: #c0c4cc;
}

/* 画布信息 */
.board-info {
  padding: 20px;
}

.board-name-container {
  margin-bottom: 12px;
}

.board-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  transition: all 0.3s ease;
  word-break: break-word;
}

.board-name:hover {
  color: #409eff;
}

.board-name-input {
  width: 100%;
  margin-top: 4px;
}

.board-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.board-category {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

/* 操作按钮 */
.board-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.board-card:hover .board-actions {
  opacity: 1;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: #f0f9eb;
}

.action-button.delete:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 加载状态 */
.loading-state {
  grid-column: 1 / -1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 80px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .board-list-header {
    padding: 0 20px;
  }
  
  .header-left {
    gap: 20px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .search-box {
    width: 100%;
  }
  
  .board-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>
