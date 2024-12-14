<script lang="ts" setup>
let readyResolve: (value: void | PromiseLike<void>) => void;

const init = async () => {
  return new Promise((resolve) => {
    readyResolve = resolve;
    readyResolve();
  });
};

defineExpose({
  init,
});

</script>
<template>
</template>
<style lang="less">
#shield {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
