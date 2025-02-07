import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionStyle } from "@/styles/MaskStyles";
import { DrawerMaskModelTypes } from "@/types";
import { ElementStyles } from "@/styles/ElementStyles";

export default class MaskTaskPath extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = SelectionStyle;
    const specialStyles: ElementStyles = {};
    if ([DrawerMaskModelTypes.selection, DrawerMaskModelTypes.path].includes(this.data.type)) {
      specialStyles.fillColorOpacity = 0;
    }
    CanvasUtils.drawPathWithScale(
      this.canvas,
      this.data.points,
      Object.assign(
        {},
        { ...SelectionStyle, ...specialStyles },
        {
          strokeWidth: strokeWidth * this.data.scale,
        }
      ),
      {
        isFold: typeof this.data.element?.isFold === "undefined" ? true : this.data.element?.isFold,
      }
    );
  }
}
