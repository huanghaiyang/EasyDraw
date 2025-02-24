import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementTaskClear from "@/modules/render/shield/task/ElementTaskClear";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IDrawerProvisional } from "@/types/IStageDrawer";
import { IProvisionalRenderer } from "@/types/IStageRenderer";

export default class ProvisionalRenderer extends BaseRenderer<IDrawerProvisional> implements IProvisionalRenderer {
  private _latestElementRendered: boolean;
  private _latestClearRendered: boolean;

  /**
   * 重绘
   */
  async redraw(): Promise<void> {
    let cargo = new RenderTaskCargo([]);
    const elements = this.drawer.shield.store.creatingElements;
    if (elements.length > 0) {
      elements.forEach(element => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      this._latestElementRendered = true;
    }
    this._latestClearRendered = cargo.isEmpty() && this._latestElementRendered;
    if (!cargo.isEmpty() || this._latestClearRendered) {
      cargo.prepend(new ElementTaskClear(null, this.renderParams));
      await this.renderCargo(cargo);
      if (this._latestClearRendered) {
        this._latestClearRendered = false;
      }
    } else {
      cargo = null;
    }
  }
}
