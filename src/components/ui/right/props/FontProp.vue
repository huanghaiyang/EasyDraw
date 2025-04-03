<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontColor, DefaultFontColorOpacity, DefaultFontFamily, DefaultFontSize, FontFamilyList, FontSizeList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();
const fontFamily = ref(DefaultFontFamily);
const fontSize = ref(DefaultFontSize);
const fontColor = ref(DefaultFontColor);
const fontColorOpacity = ref(DefaultFontColorOpacity);

watch(
  () => stageStore.fontFamily,
  newValue => {
    fontFamily.value = newValue;
  },
);

watch(
  () => stageStore.fontSize,
  newValue => {
    fontSize.value = newValue;
  },
);

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
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.primarySelectedElement?.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">字体</span>
    </div>
    <div class="font-props__row">
      <div class="font-props__row-item full">
        <el-select v-model="fontFamily" placeholder="字体" size="small" @change="value => stageStore.setElementsFontFamily(value)" :disabled="stageStore.inputDisabled">
          <el-option v-for="item in FontFamilyList" :key="item.name" :label="item.name" :value="item.name" :style="{ fontFamily: item.name }" />
        </el-select>
      </div>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select v-model="fontSize" placeholder="字号" size="small" @change="value => stageStore.setElementsFontSize(value)" :disabled="stageStore.inputDisabled">
          <el-option v-for="item in FontSizeList" :key="item.name" :label="item.name" :value="item.value" />
        </el-select>
      </div>
      <div class="font-props__row-item">
        <el-input
          v-model="fontSize"
          :disabled="stageStore.inputDisabled"
          size="small"
          placeholder="字号"
          type="number"
          :min="1"
          :max="100"
          @change="value => stageStore.setElementsFontSize(Number(value))"
        >
          <template #prepend>S</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>

    <div class="font-props__row color">
      <div class="font-props__row-item">
        <el-color-picker v-model="fontColor" @change="value => stageStore.setElementsFontColor(value)" ref="colorPickerRef" :disabled="stageStore.inputDisabled" />
        <el-tag type="info" @click="toggleColorPickerVisible">{{ fontColor }}</el-tag>
      </div>

      <div class="font-props__row-item">
        <el-input
          v-model="fontColorOpacity"
          placeholder="输入数字"
          type="number"
          min="0"
          max="1"
          precision="1"
          @change="value => stageStore.setElementsFontColorOpacity(Number(value))"
          :disabled="stageStore.inputDisabled"
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
