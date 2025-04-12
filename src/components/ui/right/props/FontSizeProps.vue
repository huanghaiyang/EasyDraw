<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontSize, FontSizeList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontSize = ref(DefaultFontSize);
const fontSizeMixin = ref(false);

watch(
  () => stageStore.fontSize,
  newValue => {
    fontSize.value = newValue;
  },
);

watch(
  () => stageStore.fontSizeMixin,
  newValue => {
    fontSizeMixin.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">字号</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item" :style="{ width: '80px' }">
        <el-select
          v-model="fontSize"
          :placeholder="`${fontSizeMixin ? '混合字号' : `${fontSize}px`}`"
          size="small"
          @change="value => stageStore.setElementsFontSize(value)"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        >
          <el-option v-for="item in FontSizeList" :key="item.name" :label="`${item.value}px`" :value="item.value"> {{ item.value }}px </el-option>
        </el-select>
      </div>
      <div class="font-props__row-item" :style="{ width: '124px' }">
        <el-input
          v-model="fontSize"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
          size="small"
          :placeholder="`${fontSizeMixin ? '混合字号' : `${fontSize}px`}`"
          type="number"
          :min="1"
          :max="100"
          :precision="0"
          @change="value => stageStore.setElementsFontSize(Number(value))"
        >
          <template #prepend>自定义</template>
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
