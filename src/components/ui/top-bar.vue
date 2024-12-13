<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
<template>
  <div class="top-bar">{{ t("topBar.title") }}</div>
</template>
<style lang="less" scoped>
.top-bar {
  height: 30px;
  line-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
}
</style>
