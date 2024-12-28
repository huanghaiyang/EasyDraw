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
</script>
<template>
  <div class="angle-props right-props">
    <div class="angle-props__title">角度</div>

    <div class="angle-props__row">
      <div class="angle-props__row-item">
        <el-input v-model="aValue" placeholder="输入数字">
          <template #prepend>w</template>
          <template #append>px</template>
        </el-input>
      </div>

      <div class="angle-props__row-item">
        
      </div>
    </div>
  </div>
</template>
