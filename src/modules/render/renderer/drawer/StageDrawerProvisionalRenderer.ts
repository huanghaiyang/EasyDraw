import { CreatorTypes, IStageDrawerProvisional, IStageDrawerProvisionalRenderer, IStageElement, IStageElementTask } from "@/types";
import StageDrawerBaseRenderer from "@/modules/render/renderer/drawer/StageDrawerBaseRenderer";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageElementTaskClear from "@/modules/render/base/task/StageElementTaskClear";
import StageElementTaskRect from "@/modules/render/base/task/StageElementTaskRect";

export default class StageDrawerProvisionalRenderer extends StageDrawerBaseRenderer<IStageDrawerProvisional> implements IStageDrawerProvisionalRenderer {
  /**
   * 重绘
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    const elements = this.drawer.shield.store.creatingElements;
    if (elements.length > 0) {
      elements.forEach((element) => {
        const task = this.createElementTask(element);
        if (task) {
          cargo.add(task);
        }
      });
    }
    if (!cargo.isEmpty()) {
      cargo.prepend(new StageElementTaskClear(null, this.maskParams));
      await this.renderCargo(cargo);
    } else {
      cargo = null;
    }
  }

  /**
   * 
   * @param element 
   */
  createElementTask(element: IStageElement): IStageElementTask {
    let task: IStageElementTask;
    switch (element.obj.type) {
      case CreatorTypes.rectangle:
        task = new StageElementTaskRect(element, this.maskParams);
        break;
      default:
        break;
    }
    return task;
  }
}