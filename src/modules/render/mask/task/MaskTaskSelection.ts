import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IMaskSelectionModel } from "@/types/IModel";
import { IMaskSelection } from "@/types/IRenderTask";
import { DefaultSelectionStyle } from "@/types/MaskStyles";
import { DrawerMaskModelTypes } from "@/types";
import { ElementStyles } from "@/types/ElementStyles";

export default class MaskTaskSelection extends MaskTaskBase implements IMaskSelection {

  get data(): IMaskSelectionModel {
    return this.model as IMaskSelectionModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = DefaultSelectionStyle;
    const specialStyles: ElementStyles = {};
    if (this.data.type === DrawerMaskModelTypes.selection || this.data.type === DrawerMaskModelTypes.highlight) {
      specialStyles.fillColorOpacity = 0;
    }
    CanvasUtils.drawPathWithScale(this.canvas, this.data.points, Object.assign({}, { ...DefaultSelectionStyle, ...specialStyles }, {
      strokeWidth: strokeWidth * this.data.scale
    }), this.data.element.isPointsClosed);
  }
}