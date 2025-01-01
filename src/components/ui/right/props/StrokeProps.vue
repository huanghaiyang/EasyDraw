<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultElementStyle, StrokeTypesArray } from "@/types/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();

const strokeColor = ref(DefaultElementStyle.strokeColor);
const strokeColorOpacity = ref(DefaultElementStyle.strokeColorOpacity);
const strokeType = ref(DefaultElementStyle.strokeType);
const strokeWidth = ref(DefaultElementStyle.strokeWidth);

watch(
  () => stageStore.strokeColorOpacity,
  (newValue) => {
    strokeColorOpacity.value = newValue;
  }
);

watch(
  () => stageStore.strokeColor,
  (newValue) => {
    strokeColor.value = newValue;
  }
);

watch(
  () => stageStore.strokeWidth,
  (newValue) => {
    strokeWidth.value = newValue;
  }
);

watch(
  () => stageStore.strokeType,
  (newValue) => {
    strokeType.value = newValue;
  }
);

const toggleColorPickerVisible = () => {
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="stroke-props right-props">
    <div class="stroke-props__title">描边</div>

    <div class="stroke-props__row color">
      <div class="stroke-props__row-item">
        <el-color-picker
          v-model="strokeColor"
          @change="stageStore.setElementsStrokeColor"
          ref="colorPickerRef"
        />
        <el-tag type="info" @click="toggleColorPickerVisible">{{ strokeColor }}</el-tag>
      </div>

      <div class="stroke-props__row-item">
        <el-input
          v-model="strokeColorOpacity"
          placeholder="输入数字"
          type="number"
          min="0"
          max="1"
          @change="
            (value) => stageStore.setElementsStrokeColorOpacity(Number(value))
          "
        >
          <template #prepend>o</template>
        </el-input>
      </div>
    </div>

    <div class="stroke-props__row">
      <div class="stroke-props__row-item">
        <el-select
          v-model="strokeType"
          placeholder="描边类型"
          size="small"
          @change="stageStore.setElementsStrokeType"
        >
          <el-option
            v-for="item in StrokeTypesArray"
            :key="item.type"
            :label="item.name"
            :value="item.type"
          />
        </el-select>
      </div>

      <div class="stroke-props__row-item">
        <el-input
          v-model="strokeWidth"
          placeholder="输入数字"
          type="number"
          min="0"
          @change="(value) => stageStore.setElementsStrokeWidth(Number(value))"
        >
          <template #prepend>s</template>
          <template #append>px</template>
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
