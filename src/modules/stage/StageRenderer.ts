import {
  IRenderTask,
  IStageMaskTask,
  IStageMaskTaskCursorObj,
  IStageMaskTaskSelectionHandlerObj,
  IStageMaskTaskSelectionObj,
  IStageRenderer,
  IStageShield,
  SelectionRenderTypes,
  StageMaskElementObjTypes,
  Directions
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageMaskTaskSelection from "@/modules/render/StageMaskTaskSelection";
import StageMaskTaskCursor from "@/modules/render/StageMaskTaskCursor";
import StageMaskTaskClear from "@/modules/render/StageMaskTaskClear";
import StageMaskTaskSelectionHandler from "@/modules/render/StageMaskTaskSelectionHandler";

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
      const selectionTask = this.createMaskSelectionTask();
      cargo.add(selectionTask);
      cargo.addAll(this.createMaskSelectionHandlerTasks((selectionTask as IStageMaskTask).obj as IStageMaskTaskSelectionObj));
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
      type: StageMaskElementObjTypes.cursor,
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
      type: StageMaskElementObjTypes.selection
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

  /**
   * 创建选区handler绘制任务
   * 
   * @param selectionObj 
   * @returns 
   */
  private createMaskSelectionHandlerTasks(selectionObj: IStageMaskTaskSelectionObj): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    selectionObj.points.forEach((point, index) => {
      let direction;
      switch (index) {
        case 0:
          direction = Directions.topLeft;
          break;
        case 1:
          direction = Directions.topRight;
          break;
        case 2:
          direction = Directions.bottomRight;
          break;
        case 3:
          direction = Directions.bottomLeft;
          break;
      }
      const obj: IStageMaskTaskSelectionHandlerObj = {
        point,
        direction,
        type: StageMaskElementObjTypes.selectionHandler,
      }
      const task = new StageMaskTaskSelectionHandler(direction, obj, this.maskParams);
      tasks.push(task);
    });
    return tasks;
  }

}