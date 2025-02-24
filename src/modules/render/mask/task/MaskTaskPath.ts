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
    const { width } = SelectionStyle.strokes[0];
    const specialStyles: ElementStyles = {};
    if ([DrawerMaskModelTypes.selection, DrawerMaskModelTypes.path].includes(this.data.type)) {
      specialStyles.fills = [
        {
          colorOpacity: 0,
        },
      ];
    }
    CanvasUtils.drawPathWithScale(
      this.canvas,
      this.data.points,
      Object.assign({}, { ...SelectionStyle, ...specialStyles }),
      {},
      {
        ...SelectionStyle.strokes[0],
        width: width * this.data.scale,
      },
      {
        isFold: typeof this.data.element?.isFold === "undefined" ? true : this.data.element?.isFold,
      },
    );
  }
}
