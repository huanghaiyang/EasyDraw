import { DrawerMaskModelTypes, ElementStatus, IPoint, } from "@/types";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import MaskTaskPath from "@/modules/render/mask/task/MaskTaskPath";
import MaskTaskClear from "@/modules/render/mask/task/MaskTaskClear";
import MaskTaskTransformer from "@/modules/render/mask/task/MaskTaskTransformer";
import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import MaskTaskRotate from "@/modules/render/mask/task/MaskTaskRotate";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskIndicator from "@/modules/render/mask/task/MaskTaskIndicator";
import IElement from "@/types/IElement";
import { IDrawerMask } from "@/types/IStageDrawer";
import { IMaskRenderer } from "@/types/IStageRenderer";
import { IMaskModel } from "@/types/IModel";
import { IRenderTask } from "@/types/IRenderTask";
import { ArbitraryControllerRadius, SelectionIndicatorMargin } from "@/styles/MaskStyles";
import MaskTaskCursorPosition from "@/modules/render/mask/task/MaskTaskCursorPosition";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import MaskTaskCircleTransformer from "@/modules/render/mask/task/MaskTaskCircleTransformer";
import { TransformerTypes } from "@/types/ITransformer";

export default class MaskRenderer extends BaseRenderer<IDrawerMask> implements IMaskRenderer {

  private _lastCursorRendered = false;
  private _lastSelectionRendered = false;

  /**
   * 重绘蒙版
   * 
   * TODO 需要优化，光标只要移动就会重绘
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    let cursorRendered = false;

    // 绘制选区
    const selectionTasks = this.createMaskSelectionTasks();
    selectionTasks.forEach(task => {
      cargo.add(task);
    });
    if (selectionTasks.length) {
      this._lastSelectionRendered = true;
    }
    const transformerTasks = this.createMaskTransformerTasks();
    if (transformerTasks.length) {
      cargo.addAll(transformerTasks);
    }

    // 如果当前舞台只有一个被选中的组件且组件已经不是正在创建中的，则渲染组件的旋转句柄图标
    const element = this.drawer.shield.store.uniqSelectedElement;
    if (element) {
      if (this.drawer.shield.configure.rotationIconEnable && element.rotationEnable && element.status === ElementStatus.finished) {
        cargo.add(this.createMaskRotateTask(element));
      }
      cargo.add(this.createMaskIndicatorTask(element));
    }

    // 绘制光标
    const task = this.drawer.shield.cursor.getTask();
    if (task) {
      cargo.add(task);
      this._lastCursorRendered = true;
      cursorRendered = true;
    }
    if (this.drawer.shield.isDrawerActive) {
      cargo.add(this.createMaskCursorPositionTask());
      cargo.add(this.createMaskArbitraryCursorTask())
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
   * 绘制当前鼠标位置的文字任务
   * 
   * @returns 
   */
  private createMaskCursorPositionTask(): IRenderTask {
    const point = this.drawer.shield.cursor.value;
    if (!point) return;
    const coord = ElementUtils.calcWorldPoint(point, this.drawer.shield.stageRect, this.drawer.shield.stageWorldCoord, this.drawer.shield.stageScale);
    const model: IMaskModel = {
      point: {
        x: point.x + 20 / this.drawer.shield.stageScale,
        y: point.y + 20 / this.drawer.shield.stageScale
      },
      type: DrawerMaskModelTypes.cursorPosition,
      text: `${coord.x},${coord.y}`
    }
    const task = new MaskTaskCursorPosition(model, this.renderParams);
    return task;
  }

  /**
   * 创建一个绘制mask选区的任务
   * 
   * @returns 
   */
  private createMaskSelectionTasks(): IRenderTask[] {
    const tasks: IRenderTask[] = [];
    const models: IMaskModel[] = [...this.drawer.shield.selection.getModels(), this.drawer.shield.selection.getRealTimeSelectionModel()];
    models.forEach(model => {
      if (model) {
        const task = new MaskTaskPath({ ...model, scale: 1 / this.drawer.shield.stageScale }, this.renderParams);
        tasks.push(task);
      }
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
   * @returns 
   */
  private createMaskTransformerTasks(): IRenderTask[] {
    const models: IMaskModel[] = this.drawer.shield.selection.getRealTimeTransformerModels();
    return models.map(model => {
      switch(model.element.transformerType) {
        case TransformerTypes.circle: {
          return new MaskTaskCircleTransformer(model, this.renderParams);
        }
        case TransformerTypes.rect: {
          return new MaskTaskTransformer(model, this.renderParams);
        }
      }
    });
  }

  /**
   * 创建一个绘制旋转图标的任务
   * 
   * @param element 
   * @returns 
   */
  private createMaskRotateTask(element: IElement): IRenderTask {
    return new MaskTaskRotate(element.rotation.model, this.renderParams);
  }

  /**
   * 给出一个元素创建一个绘制尺寸指示器的任务
   * 
   * @param element 
   */
  private createMaskIndicatorTask(element: IElement): IRenderTask {
    let p1: IPoint, p2: IPoint;
    switch (element.model.type) {
      case CreatorTypes.line: {
        [p1, p2] = element.rotatePathPoints.sort((a, b) => a.x - b.x);
        break;
      }
      default: {
        if (element.model.angle % 90 === 0) {
          p1 = element.maxBoxPoints[3];
          p2 = element.maxBoxPoints[2];
        } else {
          const [leftPoint, bottomPoint, rightPoint] = CommonUtils.getLBRPoints(element.rotateBoxPoints);
          let leftAngle = MathUtils.transformToAcuteAngle(MathUtils.calcAngle(bottomPoint, leftPoint) + 180);
          let rightAngle = MathUtils.transformToAcuteAngle(MathUtils.calcAngle(bottomPoint, rightPoint) + 180);
          const point = leftAngle < rightAngle ? leftPoint : rightPoint;
          [p1, p2] = [point, bottomPoint].sort((a, b) => a.x - b.x);
        }
        break;
      }
    }
    const angle = MathUtils.calcAngle(p1, p2);
    const model: IMaskModel = {
      point: MathUtils.calcSegmentLineCenterCrossPoint(p1, p2, true, SelectionIndicatorMargin / this.drawer.shield.stageScale),
      angle,
      type: DrawerMaskModelTypes.indicator,
      text: `${element.width} x ${element.height}`,
    }
    return new MaskTaskIndicator(model, this.renderParams);
  }

  /**
   * 创建一个光标圆
   * 
   * @returns 
   */
  private createMaskArbitraryCursorTask(): IRenderTask {
    if (this.drawer.shield.currentCreator.category === CreatorCategories.freedom) {
      const model: IMaskModel = {
        point: this.drawer.shield.cursor.value,
        type: DrawerMaskModelTypes.cursor,
        radius: ArbitraryControllerRadius,
      }
      return new MaskTaskCircleTransformer(model, this.renderParams);
    }
  }

}