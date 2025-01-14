<script lang="ts" setup>
import { Close } from "@element-plus/icons-vue";
import { useStageStore } from "@/stores/stage";

const stageStore = useStageStore();
</script>
<template>
  <div class="arbitrary-bar" v-if="stageStore.arbitraryVisible">
    <div class="tool-item">
      <el-icon @click="stageStore.commitArbitraryDrawing"><Close /></el-icon>
    </div>
  </div>
</template>
<style lang="less" scoped>
.arbitrary-bar {
  width: 30px;
  bottom: 60px;
  left: calc(50% - 30px);
}
</style>
