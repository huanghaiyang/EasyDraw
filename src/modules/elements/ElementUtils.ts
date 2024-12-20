import { CreatorTypes, IStageElement, IStageElementTask } from "@/types";
import StageElementTaskRect from "@/modules/render/base/task/StageElementTaskRect";

export default class ElementUtils {
  static createElementTask(element: IStageElement, params?: any): IStageElementTask {
      let task: IStageElementTask;
      switch (element.obj.type) {
        case CreatorTypes.rectangle:
          task = new StageElementTaskRect(element, params);
          break;
        default:
          break;
      }
      return task;
    }
}