import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import IElementRotation from "@/types/IElementRotation";
import MathUtils from "@/utils/MathUtils";

export default class RotateController extends ElementRotation implements IElementRotation {
  get angle(): number {
    const angle = MathUtils.calcAngle(this.host.center, {
      x: this.x,
      y: this.y,
    });
    return angle + 45;
  }
}
