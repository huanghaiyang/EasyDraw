import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DrawerMaskModelTypes } from "@/types";
import { ElementStyles } from "@/styles/ElementStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskPath extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

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
      specialStyles.fills?.[0] ?? this.styles.fills[0],
      this.styles.strokes[0],
      {
        isFold: typeof this.model.element?.isFold === "undefined" ? true : this.model.element?.isFold,
      },
    );
  }
}
