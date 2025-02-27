import { IPoint } from "@/types";
import IController from "@/types/IController";
import IElement from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";

export default class BaseController implements IController {
  id: string;
  isActive: boolean;
  host?: IElement;
  get angle(): number {
    return 0;
  }
  get scale(): number {
    return 1 / this.host.shield.stageScale;
  }

  constructor(host: IElement) {
    this.host = host;
    this.id = CommonUtils.getRandomId();
    this.isActive = false;
  }

  /**
   * 是否命中点
   * @param coord 点坐标
   */
  isCoordHitting(coord: IPoint): boolean {
    return false;
  }
}
