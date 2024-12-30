<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { DefaultElementStyle, StrokeTypesArray } from "@/types/Styles";
import { ref, watch } from "vue";

const stageStore = useStageStore();

const strokeType = ref(DefaultElementStyle.strokeType);
const strokeWidth = ref(DefaultElementStyle.strokeWidth);

watch(
  () => stageStore.strokeWidth,
  (newValue) => {
    strokeWidth.value = newValue;
  }
);

watch(
  () => stageStore.strokeType,
  (newValue) => {
    strokeType.value = newValue;
  }
);
</script>
<template>
  <div class="stroke-props right-props">
    <div class="stroke-props__title">描边</div>

    <div class="stroke-props__row">
      <div class="stroke-props__row-item">
        <el-select v-model="strokeType" placeholder="描边类型" size="small">
          <el-option
            v-for="item in StrokeTypesArray"
            :key="item.type"
            :label="item.name"
            :value="item.type"
          />
        </el-select>
      </div>

      <div class="stroke-props__row-item">
        <el-input v-model="strokeWidth" placeholder="输入数字">
          <template #prepend>s</template>
          <template #append>px</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
