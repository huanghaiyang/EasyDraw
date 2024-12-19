import {
  IRenderTask,
  IStageDrawerMaskTask,
  IStageDrawerMaskTaskCursorObj,
  IStageDrawerMaskTaskSelectionHandlerObj,
  IStageDrawerMaskTaskSelectionObj,
  IStageDrawerMaskRenderer,
  SelectionRenderTypes,
  StageDrawerMaskObjTypes,
  Directions,
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageDrawerMaskTaskSelection from "@/modules/render/mask/task/StageDrawerMaskTaskSelection";
import StageDrawerMaskTaskCursor from "@/modules/render/mask/task/StageDrawerMaskTaskCursor";
import StageDrawerMaskTaskClear from "@/modules/render/mask/task/StageDrawerMaskTaskClear";
import StageDrawerMaskTaskSelectionHandler from "@/modules/render/mask/task/StageDrawerMaskTaskSelectionHandler";
import StageDrawerBaseRenderer from "@/modules/render/renderer/drawer/StageDrawerBaseRenderer";

export default class StageDrawerMaskRenderer extends StageDrawerBaseRenderer implements IStageDrawerMaskRenderer {
  /**
   * 重绘蒙版
   */
  redraw(): void {
    let cargo = new RenderTaskCargo([]);
    if (this.drawer.shield.selection.getRenderType() === SelectionRenderTypes.rect) {
      const selectionTask = this.createMaskSelectionTask();
      cargo.add(selectionTask);
      cargo.addAll(this.createMaskSelectionHandlerTasks((selectionTask as IStageDrawerMaskTask).obj as IStageDrawerMaskTaskSelectionObj));
    }
    if (this.drawer.shield.checkCreatorActive()) {
      cargo.add(this.createMaskCursorTask());
    }
    if (!cargo.isEmpty()) {
      cargo.prepend(this.createMaskClearTask());
      this.renderCargo(cargo);
    } else {
      cargo = null;
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IRenderTask {
    const obj: IStageDrawerMaskTaskCursorObj = {
      point: this.drawer.shield.cursor.pos,
      type: StageDrawerMaskObjTypes.cursor,
      creatorCategory: this.drawer.shield.currentCreator.category
    }
    const task = new StageDrawerMaskTaskCursor(obj, this.maskParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTask(): IRenderTask {
    const obj: IStageDrawerMaskTaskSelectionObj = {
      points: this.drawer.shield.selection.getEdge(),
      type: StageDrawerMaskObjTypes.selection
    }
    const task = new StageDrawerMaskTaskSelection(obj, this.maskParams);
    return task;
  }

  /**
   * 创建一个清空mask的任务
   * 
   * @returns 
   */
  private createMaskClearTask(): IRenderTask {
    const task = new StageDrawerMaskTaskClear(null, this.maskParams);
    return task;
  }

  /**
   * 创建选区handler绘制任务
   * 
   * @param selectionObj 
   * @returns 
   */
  private createMaskSelectionHandlerTasks(selectionObj: IStageDrawerMaskTaskSelectionObj): IRenderTask[] {
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
      const obj: IStageDrawerMaskTaskSelectionHandlerObj = {
        point,
        direction,
        type: StageDrawerMaskObjTypes.selectionHandler,
      }
      const task = new StageDrawerMaskTaskSelectionHandler(direction, obj, this.maskParams);
      tasks.push(task);
    });
    return tasks;
  }

}