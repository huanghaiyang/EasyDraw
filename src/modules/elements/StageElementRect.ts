import StageElement from "@/modules/elements/StageElement";
import { IPoint, IStageElementReact } from "@/types";
import CommonUtils from "@/utils/CommonUtils";

export default class StageElementRect extends StageElement implements IStageElementReact {

  /**
   * 矩形在绘制过程中仅有两个点，需要计算出四个点
   * 
   * @returns 
   */
  calcPathPoints(): IPoint[] {
    return CommonUtils.getBoxByPoints(this.points);
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