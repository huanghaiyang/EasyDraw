<script lang="ts" setup>
let readyResolve: (value: void | PromiseLike<void>) => void;

const init = async () => {
  return new Promise(resolve => {
    readyResolve = resolve;
    readyResolve();
  });
};

defineExpose({
  init,
});
</script>
<template>
  <div class="stage-shield"></div>
</template>
<style lang="less">
.stage-shield {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
