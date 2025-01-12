<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";

const stageStore = useStageStore();
const aValue = ref(0);

watch(
  () => stageStore.angle,
  (newValue) => {
    aValue.value = newValue;
  }
);

/**
 * 设置旋转角度
 * 
 * @param value 
 */
function setElementsAngle(value: string) {
  let val = Number(value);
  if (val > 180) {
    val = 180 - val;
  }
  if (val < -180) {
    val = -180 - val;
  }
  stageStore.setElementsAngle(val);
}

</script>
<template>
  <div class="angle-props right-props">
    <div class="angle-props__title">角度</div>

    <div class="angle-props__row">
      <div class="angle-props__row-item">
        <el-input v-model="aValue" placeholder="输入数字" :disabled="stageStore.inputDisabled" type="number" min="-180"
          max="180" @change="setElementsAngle">
          <template #prepend>a</template>
          <template #append>°</template>
        </el-input>
      </div>

      <div class="angle-props__row-item"></div>
    </div>
  </div>
</template>
