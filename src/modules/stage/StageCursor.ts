import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IIconModel, IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskCursor from "@/modules/render/mask/task/MaskTaskCursor";
import MaskTaskBorderSplitter from "@/modules/render/mask/task/MaskTaskBorderSplitter";
import { DefaultBorderTransformerIconSize } from "@/types/MaskStyles";
import { IElementBorderTransformer } from "@/types/IElementTransformer";

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
    if (this.shield.selection.getActiveElementBorderTransformer() || this.shield.isDrawerActive) {
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

      } else {
        const borderTransformer = this.shield.selection.getActiveElementBorderTransformer();
        if (borderTransformer) {
          return this.createMaskBorderTransformerTask(borderTransformer);
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
  private createMaskBorderTransformerTask(borderTransformer: IElementBorderTransformer): IMaskCursor {
    if (!this.value) return;
    const model: IIconModel = {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: DefaultBorderTransformerIconSize,
      height: DefaultBorderTransformerIconSize,
      angle: borderTransformer.angle,
    }
    const task = new MaskTaskBorderSplitter(model, { canvas: this.shield.mask.canvas });
    return task;
  }

}