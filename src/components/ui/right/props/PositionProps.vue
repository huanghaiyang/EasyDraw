<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import MathUtils from "@/utils/MathUtils";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const xValue = ref(0);
const yValue = ref(0);

watch(
  () => stageStore.position,
  (newValue) => {
    if (newValue) {
      xValue.value = MathUtils.preciseToFixed(newValue.x);
      yValue.value = MathUtils.preciseToFixed(newValue.y);
    }
  }
);
</script>
<template>
  <div class="position-props right-props">
    <div class="position-props__title">坐标</div>

    <div class="position-props__row">
      <div class="angle-props__row-item">
        <el-input v-model="xValue" placeholder="输入数字" :disabled="stageStore.inputDisabled" type="number" @change="(value) =>
            stageStore.setElementsPosition({ x: Number(value), y: yValue })
          ">
          <template #prepend>x</template>
          <template #append>px</template>
        </el-input>
      </div>

      <div class="angle-props__row-item">
        <el-input v-model="yValue" placeholder="输入数字" :disabled="stageStore.inputDisabled" type="number" @change="(value) =>
            stageStore.setElementsPosition({ x: xValue, y: Number(value) })
          ">
          <template #prepend>y</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
