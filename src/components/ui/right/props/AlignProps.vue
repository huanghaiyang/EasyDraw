<script lang="ts" setup>
import { useStageStore } from '@/stores/stage';

const stageStore = useStageStore();
</script>
<template>
  <div :class="['align-props right-props', {
    disabled: stageStore.selectedElements?.length < 2
  }]">
    <div class="align-props__title">对齐</div>
    <div class="align-props__row">
      <el-icon :class="['iconfont', 'icon-verbise-align-left']"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-horizontal-center']"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-right']"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-top']"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-vertical-center']"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-bottom']"></el-icon>
    </div>
  </div>
</template>
<style lang="less" scoped>
.align-props {
  .iconfont {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.85);

    &:hover {
      color: #1890ff;
      cursor: pointer;
    }
  }

  &.disabled {
    .iconfont {
      color: rgba(0, 0, 0, 0.65);
      cursor: not-allowed;

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
}
</style>
