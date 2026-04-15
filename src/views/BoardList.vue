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
        <button class="btn btn-outline-secondary" @click="goToHome">
          <i class="bi bi-house"></i>
          <span>首页</span>
        </button>
        <button class="btn btn-primary" @click="createBoard">
          <i class="bi bi-plus"></i>
          <span>新建画布</span>
        </button>
      </div>
    </div>
    
    <!-- 画布列表 -->
    <div class="board-list-content">
      <!-- 分类筛选 -->
      <div class="filter-section">
        <div class="filter-buttons">
          <button 
            v-for="category in ['全部', ...categoryOptions.map(c => c.label)]" 
            :key="category"
            :class="['btn', activeCategory === category ? 'btn-primary' : 'btn-outline-secondary']"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
        <div class="search-box">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              v-model="searchKeyword"
              placeholder="搜索画布"
            />
          </div>
        </div>
      </div>
      
      <!-- 回收站 -->
      <div class="trash-section">
        <button 
          class="btn btn-outline-danger w-100 d-flex justify-content-between align-items-center"
          @click="toggleTrash"
        >
          <div class="d-flex align-items-center">
            <i class="bi bi-trash3 me-2"></i>
            <span>回收站</span>
            <span v-if="trashBoards.length > 0" class="badge bg-danger ms-2">{{ trashBoards.length }}</span>
          </div>
          <i :class="['bi', trashExpanded ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
        </button>
        
        <!-- 回收站内容 -->
        <div v-if="trashExpanded" class="trash-content">
          <div v-if="trashLoading" class="loading-state">
            <div class="skeleton-loader" v-for="i in 3" :key="i"></div>
          </div>
          <div v-else-if="trashBoards.length === 0" class="empty-trash">
            <div class="text-center py-4">
              <i class="bi bi-trash3 display-3 text-muted"></i>
              <p class="mt-2">回收站为空</p>
            </div>
          </div>
          <div v-else class="trash-grid">
            <div 
              v-for="board in trashBoards" 
              :key="board.id"
              class="board-card trash-card"
            >
              <!-- 画布预览 -->
              <div class="board-preview">
                <div class="preview-placeholder trash-placeholder">
                  <i class="bi bi-image preview-icon"></i>
                </div>
              </div>
              
              <!-- 画布信息 -->
              <div class="board-info">
                <div class="board-name-container">
                  <div class="board-name trash-name">{{ board.name }}</div>
                </div>
                <div class="board-meta">
                  <span class="board-category badge bg-secondary" v-if="board.category">{{ board.category }}</span>
                  <span class="board-date">{{ formatDate(board.createdAt) }}</span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="board-actions">
                <button 
                  class="btn btn-sm action-button restore"
                  @click="openRestoreModal(board.id)"
                  title="恢复"
                >
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button 
                  class="btn btn-sm action-button delete"
                  @click="openPermanentDeleteModal(board.id)"
                  title="永久删除"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
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
              <i class="bi bi-image preview-icon"></i>
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
              <input
                v-else
                type="text"
                class="form-control board-name-input"
                v-model="editingBoardName"
                @blur="saveBoardName(board.id)"
                @keyup.enter="saveBoardName(board.id)"
                @keyup.esc="cancelEditing"
                ref="nameInput"
                autofocus
              />
            </div>
            <div class="board-meta">
              <span class="board-category badge bg-primary" v-if="board.category">{{ board.category }}</span>
              <span class="board-date">{{ formatDate(board.createdAt) }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="board-actions">
            <button 
              class="btn btn-sm action-button"
              @click.stop="startEditing(board.id)"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button 
              class="btn btn-sm action-button delete"
              @click.stop="deleteBoard(board.id)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="skeleton-loader" v-for="i in 6" :key="i"></div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="filteredBoards.length === 0" class="empty-state">
          <div class="text-center">
            <i class="bi bi-file-earmark-image display-1 text-muted"></i>
            <p class="mt-3">暂无画布</p>
            <button class="btn btn-primary mt-4" @click="createBoard">
              <i class="bi bi-plus"></i>
              <span>新建画布</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建画布对话框 -->
    <div class="modal fade" ref="createBoardModal" tabindex="-1" aria-labelledby="createBoardModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createBoardModalLabel">新建画布</h5>
            <button type="button" class="btn-close" @click="closeCreateModal()"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmCreate">
              <div class="mb-3">
                <label for="boardName" class="form-label">画布名称</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="boardName"
                  v-model="createForm.name" 
                  placeholder="请输入画布名称" 
                  maxlength="50"
                />
                <div class="form-text">{{ createForm.name.length }}/50</div>
              </div>
              <div class="mb-3">
                <label for="boardCategory" class="form-label">画布分类</label>
                <select
                  class="form-select"
                  id="boardCategory"
                  v-model="createForm.category"
                  placeholder="请选择或输入分类"
                >
                  <option value="">请选择分类</option>
                  <option
                    v-for="category in categoryOptions"
                    :key="category.value"
                    :value="category.value"
                  >
                    {{ category.label }}
                  </option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal()">取消</button>
            <button type="button" class="btn btn-primary" @click="confirmCreate">创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div class="modal fade" ref="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmModalLabel">删除确认</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            确定要删除这个画布吗？删除后将移至回收站。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">取消</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">确定</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 永久删除确认对话框 -->
    <div class="modal fade" id="permanentDeleteConfirmModal" tabindex="-1" aria-labelledby="permanentDeleteConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="permanentDeleteConfirmModalLabel">永久删除确认</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            确定要永久删除这个画布吗？此操作不可恢复。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="confirmPermanentDelete">确定</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 恢复确认对话框 -->
    <div class="modal fade" id="restoreConfirmModal" tabindex="-1" aria-labelledby="restoreConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="restoreConfirmModalLabel">恢复确认</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            确定要恢复这个画布吗？恢复后将移至正常画布列表。
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-success" @click="confirmRestore">确定</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast组件 -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import Toast from '../components/Toast.vue';

const router = useRouter();
const boards = ref<any[]>([]);
const loading = ref(true);
const editingBoardId = ref<string | null>(null);
const editingBoardName = ref('');
const nameInput = ref<HTMLElement | null>(null);

// Toast组件引用
const toast = ref<InstanceType<typeof Toast>>();

// 模态框引用
const createBoardModal = ref<HTMLElement | null>(null);
const deleteConfirmModal = ref<HTMLElement | null>(null);

// 分类和搜索
const activeCategory = ref('全部');
const searchKeyword = ref('');

// 新建画布表单
const createForm = ref({
  name: '',
  category: ''
});

// 删除确认
const boardToDelete = ref<string | null>(null);

// 回收站
const trashExpanded = ref(false);
const trashBoards = ref<any[]>([]);
const trashLoading = ref(false);

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
  
  // 显示模态框
  if (createBoardModal.value) {
    const modal = new (window as any).bootstrap.Modal(createBoardModal.value);
    modal.show();
  }
};

