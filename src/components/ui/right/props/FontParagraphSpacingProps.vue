<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultParagraphSpacing, ParagraphSpacingList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const paragraphSpacing = ref(DefaultParagraphSpacing);

watch(
  () => stageStore.paragraphSpacing,
  newValue => {
    paragraphSpacing.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">段落间距</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item" :style="{ width: '80px' }">
        <el-select
          v-model="paragraphSpacing"
          placeholder=""
          size="small"
          @change="value => stageStore.setElementsParagraphSpacing(value)"
          :disabled="stageStore.inputDisabled || !stageStore.paragraphSpacingInputEnable"
        >
          <el-option v-for="item in ParagraphSpacingList" :key="item.name" :label="`${item.value}px`" :value="item.value"> {{ item.value }}px </el-option>
        </el-select>
      </div>
      <div class="font-props__row-item" :style="{ width: '124px' }">
        <el-input
          v-model="paragraphSpacing"
          :disabled="stageStore.inputDisabled || !stageStore.paragraphSpacingInputEnable"
          size="small"
          placeholder=""
          type="number"
          :min="0"
          :max="100"
          :precision="0"
          @change="value => stageStore.setElementsParagraphSpacing(Number(value))"
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
