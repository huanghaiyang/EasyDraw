<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultTextCase, TextCase } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const textCase = ref(DefaultTextCase);

watch(
  () => stageStore.textCase,
  value => {
    textCase.value = value;
  },
);
</script>
<template>
  <div :class="['font-props right-props']" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">字母大小写</span>
    </div>
    <div class="font-props__row">
      <div class="fill-props__row-item large">
        <el-button-group>
          <el-button
            :type="textCase === TextCase.none ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.textCaseInputEnable"
            :class="['iconfont', 'icon-verbise-point-hyphen']"
            @click="stageStore.setElementsTextCase(TextCase.none)"
          ></el-button>
          <el-button
            :type="textCase === TextCase.uppercase ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.textCaseInputEnable"
            :class="['iconfont', 'icon-verbise-uppercase']"
            @click="stageStore.setElementsTextCase(TextCase.uppercase)"
          ></el-button>
          <el-button
            :type="textCase === TextCase.lowercase ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.textCaseInputEnable"
            :class="['iconfont', 'icon-verbise-lowercase']"
            @click="stageStore.setElementsTextCase(TextCase.lowercase)"
          ></el-button>
          <el-button
            :type="textCase === TextCase.capitalize ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.textCaseInputEnable"
            :class="['iconfont', 'icon-verbise-upper-lower']"
            @click="stageStore.setElementsTextCase(TextCase.capitalize)"
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
