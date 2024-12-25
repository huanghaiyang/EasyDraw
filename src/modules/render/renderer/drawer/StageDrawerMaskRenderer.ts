import {
  IRenderTask,
  IStageDrawerMaskTask,
  IStageDrawerMaskTaskCursorModel,
  IStageDrawerMaskTaskSelectionHandlerModel,
  IStageDrawerMaskTaskSelectionModel,
  IStageDrawerMaskRenderer,
  StageDrawerMaskModelTypes,
  Directions,
  IStageDrawerMask,
  IStageElement,
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageDrawerMaskTaskSelection from "@/modules/render/mask/task/StageDrawerMaskTaskSelection";
import StageDrawerMaskTaskCursor from "@/modules/render/mask/task/StageDrawerMaskTaskCursor";
import StageDrawerMaskTaskClear from "@/modules/render/mask/task/StageDrawerMaskTaskClear";
import StageDrawerMaskTaskSelectionHandler from "@/modules/render/mask/task/StageDrawerMaskTaskSelectionHandler";
import StageDrawerBaseRenderer from "@/modules/render/renderer/drawer/StageDrawerBaseRenderer";
import StageDrawerMaskTaskRotate from "@/modules/render/mask/task/StageDrawerMaskTaskRotate";

export default class StageDrawerMaskRenderer extends StageDrawerBaseRenderer<IStageDrawerMask> implements IStageDrawerMaskRenderer {

  private _lastCursorRendered = false;
  private _lastSelectionRendered = false;

  /**
   * 重绘蒙版
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    let cursorRendered = false;

    // 绘制选区
    const selectionTasks = this.createMaskSelectionTasks();
    selectionTasks.forEach(task => {
      cargo.add(task);
      if (((task as IStageDrawerMaskTask).data as IStageDrawerMaskTaskSelectionModel).type === StageDrawerMaskModelTypes.selection) {
        cargo.addAll(this.createMaskSelectionHandlerTasks((task as IStageDrawerMaskTask).model as IStageDrawerMaskTaskSelectionModel));
      }
    });
    if (selectionTasks.length) {
      this._lastSelectionRendered = true;
    }

    // 如果当前舞台只有一个被选中的组件且组件已经不是正在创建中的，则渲染组件的旋转句柄图标
    if (this.drawer.shield.store.uniqSelectedElement) {
      cargo.add(this.createMaskRotateTask(this.drawer.shield.store.uniqSelectedElement));
    }

    // 绘制光标
    if (this.drawer.shield.isDrawerActive) {
      if (this.drawer.shield.cursor.value) {
        cargo.add(this.createMaskCursorTask());
        cursorRendered = true;
        this._lastCursorRendered = true;
      }
    }

    // 如果有绘制任务，则添加一个清除任务到队列头部
    if (!cargo.isEmpty()) {
      cargo.prepend(this.createMaskClearTask());
      await this.renderCargo(cargo);
    } else {
      // 解决光标移出舞台出现残留的问题
      if ((this._lastCursorRendered || this._lastSelectionRendered) && !selectionTasks.length && !cursorRendered) {
        cargo.add(new StageDrawerMaskTaskClear(null, this.renderParams));
        await this.renderCargo(cargo);
        this._lastCursorRendered = false;
        this._lastSelectionRendered = false;
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
    const model: IStageDrawerMaskTaskCursorModel = {
      point: this.drawer.shield.cursor.value,
      type: StageDrawerMaskModelTypes.cursor,
      creatorCategory: this.drawer.shield.currentCreator.category
    }
    const task = new StageDrawerMaskTaskCursor(model, this.renderParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTasks(): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    const models: IStageDrawerMaskTaskSelectionModel[] = this.drawer.shield.selection.getSelectionModels();
    models.forEach(model => {
      const task = new StageDrawerMaskTaskSelection(model, this.renderParams);
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
   * @param selectionModel 
   * @returns 
   */
  private createMaskSelectionHandlerTasks(selectionModel: IStageDrawerMaskTaskSelectionModel): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    selectionModel.points.forEach((point, index) => {
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
      const model: IStageDrawerMaskTaskSelectionHandlerModel = {
        point,
        direction,
        type: StageDrawerMaskModelTypes.selectionHandler,
      }
      const task = new StageDrawerMaskTaskSelectionHandler(direction, model, this.renderParams);
      tasks.push(task);
    });
    return tasks;
  }

  /**
   * 创建一个绘制旋转图标的任务
   * 
   * @param element 
   * @returns 
   */
  private createMaskRotateTask(element: IStageElement): IRenderTask {
    return new StageDrawerMaskTaskRotate(element.rotationModel, this.renderParams);
  }

}