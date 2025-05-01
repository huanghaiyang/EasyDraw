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
      <el-tooltip effect="dark" content="下移">
        <el-icon :class="['iconfont', 'icon-verbise-layer-go-down', { disabled: !stageStore.layerGoDownEnable }]" @click="stageStore.setElementsGoDown"></el-icon>
      </el-tooltip>
      <el-tooltip effect="dark" content="上移">
        <el-icon :class="['iconfont', 'icon-verbise-layer-shift-move', { disabled: !stageStore.layerShiftMoveEnable }]" @click="stageStore.setElementsShiftMove"></el-icon>
      </el-tooltip>
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
