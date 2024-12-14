<script setup lang="ts">
import { useStageStore } from '@/stores/stage';
import { ref, onMounted, toRaw } from 'vue'

const stageStore = useStageStore()
const stageRef = ref()

onMounted(() => {
  stageStore.init(toRaw(stageRef.value))
})
</script>
<template>
  <div class="stage-container" ref="stageRef">
  </div>
</template>
<style lang="less" scoped>
.stage-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}
</style>