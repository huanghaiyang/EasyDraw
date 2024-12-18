import { IPoint, IStageCursor, IStageShield } from "@/types";

export default class StageCursor implements IStageCursor {
  pos: IPoint;
  shield: IStageShield;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.pos = null;
  }

  clear(): void {
    this.pos = null;
  }

  /**
   * 计算鼠标相对于画板的位置
   * 
   * @param e 
   * @param canvasRect 
   * @returns 
   */
  calcPos(e: MouseEvent, canvasRect: DOMRect): IPoint {
    const { x, y } = canvasRect;
    this.pos = {
      x: e.clientX - x,
      y: e.clientY - y
    }
    return this.pos;
  }

}