<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontLineHeight, DefaultFontSize, FontLineHeightList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontLineHeight = ref(DefaultFontLineHeight);

watch(
  () => stageStore.fontLineHeight,
  newValue => {
    fontLineHeight.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">行高</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select
          v-model="fontLineHeight"
          placeholder=""
          size="small"
          @change="value => stageStore.setElementsFontLineHeight(value)"
          :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightInputEnable"
        >
          <el-option v-for="item in FontLineHeightList" :key="item.name" :label="`${item.value}px`" :value="item.value"> {{ item.value }}px </el-option>
        </el-select>
      </div>
      <div class="font-props__row-item">
        <el-input
          v-model="fontLineHeight"
          :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightInputEnable"
          size="small"
          placeholder=""
          type="number"
          :min="DefaultFontSize"
          :max="100"
          :precision="0"
          @change="value => stageStore.setElementsFontLineHeight(Number(value))"
        >
          <template #prepend>L</template>
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
