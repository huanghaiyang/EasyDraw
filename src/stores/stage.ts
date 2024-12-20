import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { Creator, CreatorTypes, ShieldDispatcherNames, StageInitParams } from "@/types";
import { getCreatorByType } from "@/types/helper";
import { defineStore } from "pinia";

const shield = new StageShield();
const container = new StageContainer();

export const useStageStore = defineStore("stage", {
  state: ()=> {
    return {
      currentCreator: getCreatorByType(CreatorTypes.moveable),
    }
  },
  actions: {
    /**
     * 初始化舞台
     * 
     * @param params 
     */
    async init(params: StageInitParams) {
      await container.init(params.containerEl);
      await shield.init(params.shieldEl);
      shield.on(ShieldDispatcherNames.elementCreated, this.onElementCreated);
    },
    /**
     * 设置绘制工具
     * 
     * @param creator 
     */
    async setCreator(creator: Creator) {
      await shield.setCreator(creator);
      this.currentCreator = creator;
    },
    /**
     * 舞台组件创建完毕
     * 
     * @param elementIds 
     */
    onElementCreated(elementIds: string[]) {
      this.setCreator(getCreatorByType(CreatorTypes.moveable));
    }
  },
});