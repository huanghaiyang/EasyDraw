<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { ref, watch } from "vue";
import { clamp } from "lodash";
import MathUtils from "@/utils/MathUtils";

const stageStore = useStageStore();
const aValue = ref(0);
const leanYValue = ref(0);

watch(
  () => stageStore.angle,
  newValue => {
    aValue.value = MathUtils.precise(newValue, 1);
  },
);

watch(
  () => stageStore.leanYAngle,
  newValue => {
    leanYValue.value = MathUtils.precise(newValue, 1);
  },
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
 * 设置组件Y倾斜角度
 *
 * @param value
 */
function setElementsLeanYAngle(value: string) {
  if (!stageStore.leanYAngleInputEnable) return;
  let val = Number(value);
  val = clamp(val, -89, 89);
  stageStore.setElementsLeanYAngle(val);
}
</script>
<template>
  <div class="angle-props right-props">
    <div class="angle-props__title">
      <span class="angle-props__title-text">角度</span>
      <el-icon :class="['iconfont', 'icon-verbise-flip-horizontal']" v-if="stageStore.flipX"> </el-icon>
    </div>

    <div class="angle-props__row">
      <div class="angle-props__row-item large">
        <el-input
          v-model="aValue"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.angleInputEnable"
          type="number"
          min="-180"
          max="180"
          precision="1"
          @change="setElementsAngle"
        >
          <template #prepend>整体</template>
          <template #append>度</template>
        </el-input>
      </div>

      <div class="angle-props__row-item large">
        <el-input
          v-model="leanYValue"
          placeholder="输入数字"
          :disabled="stageStore.inputDisabled || !stageStore.leanYAngleInputEnable"
          type="number"
          min="-89"
          max="89"
          precision="1"
          @change="setElementsLeanYAngle"
        >
          <template #prepend>Y轴倾斜</template>
          <template #append>度</template>
        </el-input>
      </div>
    </div>
  </div>
</template>
