<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { FontFamilyList } from "@/styles/ElementStyles";
import DOMUtils from "@/utils/DOMUtils";
import { nextTick, ref, watch } from "vue";

const stageStore = useStageStore();
const fontFamily = ref(DefaultStage.fontFamily);
const fontFamilyMixin = ref(DefaultStage.fontFamilyMixin);

watch(
  () => stageStore.fontFamily,
  newValue => {
    fontFamily.value = newValue;
  },
);

watch(
  () => stageStore.fontFamilyMixin,
  newValue => {
    fontFamilyMixin.value = newValue;
  },
);

function setElementsFontFamily(value: string) {
  stageStore.setElementsFontFamily(value);
  nextTick(() => DOMUtils.clearFocus());
}
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">字体</span>
    </div>
    <div class="font-props__row">
      <div class="font-props__row-item" :style="{ width: '212px' }">
        <el-select
          v-model="fontFamily"
          :placeholder="`${fontFamilyMixin ? '混合字体' : fontFamily}`"
          size="small"
          @change="setElementsFontFamily"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        >
          <template #label="{ label, value }">
            <span :style="{ fontFamily: value }">{{ label }}</span>
          </template>
          <el-option v-for="item in FontFamilyList" :key="item.name" :label="item.name" :value="item.name" :style="{ fontFamily: item.name }" />
        </el-select>
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
