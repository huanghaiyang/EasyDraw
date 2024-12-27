import { IStageDrawerMaskTaskSizeTransformer, IStageDrawerMaskTaskSizeTransformerModel, Directions } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import { DefaultSizeTransformerStrokeColor, DefaultSizeTransformerStrokeWidth, DefaultSizeTransformerFillColor, DefaultSizeTransformerValue } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

export default class StageDrawerMaskTaskSizeTransformer extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskSizeTransformer {
  constructor(model: IStageDrawerMaskTaskSizeTransformerModel, params?: any) {
    super(model, params);
    this.model = model;
  }

  get data(): IStageDrawerMaskTaskSizeTransformerModel {
    return this.model as IStageDrawerMaskTaskSizeTransformerModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, CommonUtils.get4BoxPoints(this.data.point, {
      width: DefaultSizeTransformerValue,
      height: DefaultSizeTransformerValue
    }, { angle: this.data.angle }), {
      strokeStyle: DefaultSizeTransformerStrokeColor,
      lineWidth: DefaultSizeTransformerStrokeWidth,
      fillStyle: DefaultSizeTransformerFillColor
    });
  }
}