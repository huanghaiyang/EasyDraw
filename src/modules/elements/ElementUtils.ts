import { CreatorTypes, IPoint, IStageElement, IStageElementTask } from "@/types";
import StageElementTaskRect from "@/modules/render/base/task/StageElementTaskRect";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementUtils {
  static createElementTask(element: IStageElement, params?: any): IStageElementTask {
    let task: IStageElementTask;
    switch (element.obj.type) {
      case CreatorTypes.rectangle:
        task = new StageElementTaskRect(element, params);
        break;
      default:
        break;
    }
    return task;
  }

  /**
   * 计算世界坐标在画布坐标系下的坐标
   * 
   * @param worldCoords 
   * @param stageRect 
   * @param stageWorldCoord 
   * @returns 
   */
  static calcStageRelativePoints(worldCoords: IPoint[], stageRect: DOMRect, stageWorldCoord: IPoint): IPoint[] {
    // 计算element坐标相对于画布的坐标
    const points = worldCoords.map(p => {
      return {
        x: p.x + stageRect.width / 2 - stageWorldCoord.x,
        y: p.y + stageRect.height / 2 - stageWorldCoord.y
      }
    })
    return points;
  }

  /**
   * 在绘制图形时补全缺省点
   * 
   * @param points 
   * @param creatorType 
   * @returns 
   */
  static calcCreatorPoints(points: IPoint[], creatorType: CreatorTypes) {
    switch (creatorType) {
      case CreatorTypes.rectangle:
        return CommonUtils.getBoxPoints(points);
      default:
        return points;
    }
  }
}