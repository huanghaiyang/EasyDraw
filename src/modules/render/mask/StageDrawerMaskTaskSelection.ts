import { IStageDrawerMaskTaskSelection, IStageDrawerMaskTaskSelectionObj } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/StageDrawerMaskTaskBase";
import { DefaultSelectionStrokeColor, DefaultSelectionStrokeWidth, DefaultSelectionFillColor } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";

export default class StageDrawerMaskTaskSelection extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskSelection {

  get data(): IStageDrawerMaskTaskSelectionObj {
    return this.obj as IStageDrawerMaskTaskSelectionObj;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, this.data.points, {
      strokeStyle: DefaultSelectionStrokeColor,
      lineWidth: DefaultSelectionStrokeWidth,
      fillStyle: DefaultSelectionFillColor
    });
  }
}