<script lang="ts" setup>
import { Creator } from "@/types/Creator";

const { creator } = defineProps<{
  creator: Creator;
}>();
</script>

<template>
  <div class="creator-menu__item">
    <div class="create-menu__item-text">{{ creator.name }}</div>
    <div class="create-menu__item-icon">
      <el-icon :class="['iconfont', creator.icon]"></el-icon>
    </div>
  </div>
</template>
