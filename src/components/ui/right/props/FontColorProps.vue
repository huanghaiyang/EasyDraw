<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontColor, DefaultFontColorOpacity } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();
const fontColor = ref(DefaultFontColor);
const fontColorOpacity = ref(DefaultFontColorOpacity);

watch(
  () => stageStore.fontColor,
  newValue => {
    fontColor.value = newValue;
  },
);

watch(
  () => stageStore.fontColorOpacity,
  newValue => {
    fontColorOpacity.value = newValue;
  },
);

const toggleColorPickerVisible = () => {
  if (!stageStore.fontInputEnable) return;
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">文字颜色</span>
    </div>
    <div class="font-props__row color">
      <div class="font-props__row-item">
        <el-color-picker v-model="fontColor" @change="value => stageStore.setElementsFontColor(value)" ref="colorPickerRef" :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable" />
        <el-tag type="info" @click="toggleColorPickerVisible">{{ fontColor }}</el-tag>
      </div>

      <div class="font-props__row-item">
        <el-input
          v-model="fontColorOpacity"
          placeholder=""
          type="number"
          min="0"
          max="1"
          precision="1"
          @change="value => stageStore.setElementsFontColorOpacity(Number(value))"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        >
          <template #prepend>O</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.color {
  margin-bottom: 8px;
}
.font-props {
  &__row {
    .el-icon {
      cursor: pointer;
    }
  }
}
</style>
