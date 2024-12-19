import { IStageElementReact, IStageElementTaskRect } from "@/types";
import StageElementTaskBase from "@/modules/render/base/task/StageElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DefaultCreatorFillColor, DefaultCreatorStrokeColor, DefaultCreatorStrokeWidth } from "@/types/constants";

export default class StageElementTaskRect extends StageElementTaskBase implements IStageElementTaskRect {

  get node() {
    return this.element as IStageElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, this.node.pathPoints, {
      strokeStyle: DefaultCreatorStrokeColor,
      lineWidth: DefaultCreatorStrokeWidth,
      fillStyle: DefaultCreatorFillColor
    });
  }

}