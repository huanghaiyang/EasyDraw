import {
  IRenderTask,
  IStageDrawerMaskTask,
  IStageDrawerMaskTaskCursorObj,
  IStageDrawerMaskTaskSelectionHandlerObj,
  IStageDrawerMaskTaskSelectionObj,
  IStageDrawerMaskRenderer,
  StageDrawerMaskObjTypes,
  Directions,
  IStageDrawerMask,
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageDrawerMaskTaskSelection from "@/modules/render/mask/task/StageDrawerMaskTaskSelection";
import StageDrawerMaskTaskCursor from "@/modules/render/mask/task/StageDrawerMaskTaskCursor";
import StageDrawerMaskTaskClear from "@/modules/render/mask/task/StageDrawerMaskTaskClear";
import StageDrawerMaskTaskSelectionHandler from "@/modules/render/mask/task/StageDrawerMaskTaskSelectionHandler";
import StageDrawerBaseRenderer from "@/modules/render/renderer/drawer/StageDrawerBaseRenderer";

export default class StageDrawerMaskRenderer extends StageDrawerBaseRenderer<IStageDrawerMask> implements IStageDrawerMaskRenderer {

  private _lastCursorRendered = false;

  /**
   * 重绘蒙版
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    let hasSelection = false;
    let hasCursor = false;
    let hasHitting = false;

    // 绘制选区
    const selectionTasks = this.createMaskSelectionTasks();
    selectionTasks.forEach(task => {
      cargo.add(task);
      if (((task as IStageDrawerMaskTask).data as IStageDrawerMaskTaskSelectionObj).type === StageDrawerMaskObjTypes.selection) {
        cargo.addAll(this.createMaskSelectionHandlerTasks((task as IStageDrawerMaskTask).obj as IStageDrawerMaskTaskSelectionObj));
      }
    });
    if (selectionTasks.length) {
      hasSelection = true;
    }

    // 绘制命中选区
    if (this.drawer.shield.store.hittingElements.length) {
      hasHitting = true;
    }

    // 绘制光标
    if (this.drawer.shield.checkDrawerActive()) {
      if (this.drawer.shield.cursor.value) {
        cargo.add(this.createMaskCursorTask());
        hasCursor = true;
        this._lastCursorRendered = true;
      }
    }

    // 如果有绘制任务，则添加一个清除任务到队列头部
    if (!cargo.isEmpty()) {
      cargo.prepend(this.createMaskClearTask());
      await this.renderCargo(cargo);
    } else {
      // 解决光标移出舞台出现残留的问题
      if (this._lastCursorRendered && !hasSelection && !hasCursor && !hasHitting) {
        cargo.add(new StageDrawerMaskTaskClear(null, this.renderParams));
        await this.renderCargo(cargo);
      } else {
        cargo = null;
      }
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IRenderTask {
    const obj: IStageDrawerMaskTaskCursorObj = {
      point: this.drawer.shield.cursor.value,
      type: StageDrawerMaskObjTypes.cursor,
      creatorCategory: this.drawer.shield.currentCreator.category
    }
    const task = new StageDrawerMaskTaskCursor(obj, this.renderParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTasks(): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    const objs: IStageDrawerMaskTaskSelectionObj[] = this.drawer.shield.selection.getSelectionObjs();
    objs.forEach(obj => {
      const task = new StageDrawerMaskTaskSelection(obj, this.renderParams);
      tasks.push(task);
    });
    return tasks;
  }

  /**
   * 创建一个清空mask的任务
   * 
   * @returns 
   */
  private createMaskClearTask(): IRenderTask {
    const task = new StageDrawerMaskTaskClear(null, this.renderParams);
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
      const task = new StageDrawerMaskTaskSelectionHandler(direction, obj, this.renderParams);
      tasks.push(task);
    });
    return tasks;
  }

}