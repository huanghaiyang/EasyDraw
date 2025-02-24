<script lang="ts" setup>
import { Warning } from "@element-plus/icons-vue";
import { useStageStore } from "@/stores/stage";

const stageStore = useStageStore();
</script>
<template>
  <div :class="['align-props right-props']">
    <div class="align-props__title">
      <span class="align-props__title-text">对齐</span>
      <el-icon title="按住shift支持组件外轮廓对齐操作">
        <Warning />
      </el-icon>
    </div>
    <div class="align-props__row">
      <el-icon :class="['iconfont', 'icon-verbise-align-left', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignLeft"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-horizontal-center', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignCenter"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-right', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignRight"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-top', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignTop"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-vertical-center', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignMiddle"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-align-bottom', { disabled: !stageStore.alignEnable }]" @click="stageStore.setElementsAlignBottom"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-average-h', { disabled: !stageStore.averageEnable }]" @click="stageStore.setElementsAverageHorizontal"></el-icon>
      <el-icon :class="['iconfont', 'icon-verbise-average-v', { disabled: !stageStore.averageEnable }]" @click="stageStore.setElementsAverageVertical"></el-icon>
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
