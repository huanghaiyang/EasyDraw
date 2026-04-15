<template>
  <div 
    :class="[
      'toast-container', 
      'position-fixed', 
      'p-3', 
      getPositionClass()
    ]" 
    style="z-index: 1050"
  >
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      :class="['toast', 'show', `bg-${toast.type}`, 'text-white']"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-header">
        <strong class="me-auto">
          <i :class="getIcon(toast.type)"></i>
          {{ toast.title }}
        </strong>
        <button 
          type="button" 
          class="btn-close btn-close-white" 
          @click="removeToast(toast.id)"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type ToastPosition = 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';

interface Toast {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  position: ToastPosition;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

const showToast = (
  type: 'success' | 'danger' | 'warning' | 'info', 
  title: string, 
  message: string,
  position: ToastPosition = 'top-center'
) => {
  const id = toastId++;
  toasts.value.push({ id, type, title, message, position });
  
  setTimeout(() => {
    removeToast(id);
  }, 3000);
};

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const getIcon = (type: string) => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    danger: 'bi bi-exclamation-triangle-fill',
    warning: 'bi bi-exclamation-circle-fill',
    info: 'bi bi-info-circle-fill'
  };
  return icons[type as keyof typeof icons] || 'bi bi-info-circle-fill';
};

const getPositionClass = () => {
  if (toasts.value.length === 0) return 'top-0 start-50 translate-middle-x';
  
  const position = toasts.value[0].position;
  const positionClasses = {
    'top-center': 'top-0 start-50 translate-middle-x',
    'top-right': 'top-0 end-0',
    'top-left': 'top-0 start-0',
    'bottom-center': 'bottom-0 start-50 translate-middle-x',
    'bottom-right': 'bottom-0 end-0',
    'bottom-left': 'bottom-0 start-0'
  };
  return positionClasses[position] || positionClasses['top-center'];
};

defineExpose({
  showToast
});
</script>

<style scoped>
.toast-container {
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  margin-bottom: 0.5rem;
}

.toast.show {
  opacity: 1;
}
</style>
