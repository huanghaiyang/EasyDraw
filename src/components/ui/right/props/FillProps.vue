<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultFillStyle } from "@/styles/ElementStyles";
import { ref, watch } from "vue";
import { Plus, Minus } from "@element-plus/icons-vue";

const colorPickerRef = ref();
const stageStore = useStageStore();

const fills = ref([{ ...DefaultFillStyle }]);

watch(
  () => stageStore.fills,
  newValue => {
    fills.value = newValue;
  },
);

const toggleColorPickerVisible = () => {
  if (!stageStore.fillInputEnable) return;
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="fill-props right-props" v-show="stageStore.fillEnable">
    <div class="fill-props__title">
      <span class="fill-props__title-text">填充</span>
      <el-icon><Plus @click="stageStore.addElementsFill(fills.length - 1)" /></el-icon>
    </div>

    <div v-for="(fill, index) in fills" :key="index">
      <div class="fill-props__row color">
        <div class="fill-props__row-item">
          <el-color-picker
            v-model="fill.color"
            @change="value => stageStore.setElementsFillColor(value, index)"
            ref="colorPickerRef"
            :disabled="stageStore.inputDisabled || !stageStore.fillInputEnable"
          />
          <el-tag type="info" @click="toggleColorPickerVisible">{{ fill.color }}</el-tag>
        </div>

        <div class="fill-props__row-item" :style="{ width: '106px' }">
          <el-input
            v-model="fill.colorOpacity"
            placeholder="输入数字"
            type="number"
            min="0"
            max="100"
            precision="0"
            @change="value => stageStore.setElementsFillColorOpacity(Number(value), index)"
            :disabled="stageStore.inputDisabled || !stageStore.fillInputEnable"
          >
            <template #prepend>透明</template>
            <template #append>%</template>
          </el-input>
        </div>
        <el-icon>
          <Minus @click="stageStore.removeElementsFill(index)" v-if="fills.length > 1" />
        </el-icon>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.color {
  margin-bottom: 8px;
}
.fill-props {
  &__row {
    .el-icon {
      cursor: pointer;
    }
  }
}
</style>
