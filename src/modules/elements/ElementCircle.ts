import Element from "@/modules/elements/Element";
import { IPoint, IElementCircle } from "@/types";

export default class ElementCircle extends Element implements IElementCircle {

  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
    super.refreshStagePoints(stageRect, stageWorldCoord);
    // TODO 计算路径坐标
  }

}