<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";

const stageStore = useStageStore();
</script>
<template>
  <div :class="['layer-props right-props']">
    <div class="layer-props__title">
      <span class="layer-props__title-text">层级</span>
    </div>
    <div class="layer-props__row">
      <el-icon :class="['iconfont', 'icon-verbise-layer-go-down', { disabled: !stageStore.layerGoDownEnable }]" @click="stageStore.setElementsGoDown" title="下移"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-layer-shift-move', { disabled: !stageStore.layerShiftMoveEnable }]" @click="stageStore.setElementsShiftMove" title="上移"></el-icon>
    </div>
  </div>
</template>
<style lang="less" scoped>
.layer-props {
  .iconfont {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.85);

    &:hover {
      color: #1890ff;
      cursor: pointer;
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.65);
      cursor: not-allowed;

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
}
</style>
