import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IIconModel, IMaskCursorModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskCursor from "@/modules/render/mask/task/MaskTaskCursor";
import { CursorSize } from "@/styles/MaskStyles";
import IElementTransformer, { IElementBorderTransformer, ITransformer } from "@/types/IElementTransformer";
import MaskTaskTransformerCursor from "@/modules/render/mask/task/MaskTaskTransformerCursor";
import { TransformTypes } from "@/types/Stage";
import ElementTransformer from "@/modules/elements/transformer/ElementTransformer";
import ElementBorderTransformer from "@/modules/elements/transformer/ElementBorderTransformer";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class StageCursor implements IStageCursor {
  value: IPoint;
  shield: IStageShield;

  get worldValue(): IPoint {
    return ElementUtils.calcWorldPoint(this.value, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.value = null;
  }

  clear(): void {
    this.value = null;
  }

  /**
   * 计算鼠标相对于画板的位置
   * 
   * @param e 
   * @returns 
   */
  transform(e: MouseEvent): IPoint {
    if (!this.shield.stageRect) return { x: 0, y: 0 };
    this.value = CommonUtils.getEventPosition(e, this.shield.stageRect, this.shield.stageScale);
    this.value.x = MathUtils.preciseToFixed(this.value.x, 0);
    this.value.y = MathUtils.preciseToFixed(this.value.y, 0);
    return this.value;
  }

  /**
   * 设置鼠标样式
   * 
   * @param cursor 
   */
  setStyle(cursor: string): void {
    this.shield.canvas.style.cursor = cursor;
  }

  /**
   * 更新鼠标样式
   */
  updateStyle(e: MouseEvent): void {
    if (this.shield.selection.getActiveElementBorderTransformer() || this.shield.selection.getActiveElementTransformer() || this.shield.isDrawerActive) {
      this.setStyle('none')
    } else if (this.shield.isHandActive) {
      this.setStyle('grab');
    } else {
      this.setStyle('default');
    }
  }

  /**
   * 创建一个光标任务
   * 
   * @returns 
   */
  getTask(): IMaskTask {
    if (this.shield.isDrawerActive) {
      return this.createMaskCursorTask();
    } else if (this.shield.isMoveableActive) {
      const transformer = this._getElementTransformer();
      if (transformer instanceof ElementTransformer) {
        return this.createMaskTransformerCursorTask(transformer);
      } else if (transformer instanceof ElementBorderTransformer) {
        return this.createMaskBorderTransformerCursorTask(transformer);
      }
    }
  }

  /**
   * 获取变换器对象
   * 
   * @returns 
   */
  private _getElementTransformer(): ITransformer {
    const transformer = this.shield.selection.getActiveElementTransformer();
    if (transformer) {
      return transformer;
    } else {
      const borderTransformer = this.shield.selection.getActiveElementBorderTransformer();
      if (borderTransformer) {
        return borderTransformer;
      }
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IMaskTask {
    if (!this.value) return;
    const model: IMaskCursorModel = {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      creatorCategory: this.shield.currentCreator.category,
      scale: 1 / this.shield.stageScale
    }
    const task = new MaskTaskCursor(model, { canvas: this.shield.mask.canvas });
    return task;
  }

  /**
   * 创建一个边框变换光标任务
   * 
   * @param borderTransformer 
   * @returns 
   */
  private createMaskBorderTransformerCursorTask(borderTransformer: IElementBorderTransformer): IMaskTask {
    if (!this.value) return;
    const task = new MaskTaskTransformerCursor(this._createTransformerCursorModel(borderTransformer), TransformTypes.border, { canvas: this.shield.mask.canvas });
    return task;
  }

  /**
   * 创建一个变换光标任务
   * 
   * @param transformer 
   * @returns 
   */
  private createMaskTransformerCursorTask(transformer: IElementTransformer): IMaskTask {
    if (!this.value) return;
    const task = new MaskTaskTransformerCursor(this._createTransformerCursorModel(transformer), TransformTypes.vertices, { canvas: this.shield.mask.canvas });
    return task;
  }

  /**
   * 创建一个变换光标的模型
   * 
   * @param transformer 
   * @returns 
   */
  private _createTransformerCursorModel(transformer: ITransformer): IIconModel {
    return {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: CursorSize,
      height: CursorSize,
      angle: transformer.angle,
      scale: 1 / this.shield.stageScale
    }
  }

}