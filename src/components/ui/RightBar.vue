<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
<template>
  <div class="right-bar">{{ t("rightBar.title") }}</div>
</template>
<style lang="less" scoped>
.right-bar {
  width: 200px;
  height: 100%;
  background-color: #fefefe;
}
</style>
