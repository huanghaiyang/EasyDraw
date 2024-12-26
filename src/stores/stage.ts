import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { Creator, CreatorCategories, IPoint, IStageElement, ShieldDispatcherNames, StageInitParams } from "@/types";
import { MoveableCreator, RectangleCreator } from "@/types/constants";
import { throttle } from "lodash";
import { defineStore } from "pinia";

const shield = new StageShield();
const container = new StageContainer();

export const useStageStore = defineStore("stage", {
  state: () => {
    return {
      currentCreator: MoveableCreator,
      currentCursorCreator: MoveableCreator,
      currentShapeCreator: RectangleCreator,
      selectedElements: [],
      targetElements: [],
      position: {
        x: 0,
        y: 0
      }
    }
  },
  getters: {
    uniqSelectedElement(): IStageElement {
      return this.selectedElements.length === 1 ? this.selectedElements[0] : null;
    },
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

      this.setCreator(MoveableCreator);

      shield.on(ShieldDispatcherNames.elementCreated, this.onElementCreated);
      shield.on(ShieldDispatcherNames.selectedChanged, this.onSelectedChanged);
      shield.on(ShieldDispatcherNames.targetChanged, this.onTargetChanged);
      shield.on(ShieldDispatcherNames.positionChanged, throttle(this.onPositionChanged.bind(this), 100));
    },
    /**
     * 设置绘制工具
     * 
     * @param creator 
     */
    async setCreator(creator: Creator) {
      await shield.setCreator(creator);
      this.currentCreator = creator;
      if (creator.category === CreatorCategories.cursor) {
        this.currentCursorCreator = creator;
      }
      if (creator.category === CreatorCategories.shapes) {
        this.currentShapeCreator = creator;
      }
    },
    /**
     * 舞台组件创建完毕
     * 
     * @param elementIds 
     */
    onElementCreated(elementIds: string[]) {
      this.setCreator(MoveableCreator);
    },
    /**
     * 舞台组件选中状态改变
     * 
     * @param selectedElements 
     */
    onSelectedChanged(selectedElements: IStageElement[]) {
      this.selectedElements = selectedElements;
    },
    /**
     * 舞台组件命中状态改变
     * 
     * @param targetElements 
     */
    onTargetChanged(targetElements: IStageElement[]) {
      this.targetElements = targetElements;
    },
    /**
     * 组件坐标变化
     * 
     * @param position 
     */
    onPositionChanged(element: IStageElement, position: IPoint) {
      if (position) {
        this.position = {
          x: position.x,
          y: position.y
        };
      }
    },
  },
});