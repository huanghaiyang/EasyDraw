import { IStageDrawerMaskTaskSizeTransformer, IStageDrawerMaskTaskSizeTransformerModel, Directions } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import { DefaultSizeTransformerStrokeColor, DefaultSizeTransformerStrokeWidth, DefaultSizeTransformerFillColor, DefaultSizeTransformerValue } from "@/types/constants";
import DirectionUtils from "@/utils/DirectionUtils";
import CanvasUtils from "@/utils/CanvasUtils";

export default class StageDrawerMaskTaskSizeTransformer extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskSizeTransformer {

  direction: Directions;

  constructor(direction: Directions, model: IStageDrawerMaskTaskSizeTransformerModel, params?: any) {
    super(model, params);
    this.direction = direction;
    this.model = model;
  }

  get data(): IStageDrawerMaskTaskSizeTransformerModel {
    return this.model as IStageDrawerMaskTaskSizeTransformerModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, DirectionUtils.get4DirectionPoints(this.data.point, {
      width: DefaultSizeTransformerValue,
      height: DefaultSizeTransformerValue
    }, { angle: this.data.angle }), {
      strokeStyle: DefaultSizeTransformerStrokeColor,
      lineWidth: DefaultSizeTransformerStrokeWidth,
      fillStyle: DefaultSizeTransformerFillColor
    });
  }
}