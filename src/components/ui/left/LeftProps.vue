<template>
  <div class="props-left-panel">
    <div class="title">
      <span>组件序列({{ stageStore.selectedElements.length }} / {{ Array.from(stageStore.treeNodesMap.keys()).length }})</span>
    </div>
    <div class="tree">
      <Elements-tree></Elements-tree>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";

const stageStore = useStageStore();
</script>
<style lang="less" scoped>
.props-left-panel {
  width: 100%;
  height: 100%;
  .title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 22px;
    border-bottom: 1px solid #e5e5e5;
    padding: 10px;
    height: 42px;
  }
  .tree {
    max-height: calc(100% - 42px);
    overflow-y: scroll;
  }
}
</style>
