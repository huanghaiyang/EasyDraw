<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFontLetterSpacing, FontLetterSpacingList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontLetterSpacing = ref(DefaultFontLetterSpacing);
const fontLetterSpacingMixin = ref(false);

watch(
  () => stageStore.fontLetterSpacing,
  newValue => {
    fontLetterSpacing.value = newValue;
  },
);

watch(
  () => stageStore.fontLetterSpacingMixin,
  newValue => {
    fontLetterSpacingMixin.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">字间距</span>
    </div>

    <div class="font-props__row">
      <div class="font-props__row-item">
        <el-select
          v-model="fontLetterSpacing"
          :placeholder="`${stageStore.fontLetterSpacingMixin ? '混合字间距' : `${fontLetterSpacing}px`}`"
          size="small"
          @change="value => stageStore.setElementsFontLetterSpacing(value)"
          :disabled="stageStore.inputDisabled || !stageStore.fontLetterSpacingInputEnable"
        >
          <el-option v-for="item in FontLetterSpacingList" :key="item.name" :label="`${item.value}px`" :value="item.value"> {{ item.value }}px </el-option>
          <template #header>
            <el-input
              v-model="fontLetterSpacing"
              :disabled="stageStore.inputDisabled || !stageStore.fontLetterSpacingInputEnable"
              size="small"
              :placeholder="`${stageStore.fontLetterSpacingMixin ? '混合字间距' : `${fontLetterSpacing}px`}`"
              type="number"
              :min="1"
              :max="100"
              :precision="0"
              @change="value => stageStore.setElementsFontLetterSpacing(Number(value))"
            >
              <template #prepend>自定义</template>
              <template #append>px</template>
            </el-input>
          </template>
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
