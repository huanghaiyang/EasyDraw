import {
  IRenderTask,
  IMaskTask,
  IMaskCursorModel,
  IMaskTransformerModel,
  IMaskSelectionModel,
  IMaskRenderer,
  DrawerMaskModelTypes,
  IDrawerMask,
  IElement,
  IMaskSizeIndicatorModel,
} from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import MaskTaskSelection from "@/modules/render/mask/task/MaskTaskSelection";
import MaskTaskCursor from "@/modules/render/mask/task/MaskTaskCursor";
import MaskTaskClear from "@/modules/render/mask/task/MaskTaskClear";
import MaskTaskTransformer from "@/modules/render/mask/task/MaskTaskTransformer";
import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import MaskTaskRotate from "@/modules/render/mask/task/MaskTaskRotate";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskSizeIndicator from "@/modules/render/mask/task/MaskTaskSizeIndicator";
import { DefaultSelectionSizeIndicatorDistance } from "@/types/constants";

export default class MaskRenderer extends BaseRenderer<IDrawerMask> implements IMaskRenderer {

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
      if (((task as IMaskTask).data as IMaskSelectionModel).type === DrawerMaskModelTypes.selection) {
        cargo.addAll(this.createMaskSizeTransformerTasks((task as IMaskTask).model as IMaskSelectionModel));
      }
    });
    if (selectionTasks.length) {
      this._lastSelectionRendered = true;
    }

    // 如果当前舞台只有一个被选中的组件且组件已经不是正在创建中的，则渲染组件的旋转句柄图标
    if (this.drawer.shield.store.uniqSelectedElement) {
      if (this.drawer.shield.configure.rotationIconEnable) {
        cargo.add(this.createMaskRotateTask(this.drawer.shield.store.uniqSelectedElement));
      }
      cargo.add(this.createMaskSizeIndicatorTask(this.drawer.shield.store.uniqSelectedElement));
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
        cargo.add(new MaskTaskClear(null, this.renderParams));
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
    const model: IMaskCursorModel = {
      point: this.drawer.shield.cursor.value,
      type: DrawerMaskModelTypes.cursor,
      creatorCategory: this.drawer.shield.currentCreator.category
    }
    const task = new MaskTaskCursor(model, this.renderParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTasks(): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    const models: IMaskSelectionModel[] = this.drawer.shield.selection.getSelectionModels();
    models.forEach(model => {
      const task = new MaskTaskSelection(model, this.renderParams);
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
    const task = new MaskTaskClear(null, this.renderParams);
    return task;
  }

  /**
   * 创建选区handler绘制任务
   * 
   * @param selectionModel 
   * @returns 
   */
  private createMaskSizeTransformerTasks(selectionModel: IMaskSelectionModel): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    const { points = [], angle = 0 } = selectionModel;
    points.forEach((point, index) => {
      const model: IMaskTransformerModel = {
        point,
        type: DrawerMaskModelTypes.transformer,
        angle
      }
      const task = new MaskTaskTransformer(model, this.renderParams);
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
  private createMaskRotateTask(element: IElement): IRenderTask {
    return new MaskTaskRotate(element.rotationModel, this.renderParams);
  }

  /**
   * 给出一个元素创建一个绘制尺寸指示器的任务
   * 
   * @param element 
   */
  private createMaskSizeIndicatorTask(element: IElement): IRenderTask {
    if (element.model.angle % 90 === 0) {
      const p1 = element.maxBoxPoints[3]
      const p2 = element.maxBoxPoints[2]
      return new MaskTaskSizeIndicator({
        point: MathUtils.calculateSegmentLineCentroidCrossPoint(p1, p2, true, DefaultSelectionSizeIndicatorDistance),
        angle: 0,
        type: DrawerMaskModelTypes.sizeIndicator,
        text: `${element.width} x ${element.height}`,
      } as IMaskSizeIndicatorModel, this.renderParams);
    }
    const [leftPoint, bottomPoint, rightPoint] = CommonUtils.getLBRPoints(element.rotatePathPoints);
    let leftAngle = MathUtils.transformToAcuteAngle(MathUtils.calculateAngle(bottomPoint, leftPoint) + 180);
    let rightAngle = MathUtils.transformToAcuteAngle(MathUtils.calculateAngle(bottomPoint, rightPoint) + 180);
    const point = leftAngle < rightAngle ? leftPoint : rightPoint;
    const [p1, p2] = [point, bottomPoint].sort((a, b) => a.x - b.x);
    const angle = MathUtils.calculateAngle(p1, p2);
    const model: IMaskSizeIndicatorModel = {
      point: MathUtils.calculateSegmentLineCentroidCrossPoint(p1, p2, true, DefaultSelectionSizeIndicatorDistance),
      angle,
      type: DrawerMaskModelTypes.sizeIndicator,
      text: `${element.width} x ${element.height}`,
    }
    return new MaskTaskSizeIndicator(model, this.renderParams);
  }

}