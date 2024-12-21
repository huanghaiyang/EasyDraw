import StageElement from "@/modules/elements/StageElement";
import { IPoint, IStageElementReact } from "@/types";
import CommonUtils from "@/utils/CommonUtils";

export default class StageElementRect extends StageElement implements IStageElementReact {

  /**
   * 刷新点坐标
   * 
   * @param stageRect 
   * @param stageWorldCoord 
   */
  refreshPoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
    super.refreshPoints(stageRect, stageWorldCoord);
    this._pathPoints = CommonUtils.getBoxPoints(this._points);
  }
  /**
   * 获取矩形的边线点
   * 
   * @returns 
   */
  getEdgePoints(): IPoint[] {
    return this.pathPoints;
  }
}