import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { Creator, StageInitParams } from "@/types";
import { defineStore } from "pinia";

const shield = new StageShield();
const container = new StageContainer();


export const useStageStore = defineStore("stage", {
  state: () => ({
  }),
  actions: {
    async init(params: StageInitParams) {
      await container.init(params.containerEl);
      await shield.init(params.containerEl);
    },
    async setCreator(creator: Creator) {
      await shield.setCreator(creator);
    }
  },
});