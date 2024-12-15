import StageContainer from "@/modules/stage/container";
import StageShield from "@/modules/stage/shield";
import { Creator } from "@/types/constants";
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