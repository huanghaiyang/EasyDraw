<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontFamily, FontFamilyList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontFamily = ref(DefaultFontFamily);

watch(
  () => stageStore.fontFamily,
  newValue => {
    fontFamily.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.primarySelectedElement?.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">字体</span>
    </div>
    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select v-model="fontFamily" placeholder="字体" size="small" @change="value => stageStore.setElementsFontFamily(value)" :disabled="stageStore.inputDisabled">
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
