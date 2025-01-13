import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { IMaskCircleModel } from "@/types/IModel";
import { IMaskCircleTransformer } from "@/types/IRenderTask";
import { DefaultControllerStyle } from "@/types/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase implements IMaskCircleTransformer {
  constructor(model: IMaskCircleModel, params?: any) {
    super(model, params);
    this.model = model;
  }

  get data(): IMaskCircleModel {
    return this.model as IMaskCircleModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = DefaultControllerStyle;
    CanvasUtils.drawCircleStrokeWithScale(this.canvas, this.data.point, this.data.radius, Object.assign({}, DefaultControllerStyle, {
      strokeWidth: strokeWidth * this.data.scale
    }));
  }
}