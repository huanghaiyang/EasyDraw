import { IStageDrawerProvisional, IStageDrawerProvisionalRenderer } from "@/types";
import StageDrawerBaseRenderer from "@/modules/render/renderer/drawer/StageDrawerBaseRenderer";
import RenderTaskCargo from '@/modules/render/RenderTaskCargo';
import StageElementTaskClear from "@/modules/render/base/task/StageElementTaskClear";
import ElementUtils from "@/modules/elements/ElementUtils";

export default class StageDrawerProvisionalRenderer extends StageDrawerBaseRenderer<IStageDrawerProvisional> implements IStageDrawerProvisionalRenderer {

  private _latestElementRendered: boolean;

  /**
   * 重绘
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    const elements = this.drawer.shield.store.creatingElements;
    if (elements.length > 0) {
      elements.forEach((element) => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      this._latestElementRendered = true;
    }
    if (!cargo.isEmpty() || (cargo.isEmpty() && this._latestElementRendered)) {
      cargo.prepend(new StageElementTaskClear(null, this.renderParams));
      await this.renderCargo(cargo);
    } else {
      cargo = null;
    }
  }
}