<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultTextAlign, DefaultTextVerticalAlign, TextVerticalAlign } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const textAlign = ref(DefaultTextAlign);
const textVerticalAlign = ref(DefaultTextVerticalAlign);

watch(
  () => stageStore.textAlign,
  value => {
    textAlign.value = value;
  },
);

watch(
  () => stageStore.textVerticalAlign,
  value => {
    textVerticalAlign.value = value;
  },
);
</script>
<template>
  <div :class="['font-props right-props']" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text">文本对齐</span>
    </div>
    <div class="font-props__row">
      <div class="fill-props__row-item">
        <el-button-group>
          <el-button
            :type="textAlign === 'left' ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-text-align-left']"
            @click="stageStore.setElementsTextAlign('left')"
          ></el-button>
          <el-button
            :type="textAlign === 'center' ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-text-align-center']"
            @click="stageStore.setElementsTextAlign('center')"
          ></el-button>
          <el-button
            :type="textAlign === 'right' ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-text-align-right']"
            @click="stageStore.setElementsTextAlign('right')"
          ></el-button>
        </el-button-group>
      </div>
      <div class="fill-props__row-item">
        <el-button-group>
          <el-button
            :type="textVerticalAlign === TextVerticalAlign.top ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-vertical-align-top']"
            @click="stageStore.setElementsTextVerticalAlign(TextVerticalAlign.top)"
          ></el-button>
          <el-button
            :type="textVerticalAlign === TextVerticalAlign.middle ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-vertical-align-middle']"
            @click="stageStore.setElementsTextVerticalAlign(TextVerticalAlign.middle)"
          ></el-button>
          <el-button
            :type="textVerticalAlign === TextVerticalAlign.bottom ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-vertical-align-bottom']"
            @click="stageStore.setElementsTextVerticalAlign(TextVerticalAlign.bottom)"
          ></el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.font-props {
  .el-button {
    font-size: 20px;
    color: rgba(0, 0, 0, 0.85);
    padding: 2px;

    &--success {
      color: #1890ff;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    &:hover {
      color: #1890ff;
      cursor: pointer;
    }

    &[aria-disabled="true"] {
      color: rgba(0, 0, 0, 0.65);
      cursor: not-allowed;

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
}
</style>
