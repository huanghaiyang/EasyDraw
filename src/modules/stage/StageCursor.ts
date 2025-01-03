import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IIconModel, IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskCursor from "@/modules/render/mask/task/MaskTaskCursor";
import MaskTaskBorderTransformerCursor from "@/modules/render/mask/task/MaskTaskBorderTransformerCursor";
import { DefaultCursorSize } from "@/types/MaskStyles";
import IElementTransformer, { IElementBorderTransformer } from "@/types/IElementTransformer";
import MaskTaskTransformerCursor from "@/modules/render/mask/task/MaskTaskTransformerCursor";

export default class StageCursor implements IStageCursor {
  value: IPoint;
  shield: IStageShield;

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
    this.value.x = MathUtils.toFixed(this.value.x, 0);
    this.value.y = MathUtils.toFixed(this.value.y, 0);
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
  getTask(): IMaskCursor {
    if (this.shield.isDrawerActive) {
      return this.createMaskCursorTask();
    } else if (this.shield.isMoveableActive) {
      const transformer = this.shield.selection.getActiveElementTransformer();
      if (transformer) {
        return this.createMaskTransformerCursorTask(transformer);
      } else {
        const borderTransformer = this.shield.selection.getActiveElementBorderTransformer();
        if (borderTransformer) {
          return this.createMaskBorderTransformerCursorTask(borderTransformer);
        }
      }
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IMaskCursor {
    if (!this.value) return;
    const model: IMaskCursorModel = {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      creatorCategory: this.shield.currentCreator.category
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
  private createMaskBorderTransformerCursorTask(borderTransformer: IElementBorderTransformer): IMaskCursor {
    if (!this.value) return;
    const model: IIconModel = {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: DefaultCursorSize,
      height: DefaultCursorSize,
      angle: borderTransformer.angle,
    }
    const task = new MaskTaskBorderTransformerCursor(model, { canvas: this.shield.mask.canvas });
    return task;
  }

  /**
   * 创建一个变换光标任务
   * 
   * @param transformer 
   * @returns 
   */
  private createMaskTransformerCursorTask(transformer: IElementTransformer): IMaskCursor {
    if (!this.value) return;
    const model: IIconModel = {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: DefaultCursorSize,
      height: DefaultCursorSize,
      angle: transformer.angle,
    }
    const task = new MaskTaskTransformerCursor(model, { canvas: this.shield.mask.canvas });
    return task;
  }

}