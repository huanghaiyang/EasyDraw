import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { IElementCircle } from "@/types/IElement";

export default class ElementCircle extends Element implements IElementCircle {

  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint, stageScale: number): void {
    super.refreshStagePoints(stageRect, stageWorldCoord, stageScale);
    // TODO 计算路径坐标
  }

}