<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { CreatorTypes } from "@/types/Creator";
import { DefaultStrokeStyle, getStokeTypes } from "@/styles/ElementStyles";
import { ref, watch } from "vue";

const colorPickerRef = ref();
const stageStore = useStageStore();
const strokes = ref([{ ...DefaultStrokeStyle }]);

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
  colorPickerRef.value.show();
};
</script>
<template>
  <div
    class="stroke-props right-props"
    v-if="stageStore.primarySelectedElement?.strokeEnable"
  >
    <div class="stroke-props__title">描边</div>

    <div v-for="(stroke, index) in strokes" :key="index">
      <div class="stroke-props__row color">
        <div class="stroke-props__row-item">
          <el-color-picker
            v-model="stroke.color"
            @change="value => stageStore.setElementsStrokeColor(value, index)"
            ref="colorPickerRef"
            :disabled="stageStore.inputDisabled"
          />
          <el-tag type="info" @click="toggleColorPickerVisible">{{
            stroke.color
          }}</el-tag>
        </div>

        <div class="stroke-props__row-item">
          <el-input
            v-model="stroke.colorOpacity"
            placeholder="输入数字"
            type="number"
            min="0"
            max="1"
            @change="
              value =>
                stageStore.setElementsStrokeColorOpacity(Number(value), index)
            "
            :disabled="stageStore.inputDisabled"
          >
            <template #prepend>o</template>
          </el-input>
        </div>
      </div>

      <div class="stroke-props__row">
        <div class="stroke-props__row-item">
          <el-select
            v-model="stroke.type"
            placeholder="描边类型"
            size="small"
            @change="value => stageStore.setElementsStrokeType(value, index)"
            :disabled="stageStore.inputDisabled"
          >
            <el-option
              v-for="item in strokeTypes"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
        </div>

        <div class="stroke-props__row-item">
          <el-input
            v-model="stroke.width"
            placeholder="输入数字"
            type="number"
            :min="
              stageStore.primarySelectedElement?.model.type ===
              CreatorTypes.line
                ? 1
                : 0
            "
            @change="
              value => stageStore.setElementsStrokeWidth(Number(value), index)
            "
            :disabled="stageStore.inputDisabled"
          >
            <template #prepend>s</template>
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
</style>
