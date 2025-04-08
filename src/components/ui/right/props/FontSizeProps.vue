<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontSize, FontSizeList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontSize = ref(DefaultFontSize);

watch(
  () => stageStore.fontSize,
  newValue => {
    fontSize.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">字号</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select v-model="fontSize" placeholder="字号" size="small" @change="value => stageStore.setElementsFontSize(value)" :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable">
          <el-option v-for="item in FontSizeList" :key="item.name" :label="item.name" :value="item.value" />
        </el-select>
      </div>
      <div class="font-props__row-item">
        <el-input
          v-model="fontSize"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
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
