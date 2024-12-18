import {
  IRenderTask,
  IStageMaskTaskCursorObj,
  IStageMaskTaskSelectionObj,
  IStageRenderer,
  IStageShield,
  SelectionRenderTypes,
  StageMaskElementTypes
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageMaskTaskSelection from "@/modules/render/StageMaskTaskSelection";
import StageMaskTaskCursor from "@/modules/render/StageMaskTaskCursor";
import StageMaskTaskClear from "@/modules/render/StageMaskTaskClear";

export default class StageRenderer implements IStageRenderer {

  shield: IStageShield;

  get maskParams() {
    return {
      canvas: this.shield.mask.canvas
    }
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 重绘蒙版
   */
  redrawMask(): void {
    let cargo = new RenderTaskCargo([]);
    if (this.shield.selection.getRenderType() === SelectionRenderTypes.rect) {
      cargo.add(this.createMaskSelectionTask());
    }
    if (this.shield.checkCreatorActive()) {
      cargo.add(this.createMaskCursorTask());
    }
    if (!cargo.isEmpty()) {
      cargo.prepend(this.createMaskClearTask());
      this.shield.mask.renderCargo(cargo);
    } else {
      cargo = null;
    }
  }

  /**
   * 重绘 provisional
   */
  redrawProvisional(): void {

  }

  redraw(): void {

  }

  clear(): void {

  }

  clearMask(): void {

  }

  clearProvisional(): void {

  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IRenderTask {
    const obj: IStageMaskTaskCursorObj = {
      point: this.shield.cursor.pos,
      type: StageMaskElementTypes.cursor,
      creatorCategory: this.shield.currentCreator.category
    }
    const task = new StageMaskTaskCursor(obj, this.maskParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTask(): IRenderTask {
    const obj: IStageMaskTaskSelectionObj = {
      points: this.shield.selection.getEdge(),
      type: StageMaskElementTypes.selection
    }
    const task = new StageMaskTaskSelection(obj, this.maskParams);
    return task;
  }

  /**
   * 创建一个清空mask的任务
   * 
   * @returns 
   */
  private createMaskClearTask(): IRenderTask {
    const task = new StageMaskTaskClear(null, this.maskParams);
    return task;
  }

}