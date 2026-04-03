<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { useStageStore } from "@/stores/stage";
import { CreatorTypes } from "@/types/Creator";
import { useRoute } from 'vue-router';

const { locale: i18nLocale } = useI18n();
const appStore = useAppStore();
const stageStore = useStageStore();
const route = useRoute();
const { init, locale } = appStore;
init().then(() => {
  i18nLocale.value = locale;
});

const handleCreatorSelect = creator => {
  const { type } = creator;
  if (type !== CreatorTypes.image) {
    stageStore.setCreator(creator, true);
  }
};

// 检查是否是画布编辑页面
const isBoardEditor = () => {
  return route.path.startsWith('/board/');
};
</script>

<template>
  <!-- 路由视图 -->
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
  
  <!-- 画布编辑页面的组件 -->
  <div v-if="isBoardEditor()" :class="[{ penetrate: stageStore.shouldUIPassThrough }]">
    <div class="stage">
      <container />
    </div>

    <div class="left">
      <left-bar />
    </div>

    <div class="right">
      <right-bar />
    </div>

    <arbitrary-bar />
    <creator-bar @select="handleCreatorSelect" />
  </div>
</template>

<style scoped lang="less">
.penetrate {
  .left,
  .right,
  :deep(.create-bar),
  :deep(.arbitrary-bar) {
    pointer-events: none;
  }
}
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
  left: 0;
  right: 0;
}
</style>
