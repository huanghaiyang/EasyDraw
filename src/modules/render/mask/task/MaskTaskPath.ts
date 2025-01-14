import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionStyle } from "@/types/MaskStyles";
import { DrawerMaskModelTypes } from "@/types";
import { ElementStyles } from "@/types/ElementStyles";

export default class MaskTaskPath extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = SelectionStyle;
    const specialStyles: ElementStyles = {};
    if (this.data.type === DrawerMaskModelTypes.path || this.data.type === DrawerMaskModelTypes.highlight) {
      specialStyles.fillColorOpacity = 0;
    }
    CanvasUtils.drawPathWithScale(this.canvas, this.data.points, Object.assign({}, { ...SelectionStyle, ...specialStyles }, {
      strokeWidth: strokeWidth * this.data.scale
    }), this.data.element?.isPointsClosed);
  }
}