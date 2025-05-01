<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";

const stageStore = useStageStore();
</script>
<template>
  <div :class="['rotate-props right-props']">
    <div class="rotate-props__title">
      <span class="rotate-props__title-text text-2">快捷操作</span>
    </div>
    <div class="rotate-props__row">
      <el-tooltip :effect="'dark'" content="逆时针旋转90度">
        <el-icon :class="['iconfont', 'icon-verbise-rotate-left', { disabled: !stageStore.rotateEnable }]" @click="stageStore.setElementsRotate(-90)"></el-icon>
      </el-tooltip>

      <el-tooltip :effect="'dark'" content="顺时针旋转90度">
        <el-icon :class="['iconfont', 'icon-verbise-rotate-right', { disabled: !stageStore.rotateEnable }]" @click="stageStore.setElementsRotate(90)" title="顺时针旋转90度"></el-icon>
      </el-tooltip>

      <el-tooltip :effect="'dark'" content="水平翻转">
        <el-icon :class="['iconfont', 'icon-verbise-rotateY', { disabled: !stageStore.rotateEnable }]" @click="stageStore.setElementsFlipX()" title="水平翻转"></el-icon>
      </el-tooltip>

      <el-tooltip :effect="'dark'" content="垂直翻转">
        <el-icon :class="['iconfont', 'icon-verbise-rotateX', { disabled: !stageStore.rotateEnable }]" @click="stageStore.setElementsFlipY()" title="垂直翻转"></el-icon>
      </el-tooltip>
    </div>
  </div>
</template>
<style lang="less" scoped>
.rotate-props {
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
