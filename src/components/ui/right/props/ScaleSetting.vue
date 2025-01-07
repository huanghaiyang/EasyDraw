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
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          {{ MathUtils.preciseToFixed(stageStore.scale * 100, 0) + "%" }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="value in StageScales"
              :key="value"
              @click="stageStore.setScale(value)"
            >
              缩放{{ MathUtils.preciseToFixed(value * 100, 0) + "%" }}
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
