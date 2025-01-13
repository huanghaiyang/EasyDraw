<script setup lang="ts">
import { useStageStore } from "@/stores/stage";
import { ref, onMounted } from "vue";
import StageShieldVue from "@/components/stage/Shield.vue";
import { StageShieldInstance } from "@/types";
import { CreatorTypes } from "@/types/Creator";

const stageStore = useStageStore();
const stageRef = ref<HTMLElement | null>(null);
const stageShieldRef = ref<
  InstanceType<typeof StageShieldVue> & StageShieldInstance
>();
const handleCreatorSelect = (creator) => {
  const { type } = creator;
  if (type !== CreatorTypes.image) {
    stageStore.setCreator(creator);
  }
}

onMounted(async () => {
  if (stageShieldRef.value) {
    await stageShieldRef.value.init();
  }
  await stageStore.init({
    containerEl: stageRef.value as HTMLDivElement,
    shieldEl: stageShieldRef.value.$el as HTMLDivElement,
  });
});
</script>
<template>
  <div class="stage-container" ref="stageRef">
    <stage-shield-vue ref="stageShieldRef" />
    <creator-bar @select="handleCreatorSelect"/>
  </div>
</template>
<style lang="less" scoped>
.stage-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
  position: relative;
}
</style>