// 关闭新建画布模态框
const closeCreateModal = (callback?: () => void) => {
  if (createBoardModal.value) {
    const modal = (window as any).bootstrap.Modal.getInstance(createBoardModal.value);
    if (modal) {
      modal.hide();
      // 执行回调函数
      if (callback) {
        callback();
      }
    }
  }
};

// 确认创建画布
const confirmCreate = async () => {
  if (!createForm.value.name.trim()) {
    toast.value?.showToast('warning', '提示', '请输入画布名称');
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
    // 显示成功消息
    toast.value?.showToast('success', '成功', '创建成功');
    // 2秒后跳转到编辑页面
    setTimeout(() => {
      router.push(`/board/${newBoard.id}`);
    }, 0.5);
  } catch (error) {
    console.error('创建画布失败:', error);
    // 显示错误消息
    toast.value?.showToast('danger', '错误', '创建失败');
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

// 显示删除确认对话框
const deleteBoard = (boardId: string) => {
  boardToDelete.value = boardId;
  
  // 显示模态框
  if (deleteConfirmModal.value) {
    const modal = new (window as any).bootstrap.Modal(deleteConfirmModal.value);
    modal.show();
  }
};

// 关闭删除确认模态框
const closeDeleteModal = () => {
  if (deleteConfirmModal.value) {
    const modal = (window as any).bootstrap.Modal.getInstance(deleteConfirmModal.value);
    if (modal) {
      modal.hide();
    }
  }
  boardToDelete.value = null;
};

// 确认删除
const confirmDelete = async () => {
  if (!boardToDelete.value) return;
  
  try {
    await axios.delete(`/api/boards/${boardToDelete.value}`);
    boards.value = boards.value.filter(b => b.id !== boardToDelete.value);
    // 显示成功消息
    toast.value?.showToast('success', '成功', '删除成功');
    // 更新回收站数据
    await loadTrashBoards();
  } catch (error) {
    console.error('删除画布失败:', error);
    // 显示错误消息
    toast.value?.showToast('danger', '错误', '删除失败');
    // 删除失败时直接修改本地数据
    boards.value = boards.value.filter(b => b.id !== boardToDelete.value);
  } finally {
    closeDeleteModal();
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

// 切换回收站展开/收起
const toggleTrash = async () => {
  trashExpanded.value = !trashExpanded.value;
  if (trashExpanded.value) {
    await loadTrashBoards();
  }
};

// 加载回收站画板列表
const loadTrashBoards = async () => {
  try {
    trashLoading.value = true;
    const response = await axios.get('/api/boards/trash');
    trashBoards.value = response.data.data || [];
  } catch (error) {
    console.error('加载回收站失败:', error);
    trashBoards.value = [];
  } finally {
    trashLoading.value = false;
  }
};

// 恢复画板
const restoreBoard = async (boardId: string) => {
  try {
    await axios.post(`/api/boards/${boardId}/restore`);
    toast.value?.showToast('success', '成功', '恢复成功');
    // 重新加载回收站和画布列表
    await loadTrashBoards();
    await loadBoards();
  } catch (error) {
    console.error('恢复画板失败:', error);
    toast.value?.showToast('danger', '错误', '恢复失败');
  }
};

// 永久删除画板
const boardToPermanentDelete = ref<string | null>(null);

const openPermanentDeleteModal = (boardId: string) => {
  boardToPermanentDelete.value = boardId;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('permanentDeleteConfirmModal'));
  modal.show();
};

const confirmPermanentDelete = async () => {
  if (!boardToPermanentDelete.value) return;
  
  try {
    await axios.delete(`/api/boards/${boardToPermanentDelete.value}/permanent`);
    toast.value?.showToast('success', '成功', '永久删除成功');
    // 重新加载回收站
    await loadTrashBoards();
    // 关闭模态框
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('permanentDeleteConfirmModal'));
    if (modal) {
      modal.hide();
    }
  } catch (error) {
    console.error('永久删除画板失败:', error);
    toast.value?.showToast('danger', '错误', '永久删除失败');
  } finally {
    boardToPermanentDelete.value = null;
  }
};

// 恢复画板
const boardToRestore = ref<string | null>(null);

const openRestoreModal = (boardId: string) => {
  boardToRestore.value = boardId;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('restoreConfirmModal'));
  modal.show();
};

const confirmRestore = async () => {
  if (!boardToRestore.value) return;
  
  try {
    await axios.post(`/api/boards/${boardToRestore.value}/restore`);
    toast.value?.showToast('success', '成功', '恢复成功');
    // 重新加载回收站和画布列表
    await loadTrashBoards();
    await loadBoards();
    // 关闭模态框
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('restoreConfirmModal'));
    if (modal) {
      modal.hide();
    }
  } catch (error) {
    console.error('恢复画板失败:', error);
    toast.value?.showToast('danger', '错误', '恢复失败');
  } finally {
    boardToRestore.value = null;
  }
};

