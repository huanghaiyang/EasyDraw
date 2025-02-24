<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";
import { DefaultCornerModel } from "@/types/IElement";
import { uniq } from "lodash";

const stageStore = useStageStore();
const corners = ref(DefaultCornerModel.corners);
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
</script>
<template>
  <div class="corners-props right-props" v-if="stageStore.primarySelectedElement?.cornersModifyEnable">
    <div class="corners-props__title">
      <span class="corners-props__title-text">圆角</span>
    </div>

    <div class="corners-props__row">
      <div class="corners-props__row-item">
        <el-input
          v-model="value"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !isAllCornerEqual"
          type="number"
          min="0"
          :max="stageStore.primarySelectedElement?.minParallelogramVerticalSize / 2"
          precision="1"
          @change="val => stageStore.setElementsCorners(Number(val))"
        >
          <template #prepend>C</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
    <div class="corners-props__row">
      <div class="corners-props__row-item" v-for="(item, index) in corners" :key="index">
        <el-input
          v-model="corners[index]"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled"
          type="number"
          min="0"
          :max="stageStore.primarySelectedElement?.minParallelogramVerticalSize / 2"
          precision="1"
          @change="val => stageStore.setElementsCorners(Number(val), index)"
        >
        </el-input>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.corners-props {
}
</style>
