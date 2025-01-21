<script lang="ts" setup>
import { Creator } from "@/types/Creator";

const { creator } = defineProps<{
  creator: Creator;
}>();
</script>

<template>
  <div class="creator-menu__item">
    <div class="text">{{ creator.name }}</div>
    <div class="icon">
      <el-icon :class="['iconfont', creator.icon]"></el-icon>
    </div>
    <div class="shortcut" v-if="!!creator.shortcut">{{ creator.shortcut }}</div>
  </div>
</template>
