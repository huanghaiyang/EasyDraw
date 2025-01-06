<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultElementStyle } from "@/types/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();

const fillColor = ref(DefaultElementStyle.fillColor);
const fillColorOpacity = ref(DefaultElementStyle.fillColorOpacity);

watch(
  () => stageStore.fillColorOpacity,
  (newValue) => {
    fillColorOpacity.value = newValue;
  }
);

watch(
  () => stageStore.fillColor,
  (newValue) => {
    fillColor.value = newValue;
  }
);

const toggleColorPickerVisible = () => {
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="fill-props right-props" v-if="stageStore.uniqSelectedElement?.fillEnabled">
    <div class="fill-props__title">填充</div>

    <div class="fill-props__row color">
      <div class="fill-props__row-item">
        <el-color-picker
          v-model="fillColor"
          @change="stageStore.setElementsFillColor"
          ref="colorPickerRef"
          :disabled="stageStore.inputDisabled"
        />
        <el-tag type="info" @click="toggleColorPickerVisible">{{
          fillColor
        }}</el-tag>
      </div>

      <div class="fill-props__row-item">
        <el-input
          v-model="fillColorOpacity"
          placeholder="输入数字"
          type="number"
          min="0"
          max="1"
          @change="
            (value) => stageStore.setElementsFillColorOpacity(Number(value))
          "
          :disabled="stageStore.inputDisabled"
        >
          <template #prepend>o</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.color {
  margin-bottom: 8px;
}
</style>
