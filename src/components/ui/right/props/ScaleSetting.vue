<script lang="ts" setup>
import { ArrowDown } from "@element-plus/icons-vue";
import { useStageStore } from "@/stores/stage";
import { StageScales } from "@/types/Stage";
import MathUtils from "@/utils/MathUtils";

const stageStore = useStageStore();
</script>
<template>
  <div class="scale-setting">
    <div class="scale-setting__item factor">
      <el-dropdown
        trigger="click"
        popper-class="scale-setting__dropdown"
        :hide-on-click="false"
      >
        <span class="el-dropdown-link">
          {{ MathUtils.preciseToFixed(stageStore.scale * 100, 0) + "%" }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="stageStore.setScaleAutoFit">
              <span>自适应缩放</span>
              <span>shift + 1</span>
            </el-dropdown-item>
            <el-dropdown-item @click="stageStore.setScaleReduce">
              <span>缩小</span>
              <span>ctrl + -</span>
            </el-dropdown-item>
            <el-dropdown-item @click="stageStore.setScaleIncrease">
              <span>放大</span>
              <span>ctrl + +</span>
            </el-dropdown-item>
            <el-divider>预置缩放</el-divider>
            <el-dropdown-item
              v-for="value in StageScales"
              :key="value"
              @click="stageStore.setScale(value)"
            >
              <span
                >缩放{{ MathUtils.preciseToFixed(value * 100, 0) + "%" }}</span
              >
              <span>{{ value === 1 ? "ctrl + 0" : "" }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<style lang="less" scoped>
.scale-setting {
  height: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
  &__item {
    padding: 0 8px;
    &.factor {
      cursor: pointer;
    }
  }
}
</style>
<style lang="less">
.scale-setting__dropdown {
  width: 200px;
  color: #000;
  .el-dropdown-menu {
    width: 100%;
    user-select: none;
    &__item {
      display: flex;
      justify-content: space-between;
    }
  }
  .el-divider--horizontal {
    margin: 5px 0;
    .el-divider__text {
      font-size: 12px;
      color: gray;
      padding: 0 2px;
      margin: 0;
    }
  }
}
</style>
