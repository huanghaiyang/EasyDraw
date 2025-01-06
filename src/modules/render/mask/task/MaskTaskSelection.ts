import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IMaskSelectionModel } from "@/types/IModel";
import { IMaskSelection } from "@/types/IRenderTask";
import { DefaultSelectionStyle } from "@/types/MaskStyles";

export default class MaskTaskSelection extends MaskTaskBase implements IMaskSelection {

  get data(): IMaskSelectionModel {
    return this.model as IMaskSelectionModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = DefaultSelectionStyle;
    CanvasUtils.drawPath(this.canvas, this.data.points, Object.assign({}, DefaultSelectionStyle, {
      strokeWidth: strokeWidth * this.data.scale
    }));
  }
}