import { IPoint } from "@/types";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

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
    this.value = CommonUtils.getEventPosition(e, this.shield.stageRect, this.shield.scale);
    this.value.x = MathUtils.toFixed(this.value.x, 0);
    this.value.y = MathUtils.toFixed(this.value.y, 0);
    return this.value;
  }

}