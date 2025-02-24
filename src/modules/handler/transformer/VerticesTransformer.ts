import MathUtils from "@/utils/MathUtils";
import { IVerticesTransformer } from "@/types/ITransformer";
import PointController from "@/modules/handler/controller/PointController";

export default class VerticesTransformer extends PointController implements IVerticesTransformer {
  get angle(): number {
    const angle = MathUtils.calcAngle(this.host.center, {
      x: this.x,
      y: this.y,
    });
    return angle + 90;
  }
}
