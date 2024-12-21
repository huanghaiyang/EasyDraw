import StageElement from "@/modules/elements/StageElement";
import { IPoint, IStageElementReact } from "@/types";

export default class StageElementRect extends StageElement implements IStageElementReact {
  /**
   * 获取矩形的边线点
   * 
   * @returns 
   */
  getEdgePoints(): IPoint[] {
    return this.pathPoints;
  }
}