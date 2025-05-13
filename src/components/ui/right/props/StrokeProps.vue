<script lang="ts" setup>
import { DefaultStage, useStageStore } from "@/stores/stage";
import { CreatorTypes } from "@/types/Creator";
import { getStokeTypes } from "@/styles/ElementStyles";
import { Plus, Minus } from "@element-plus/icons-vue";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();
const strokes = ref([...DefaultStage.strokes]);

watch(
  () => stageStore.strokes,
  newValue => {
    strokes.value = newValue;
  },
);

const strokeTypes = ref([]);
watch(
  () => stageStore.primarySelectedElement?.model.type,
  (creatorType: CreatorTypes) => {
    strokeTypes.value = getStokeTypes(creatorType);
  },
);

const toggleColorPickerVisible = () => {
  if (!stageStore.strokeInputEnable) return;
  colorPickerRef.value.show();
};
</script>
<template>
  <div class="stroke-props right-props" v-show="stageStore.strokeEnable">
    <div class="stroke-props__title">
      <span class="stroke-props__title-text">描边</span>
      <el-icon><Plus @click="stageStore.addElementsStroke(strokes.length - 1)" /></el-icon>
    </div>

    <div v-for="(stroke, index) in strokes" :key="index">
      <div class="stroke-props__row color">
        <div class="stroke-props__row-item">
          <el-color-picker
            v-model="stroke.color"
            @change="value => stageStore.setElementsStrokeColor(value, index)"
            ref="colorPickerRef"
            :disabled="stageStore.inputDisabled || !stageStore.strokeInputEnable"
          />
          <el-tag type="info" @click="toggleColorPickerVisible">{{ stroke.color }}</el-tag>
        </div>

        <div class="stroke-props__row-item" :style="{ width: '106px' }">
          <el-input
            v-model="stroke.colorOpacity"
            placeholder="输入数字"
            type="number"
            min="0"
            max="100"
            precision="0"
            @change="value => stageStore.setElementsStrokeColorOpacity(Number(value), index)"
            :disabled="stageStore.inputDisabled || !stageStore.strokeInputEnable"
          >
            <template #prepend>透明</template>
            <template #append>%</template>
          </el-input>
        </div>

        <el-icon>
          <Minus @click="stageStore.removeElementsStroke(index)" v-show="strokes.length > 1" />
        </el-icon>
      </div>

      <div class="stroke-props__row">
        <div class="stroke-props__row-item">
          <el-select
            v-model="stroke.type"
            placeholder="描边类型"
            size="small"
            @change="value => stageStore.setElementsStrokeType(value, index)"
            :disabled="stageStore.inputDisabled || !stageStore.strokeInputEnable"
          >
            <el-option v-for="item in strokeTypes" :key="item.type" :label="item.name" :value="item.type" />
          </el-select>
        </div>

        <div class="stroke-props__row-item" :style="{ width: '106px' }">
          <el-input
            v-model="stroke.width"
            placeholder="输入数字"
            type="number"
            precision="1"
            :min="stageStore.primarySelectedElement?.model.type === CreatorTypes.line ? 1 : 0"
            @change="value => stageStore.setElementsStrokeWidth(Number(value), index)"
            :disabled="stageStore.inputDisabled || !stageStore.strokeInputEnable"
          >
            <template #prepend>宽度</template>
            <template #append>px</template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.color {
  margin-bottom: 8px;
}
.stroke-props {
  &__row {
    .el-icon {
      cursor: pointer;
    }
  }
}
</style>