// 组件挂载时加载画布列表和回收站个数
onMounted(async () => {
  await loadBoards();
  await loadTrashBoards();
});
</script>

<style scoped>
/* 全局容器 */
.board-list-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航栏 */
.board-list-header {
  background-color: #ffffff;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  padding: 0 2.5rem;
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
  gap: 2.5rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0d6efd;
  margin: 0;
}

.header-nav {
  display: flex;
  gap: 1.25rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.nav-item.active {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.header-right button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 主要内容区域 */
.board-list-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.875rem 1.25rem;
}

/* 筛选区域 */
.filter-section {
  background-color: #ffffff;
  border-radius: 0.375rem;
  padding: 1.25rem;
  margin-bottom: 1.875rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9375rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-box {
  min-width: 280px;
}

/* 画布网格 */
.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 画布卡片 */
.board-card {
  background-color: #ffffff;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.board-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-0.25rem);
}

/* 画布预览 */
.board-preview {
  height: 180px;
  background-color: #f8f9fa;
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
  font-size: 3rem;
  color: #6c757d;
}

/* 画布信息 */
.board-info {
  padding: 1.25rem;
}

.board-name-container {
  margin-bottom: 0.75rem;
}

.board-name {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
  transition: all 0.2s ease-in-out;
  word-break: break-word;
}

.board-name:hover {
  color: #0d6efd;
}

.board-name-input {
  width: 100%;
  margin-top: 0.25rem;
}

.board-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6c757d;
}

.board-category {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
}

/* 操作按钮 */
.board-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.375rem;
  border-radius: 0.375rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.board-card:hover .board-actions {
  opacity: 1;
}

.action-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
}

.action-button:hover {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.action-button.delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* 回收站 */
.trash-section {
  margin: 20px 0;
  border: 1px solid #f8d7da;
  border-radius: 8px;
  overflow: hidden;
}

.trash-section .btn {
  border-radius: 0;
  border: none;
  background-color: #f8f9fa;
}

.trash-section .btn:hover {
  background-color: #f1f3f5;
}

.trash-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #f8d7da;
}

.trash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trash-card {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.trash-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  opacity: 1;
}

.trash-placeholder {
  opacity: 0.6;
}

.trash-name {
  text-decoration: line-through;
  color: #6c757d;
}

.trash-card .action-button.restore {
  color: #28a745;
}

.trash-card .action-button.restore:hover {
  background-color: #e8f5e8;
}

.empty-trash {
  padding: 40px 20px;
  text-align: center;
}

/* 加载状态 */
.loading-state {
  grid-column: 1 / -1;
  background-color: #ffffff;
  border-radius: 0.375rem;
  padding: 2.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.skeleton-loader {
  height: 1.25rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin-bottom: 0.75rem;
  border-radius: 0.25rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  background-color: #ffffff;
  border-radius: 0.375rem;
  padding: 5rem 1.25rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.empty-state button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .board-list-header {
    padding: 0 1.25rem;
  }
  
  .header-left {
    gap: 1.25rem;
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
    gap: 1rem;
  }
  
  .header-right button span {
    display: none;
  }
  
  .header-right button {
    padding: 0.375rem;
  }
}
</style>
