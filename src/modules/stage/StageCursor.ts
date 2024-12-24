import { IPoint, IStageCursor, IStageShield } from "@/types";
import CommonUtils from "@/utils/CommonUtils";

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
    this.value = CommonUtils.getEventPosition(e, this.shield.stageRect);
    return this.value;
  }

}