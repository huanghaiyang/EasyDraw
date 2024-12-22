import { IPoint, IStageCursor, IStageShield } from "@/types";

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
   * @param canvasRect 
   * @returns 
   */
  transformEventPosition(e: MouseEvent, canvasRect: DOMRect): IPoint {
    const { x, y } = canvasRect;
    this.value = {
      x: e.clientX - x,
      y: e.clientY - y
    }
    return this.value;
  }

}