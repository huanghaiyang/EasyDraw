import StageContainer from "@/modules/stage/container";
import StageShield from "@/modules/stage/shield";
import StageSlide from "@/modules/stage/slide";
import { defineStore } from "pinia";

const shield = new StageShield();
const slide = new StageSlide();
const container = new StageContainer();


export const useStageStore = defineStore("stage", {
  state: () => ({
  }),
  actions: {
    async init(params: StageInitParams) {
      await container.init(params.containerEl);
      await shield.init();
      await slide.init();
    },
  },
});