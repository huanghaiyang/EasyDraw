<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { TextDecoration } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const colorPickerRef = ref();
const textDecoration = ref(DefaultStage.textDecoration);
const textDecorationThickness = ref(DefaultStage.textDecorationThickness);
const textDecorationThicknessMixin = ref(DefaultStage.textDecorationThicknessMixin);
const textDecorationColor = ref(DefaultStage.textDecorationColor);
const textDecorationOpacity = ref(DefaultStage.textDecorationOpacity);
const textDecorationColorMixin = ref(DefaultStage.textDecorationColorMixin);
const textDecorationOpacityMixin = ref(DefaultStage.textDecorationOpacityMixin);

watch(
  () => stageStore.textDecoration,
  value => {
    textDecoration.value = value;
  },
);

watch(
  () => stageStore.textDecorationThickness,
  value => {
    textDecorationThickness.value = value;
  },
);

watch(
  () => stageStore.textDecorationThicknessMixin,
  value => {
    textDecorationThicknessMixin.value = value;
  },
);

watch(
  () => stageStore.textDecorationColor,
  value => {
    textDecorationColor.value = value;
  },
);

watch(
  () => stageStore.textDecorationColorMixin,
  value => {
    textDecorationColorMixin.value = value;
  },
);

watch(
  () => stageStore.textDecorationOpacity,
  value => {
    textDecorationOpacity.value = value;
  },
);

watch(
  () => stageStore.textDecorationOpacityMixin,
  value => {
    textDecorationOpacityMixin.value = value;
  },
);

const toggleColorPickerVisible = () => {
  if (!stageStore.fontInputEnable) return;
  colorPickerRef.value.show();
};
</script>
<template>
  <div :class="['font-props right-props']" v-show="stageStore.fontEnable">
    <div class="font-props__title">
      <span class="font-props__title-text text-2">文本装饰</span>
    </div>
    <div class="font-props__row">
      <div class="fill-props__row-item">
        <el-button-group>
          <el-button
            :type="textDecoration === TextDecoration.none ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-decoration-none']"
            title="无装饰"
            @click="stageStore.setElementsTextDecoration(TextDecoration.none)"
          ></el-button>
          <el-button
            :type="textDecoration === TextDecoration.underline ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-decoration-underline']"
            title="下划线"
            @click="stageStore.setElementsTextDecoration(TextDecoration.underline)"
          ></el-button>
          <el-button
            :type="textDecoration === TextDecoration.overline ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-decoration-overline']"
            title="上划线"
            @click="stageStore.setElementsTextDecoration(TextDecoration.overline)"
          ></el-button>
          <el-button
            :type="textDecoration === TextDecoration.lineThrough ? 'success' : 'default'"
            :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
            :class="['iconfont', 'icon-verbise-decoration-line-through']"
            title="删除线"
            @click="stageStore.setElementsTextDecoration(TextDecoration.lineThrough)"
          ></el-button>
        </el-button-group>
      </div>
      <div class="fill-props__row-item" :style="{ width: '106px' }">
        <el-input
          v-model="textDecorationThickness"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
          size="small"
          :placeholder="`${textDecorationThicknessMixin ? '混合线宽' : `${textDecorationThickness}px`}`"
          type="number"
          :min="1"
          :max="100"
          :precision="0"
          @change="value => stageStore.setElementsTextDecorationThickness(Number(value))"
        >
          <template #prepend>线宽</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>

    <div class="font-props__row color">
      <div class="font-props__row-item">
        <el-color-picker
          v-model="textDecorationColor"
          @change="value => stageStore.setElementsTextDecorationColor(value)"
          ref="colorPickerRef"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        />
        <el-tag type="info" @click="toggleColorPickerVisible">{{ `${textDecorationColorMixin ? "混合颜色" : textDecorationColor}` }}</el-tag>
      </div>

      <div class="font-props__row-item" :style="{ width: '106px' }">
        <el-input
          v-model="textDecorationOpacity"
          :placeholder="`${textDecorationOpacityMixin ? '混合透明度' : textDecorationOpacity}`"
          type="number"
          min="0"
          max="100"
          :precision="0"
          @change="value => stageStore.setElementsTextDecorationOpacity(Number(value))"
          :disabled="stageStore.inputDisabled || !stageStore.fontInputEnable"
        >
          <template #prepend>透明</template>
          <template #append>%</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.font-props {
  .el-button {
    font-size: 18px;
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
