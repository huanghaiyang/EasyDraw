<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const { locale: i18nLocale } = useI18n();
const appStore = useAppStore();
const { init, locale } = appStore;
init().then(() => {
  i18nLocale.value = locale;
});
</script>

<template>
  <div class="left">
    <left-bar />
  </div>
  <div class="right">
    <right-bar />
  </div>
  <div class="stage">
    <container />
  </div>
</template>

<style scoped lang="less">
.left,
.right {
  position: absolute;
}

.left,
.right {
  top: 0;
  bottom: 0;
}

.left {
  left: 0;
  width: 220px;
}

.right {
  right: 0;
  width: 250px;
}

.stage {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 220px;
  right: 250px;
}
</style>
