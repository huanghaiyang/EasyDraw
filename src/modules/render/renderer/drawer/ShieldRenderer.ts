import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ElementTaskClear from "@/modules/render/shield/task/ElementTaskClear";
import IStageShield from "@/types/IStageShield";
import { IShieldRenderer } from "@/types/IStageRenderer";

export default class ShieldRenderer extends BaseRenderer<IStageShield> implements IShieldRenderer {
  /**
   * 绘制舞台内容
   *
   * @param force
   * @returns
   */
  async redraw(force?: boolean): Promise<void> {
    const cargo = new RenderTaskCargo([]);
    const { isProvisionalEmpty, provisionalElements, stageElements } = this.drawer.store;
    if (!isProvisionalEmpty) {
      provisionalElements.forEach(element => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      if (!cargo.isEmpty()) {
        await this.renderCargo(cargo);
        return;
      }
    }
    if (force || this.drawer.shouldRedraw) {
      cargo.add(new ElementTaskClear(null, this.renderParams));
      stageElements.forEach(element => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      await this.renderCargo(cargo);
    }
  }
}
