import StageElement from "@/modules/elements/StageElement";
import { IPoint, IStageElementCircle } from "@/types";

export default class StageElementCircle extends StageElement implements IStageElementCircle {

  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
    super.refreshStagePoints(stageRect, stageWorldCoord);
    // TODO 计算路径坐标
  }

}