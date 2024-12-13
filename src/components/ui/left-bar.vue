<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
<template>
  <div class="left-bar">{{ t("leftBar.title") }}</div>
</template>
<style lang="less" scoped>
.left-bar {
  width: 200px;
  height: 100%;
  background-color: #fefefe;
}
</style>
