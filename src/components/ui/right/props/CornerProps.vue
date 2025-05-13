<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";
import { uniq } from "lodash";

const stageStore = useStageStore();
const corners = ref([...DefaultStage.corners]);
const value = ref(0);
const isAllCornerEqual = ref(false);

watch(
  () => stageStore.corners,
  newValue => {
    corners.value = newValue;
    const values = uniq(corners.value);
    if (values.length === 1) {
      isAllCornerEqual.value = true;
      value.value = values[0];
    } else {
      isAllCornerEqual.value = false;
      value.value = 0;
    }
  },
);

/**
 * 获取圆角位置的标签
 */
function getLabel(index: number): string {
  switch (index) {
    case 0:
      return "左上";
    case 1:
      return "右上";
    case 2:
      return "右下";
    case 3:
      return "左下";
  }
}
</script>
<template>
  <div class="corners-props right-props" v-show="stageStore.cornersEnable">
    <div class="corners-props__title">
      <span class="corners-props__title-text">圆角</span>
    </div>

    <div class="corners-props__row">
      <div class="corners-props__row-item large">
        <el-input
          v-model="value"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.cornersInputEnable || !isAllCornerEqual"
          type="number"
          min="0"
          :max="stageStore.primarySelectedElement?.minParallelogramVerticalSize / 2"
          precision="1"
          @change="val => stageStore.setElementsCorners(Number(val))"
        >
          <template #prepend>整体</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
    <div class="corners-props__row">
      <div class="corners-props__row-item large" v-for="(item, index) in corners.slice(0, 2)" :key="index">
        <el-input
          v-model="corners[index]"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.cornersInputEnable"
          type="number"
          min="0"
          :max="stageStore.primarySelectedElement?.minParallelogramVerticalSize / 2"
          precision="1"
          @change="val => stageStore.setElementsCorners(Number(val), index)"
        >
          <template #prepend>{{ getLabel(index) }}</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
    <div class="corners-props__row">
      <div class="corners-props__row-item large" v-for="(item, index) in corners.slice(2, 4)" :key="index">
        <el-input
          v-model="corners[index + 2]"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.cornersInputEnable"
          type="number"
          min="0"
          :max="stageStore.primarySelectedElement?.minParallelogramVerticalSize / 2"
          precision="1"
          @change="val => stageStore.setElementsCorners(Number(val), index + 2)"
        >
          <template #prepend>{{ getLabel(index + 2) }}</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
