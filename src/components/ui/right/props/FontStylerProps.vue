<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { FontStyler } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const fontStyler = ref(DefaultStage.fontStyler);

watch(
  () => stageStore.fontStyler,
  value => {
    fontStyler.value = value;
  },
);
</script>
<template>
  <div :class="['font-props right-props']" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">字体样式</span>
    </div>
    <div class="font-props__row">
      <div class="fill-props__row-item large">
        <el-button-group>
          <el-button
            :type="fontStyler === FontStyler.normal ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-point-hyphen']"
            @click="stageStore.setElementsFontStyler(FontStyler.normal)"
          ></el-button>
          <el-button
            :type="fontStyler === FontStyler.bold ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-bold']"
            @click="stageStore.setElementsFontStyler(FontStyler.bold)"
          ></el-button>
          <el-button
            :type="fontStyler === FontStyler.italic ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-italic']"
            @click="stageStore.setElementsFontStyler(FontStyler.italic)"
          ></el-button>
          <el-button
            :type="fontStyler === FontStyler.boldItalic ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-italic-bold']"
            @click="stageStore.setElementsFontStyler(FontStyler.boldItalic)"
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
