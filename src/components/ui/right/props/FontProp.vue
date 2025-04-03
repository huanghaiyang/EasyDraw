<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontFamily, DefaultFontSize, FontFamilyList, FontSizeList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontFamily = ref(DefaultFontFamily);
const fontSize = ref(DefaultFontSize);

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
