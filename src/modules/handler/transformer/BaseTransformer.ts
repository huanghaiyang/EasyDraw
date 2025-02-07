import ITransformer from "@/types/ITransformer";
import IElement from "@/types/IElement";
import IStageSelection from "@/types/IStageSelection";
import CommonUtils from "@/utils/CommonUtils";

export default class BaseTransformer implements ITransformer {
  id: string;
  isActive: boolean;
  host?: IElement | IStageSelection;

  get angle(): number {
    return 0;
  }

  constructor(host: IElement | IStageSelection) {
    this.host = host;
    this.id = CommonUtils.getRandomId();
    this.isActive = false;
  }
}
