<script lang="ts" setup>
import RightProps from "@/components/ui/right/props/RightProps.vue";
</script>
<template>
  <div class="right-bar">
    <right-props></right-props>
  </div>
</template>
<style lang="less" scoped>
.right-bar {
  width: 200px;
  height: 100%;
  background-color: #fefefe;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
