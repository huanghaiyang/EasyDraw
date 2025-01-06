<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const wValue = ref(0);
const hValue = ref(0);

watch(
  () => stageStore.width,
  (newValue) => {
    wValue.value = newValue;
  }
);

watch(
  () => stageStore.height,
  (newValue) => {
    hValue.value = newValue;
  }
);
</script>
<template>
  <div class="size-props right-props">
    <div class="size-props__title">尺寸</div>

    <div class="size-props__row">
      <div class="angle-props__row-item">
        <el-input
          v-model="wValue"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled"
          min="2"
          type="number"
          @change="(value) => stageStore.setElementsWidth(Number(value))"
        >
          <template #prepend>w</template>
          <template #append>px</template>
        </el-input>
      </div>
      <div class="angle-props__row-item">
        <el-input
          v-model="hValue"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.uniqSelectedElement?.heightModifyEnable"
          min="2"
          type="number"
          @change="(value) => stageStore.setElementsHeight(Number(value))"
        >
          <template #prepend>h</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
