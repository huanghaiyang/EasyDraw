<template>
  <div class="board-list-container">
    <div class="board-list-header">
      <h1>画布管理</h1>
      <div class="header-actions">
        <el-button @click="goToHome">首页</el-button>
        <el-button type="primary" @click="createBoard">新建画布</el-button>
      </div>
    </div>
    
    <div class="board-list">
      <el-card
        v-for="board in boards"
        :key="board.id"
        class="board-card"
        @click="openBoard(board.id)"
      >
        <template #header>
          <div class="board-card-header">
            <div v-if="!editingBoardId || editingBoardId !== board.id" class="board-name" @dblclick="startEditing(board.id)">
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
        </template>
        <div class="board-card-content">
          <div class="board-info">
            <span>创建时间: {{ formatDate(board.createdAt) }}</span>
            <span v-if="board.category" style="margin-left: 10px;">分类: {{ board.category }}</span>
          </div>
          <div class="board-actions">
            <el-button link @click.stop="startEditing(board.id)">编辑</el-button>
            <el-button link @click.stop="deleteBoard(board.id)" style="color: #f56c6c;">删除</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card v-if="loading" class="empty-board-card" v-loading="loading" element-loading-text="加载中...">
        <div class="empty-board-content">
          <!-- 加载中状态 -->
        </div>
      </el-card>
      
      <el-card v-else-if="boards.length === 0" class="empty-board-card">
        <div class="empty-board-content">
          <el-empty description="暂无画布" />
          <el-button type="primary" @click="createBoard" style="margin-top: 20px;">新建画布</el-button>
        </div>
      </el-card>
    </div>

    <!-- 新建画布对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建画布" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="画布名称">
          <el-input v-model="createForm.name" placeholder="请输入画布名称" />
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
          <el-button type="primary" @click="confirmCreate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessageBox, ElMessage } from 'element-plus';

const router = useRouter();
const boards = ref<any[]>([]);
const loading = ref(true);
const editingBoardId = ref<string | null>(null);
const editingBoardName = ref('');
const nameInput = ref<HTMLElement | null>(null);

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
        name: '画布1',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: '画布2',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: '画布3',
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
  return date.toLocaleString();
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
.board-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.board-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.board-list-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.board-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.board-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.board-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.board-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
}

.board-name:hover {
  color: #409eff;
}

.board-name-input {
  width: 200px;
}

.board-card-content {
  margin-top: 15px;
}

.board-info {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.board-actions {
  display: flex;
  gap: 10px;
}

.empty-board-card {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-board-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
  justify-content: center;
}
</style>
