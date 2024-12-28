import { IMaskTransformer, IMaskTransformerModel, Directions } from "@/types";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { DefaultSizeTransformerStrokeColor, DefaultSizeTransformerStrokeWidth, DefaultSizeTransformerFillColor, DefaultSizeTransformerValue } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

export default class MaskTaskTransformer extends MaskTaskBase implements IMaskTransformer {
  constructor(model: IMaskTransformerModel, params?: any) {
    super(model, params);
    this.model = model;
  }

  get data(): IMaskTransformerModel {
    return this.model as IMaskTransformerModel;
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