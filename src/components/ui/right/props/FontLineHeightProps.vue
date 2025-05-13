<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { DefaultFontSize, FontLineHeightFactorList, FontLineHeightList } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontLineHeight = ref(DefaultStage.fontLineHeight);
const fontLineHeightFactor = ref(DefaultStage.fontLineHeightFactor);
const fontLineHeightAutoFit = ref(DefaultStage.fontLineHeightAutoFit);
const fontLineHeightFactorInputEnable = ref(DefaultStage.fontLineHeightFactorInputEnable);

watch(
  () => stageStore.fontLineHeight,
  newValue => {
    fontLineHeight.value = newValue;
  },
);

watch(
  () => stageStore.fontLineHeightFactor,
  newValue => {
    fontLineHeightFactor.value = newValue;
  },
);

watch(
  () => stageStore.fontLineHeightAutoFit,
  newValue => {
    fontLineHeightAutoFit.value = newValue;
  },
);

watch(
  () => stageStore.fontLineHeightFactorInputEnable,
  newValue => {
    fontLineHeightFactorInputEnable.value = newValue;
  },
);
</script>
<template>
  <div class="font-props right-props" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">行高</span>
      <el-tooltip class="item" effect="dark" :content="`点击${stageStore.fontLineHeightAutoFit ? '关闭' : '开启'}按字号自动适应行高功能，当前行高${stageStore.fontLineHeight}px`" placement="top">
        <el-switch
          v-model="fontLineHeightAutoFit"
          class="ml-2"
          inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          active-text="自适应行高"
          inactive-text="自定义行高"
          @change="value => stageStore.setElementsFontLineHeightAutoFit(value as boolean)"
        />
      </el-tooltip>
    </div>

    <div class="font-props__row" v-show="fontLineHeightAutoFit">
      <div class="font-props__row-item">
        <el-select
          v-model="fontLineHeightFactor"
          size="small"
          @change="value => stageStore.setElementsFontLineHeightFactor(value)"
          :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightFactorInputEnable"
        >
          <el-option v-for="item in FontLineHeightFactorList" :key="item.name" :label="`${item.value}x字号`" :value="item.value"> {{ item.value }}x字号 </el-option>
          <template #header>
            <el-input
              v-model="fontLineHeightFactor"
              :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightFactorInputEnable"
              size="small"
              type="number"
              :step="0.1"
              :min="0"
              :max="2"
              :precision="1"
              @change="value => stageStore.setElementsFontLineHeightFactor(Number(value))"
            >
              <template #prepend>自定义</template>
              <template #append>x字号</template>
            </el-input>
          </template>
        </el-select>
      </div>
    </div>

    <div class="font-props__row" v-show="!fontLineHeightAutoFit">
      <div class="font-props__row-item">
        <el-select v-model="fontLineHeight" size="small" @change="value => stageStore.setElementsFontLineHeight(value)" :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightInputEnable">
          <el-option v-for="item in FontLineHeightList" :key="item.name" :label="`${item.value}px`" :value="item.value"> {{ item.value }}px </el-option>
          <template #header>
            <el-input
              v-model="fontLineHeight"
              :disabled="stageStore.inputDisabled || !stageStore.fontLineHeightInputEnable"
              size="small"
              placeholder="请输入行高"
              type="number"
              :min="DefaultFontSize"
              :max="100"
              :precision="1"
              @change="value => stageStore.setElementsFontLineHeight(Number(value))"
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
