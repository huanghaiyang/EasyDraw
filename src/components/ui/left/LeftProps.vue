<template>
  <div class="props-left-panel">
    <div class="title">
      <span>组件序列</span>
    </div>
    <Elements-tree></Elements-tree>
  </div>
</template>
<script lang="ts" setup></script>
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
  }
}
</style>
