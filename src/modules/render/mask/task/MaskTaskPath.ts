import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionStyle } from "@/styles/MaskStyles";
import { DrawerMaskModelTypes } from "@/types";
import { ElementStyles } from "@/styles/ElementStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskPath extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    const { width } = SelectionStyle.strokes[0];
    const specialStyles: ElementStyles = {};
    let { points } = this.model;
    points = ElementUtils.calcStageRelativePoints(points);

    if ([DrawerMaskModelTypes.selection, DrawerMaskModelTypes.path].includes(this.model.type)) {
      specialStyles.fills = [
        {
          colorOpacity: 0,
        },
      ];
    }
    CanvasUtils.drawPathWithScale(
      this.canvas,
      points,
      Object.assign({}, { ...SelectionStyle, ...specialStyles }),
      {},
      {
        ...SelectionStyle.strokes[0],
        width: width / CanvasUtils.scale,
      },
      {
        isFold: typeof this.model.element?.isFold === "undefined" ? true : this.model.element?.isFold,
      },
    );
  }
}
