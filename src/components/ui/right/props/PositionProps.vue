<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const xValue = ref(0);
const yValue = ref(0);

watch(
  () => stageStore.position,
  (newValue) => {
    if (newValue) {
      xValue.value = newValue.x;
      yValue.value = newValue.y;
    }
  },
);
</script>
<template>
  <div class="position-props right-props">
    <div class="position-props__title">坐标</div>

    <div class="position-props__row">
      <el-input v-model="xValue" placeholder="输入数字">
        <template #prepend>x</template>
        <template #append>px</template>
      </el-input>

      <el-input v-model="yValue" placeholder="输入数字">
        <template #prepend>y</template>
        <template #append>px</template>
      </el-input>
    </div>
  </div>
</template>
<style lang="less" scoped>
.position-props {
  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    padding: 10px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    :deep(.el-input) {
      &:last-of-type {
        margin-left: 10px;
      }
      .el-input-group__prepend,
      .el-input-group__append {
        padding: 0 8px;
      }
    }
  }
}
</style>
