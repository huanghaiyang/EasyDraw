<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";
import { clamp } from "lodash";

const stageStore = useStageStore();
const aValue = ref(0);
const leanYValue = ref(0);

watch(
  () => stageStore.angle,
  (newValue) => {
    aValue.value = newValue;
  }
);

watch(
  () => stageStore.leanYAngle,
  (newValue) => {
    leanYValue.value = newValue;
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

/**
 * 设置元素Y倾斜角度
 * 
 * @param value 
 */
function setElementsLeanYAngle(value: string) {
  let val = Number(value);
  val = clamp(val, -89, 89);
  stageStore.setElementsLeanYAngle(val);
}

</script>
<template>
  <div class="angle-props right-props">
    <div class="angle-props__title">
      <span class="angle-props__title-text">角度</span>
      <el-icon :class="['iconfont', 'icon-verbise-flip-horizontal']" v-if="stageStore.flipX">
      </el-icon>
    </div>

    <div class="angle-props__row">
      <div class="angle-props__row-item">
        <el-input v-model="aValue" placeholder="输入数字" :disabled="stageStore.inputDisabled" type="number" min="-180"
          max="180" @change="setElementsAngle">
          <template #prepend>a</template>
          <template #append>°</template>
        </el-input>
      </div>

      <div class="angle-props__row-item" v-if="stageStore.primarySelectedElement?.leanYAngleModifyEnable">
        <el-input v-model="leanYValue" placeholder="输入数字" :disabled="stageStore.inputDisabled" type="number" min="-89"
          max="89" @change="setElementsLeanYAngle">
          <template #prepend>ly</template>
          <template #append>°</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
