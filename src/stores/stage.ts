import StageShield from "@/modules/stage/shield";
import StageSlide from "@/modules/stage/slide";
import { defineStore } from "pinia";

const shield = new StageShield();
const slide = new StageSlide();


export const useStageStore = defineStore("stage", {
  state: () => ({

  }),
  actions: {
    async init() {
      await shield.init();
      await slide.init();
    },
  },
});