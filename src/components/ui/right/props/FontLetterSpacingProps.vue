<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontLetterSpacing, FontLetterSpacingList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontLetterSpacing = ref(DefaultFontLetterSpacing);

watch(
  () => stageStore.fontLetterSpacing,
  newValue => {
    fontLetterSpacing.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">字间距</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select
          v-model="fontLetterSpacing"
          placeholder=""
          size="small"
          @change="value => stageStore.setElementsFontLetterSpacing(value)"
          :disabled="stageStore.inputDisabled || !stageStore.fontLetterSpacingInputEnable"
        >
          <el-option v-for="item in FontLetterSpacingList" :key="item.name" :label="item.name" :value="item.value" />
        </el-select>
      </div>
      <div class="font-props__row-item">
        <el-input
          v-model="fontLetterSpacing"
          :disabled="stageStore.inputDisabled || !stageStore.fontLetterSpacingInputEnable"
          size="small"
          placeholder=""
          type="number"
          :min="1"
          :max="100"
          @change="value => stageStore.setElementsFontLetterSpacing(Number(value))"
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
