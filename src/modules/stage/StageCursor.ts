import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import MaskTaskCursor from "@/modules/render/mask/task/MaskTaskCursor";

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
   * 创建一个光标任务
   * 
   * @returns 
   */
  getTask(): IMaskCursor {
    if (this.shield.isDrawerActive) {
      return this.createMaskCursorTask();
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   * 
   * @returns 
   */
  private createMaskCursorTask(): IMaskCursor {
    const model: IMaskCursorModel = {
      point: this.shield.cursor.value,
      type: DrawerMaskModelTypes.cursor,
      creatorCategory: this.shield.currentCreator.category
    }
    const task = new MaskTaskCursor(model, { canvas: this.shield.mask.canvas });
    return task;
  }

}