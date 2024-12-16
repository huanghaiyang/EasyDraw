<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import TopBar from "@/components/ui/TopBar.vue";
import LeftBar from "@/components/ui/LeftBar.vue";
import RightBar from "@/components/ui/RightBar.vue";
import StageContainer from "@/components/stage/Container.vue";

const { locale: i18nLocale } = useI18n();
const appStore = useAppStore();
const { init, locale } = appStore;
init().then(() => {
  i18nLocale.value = locale;
});
</script>

<template>
  <div class="top">
    <top-bar />
  </div>
  <div class="left">
    <left-bar />
  </div>
  <div class="right">
    <right-bar />
  </div>
  <div class="stage">
    <stage-container />
  </div>
</template>

<style scoped lang="less">
.top,
.left,
.right {
  position: absolute;
}
.top {
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.left,
.right {
  top: 30px;
  bottom: 0;
  width: 200px;
}
.left {
  left: 0;
}
.right {
  right: 0;
}
.stage {
  position: absolute;
  top: 30px;
  bottom: 0;
  left: 200px;
  right: 200px;
}
</style>
