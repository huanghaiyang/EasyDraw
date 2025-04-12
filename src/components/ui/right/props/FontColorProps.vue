<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontColor, DefaultFontColorOpacity } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();
const fontColor = ref(DefaultFontColor);
const fontColorOpacity = ref(DefaultFontColorOpacity);
const fontColorMixin = ref(false);
const fontColorOpacityMixin = ref(false);

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

watch(
  () => stageStore.fontColorMixin,
  newValue => {
    fontColorMixin.value = newValue;
  },
);

watch(
  () => stageStore.fontColorOpacityMixin,
  newValue => {
    fontColorOpacityMixin.value = newValue;
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
      <span class="font-props__title-text text-2">文字颜色</span>
    </div>
    <div class="font-props__row color">
      <div class="font-props__row-item">
        <el-color-picker v-model="fontColor" @change="value => stageStore.setElementsFontColor(value)" ref="colorPickerRef" :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable" />
        <el-tag type="info" @click="toggleColorPickerVisible">{{ `${fontColorMixin ? "混合颜色" : fontColor}` }}</el-tag>
      </div>

      <div class="font-props__row-item" :style="{ width: '106px' }">
        <el-input
          v-model="fontColorOpacity"
          :placeholder="`${fontColorOpacityMixin ? '混合透明度' : fontColorOpacity}`"
          type="number"
          min="0"
          max="100"
          precision="0"
          @change="value => stageStore.setElementsFontColorOpacity(Number(value))"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        >
          <template #prepend>透明</template>
          <template #append>%</template>
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
