import { IShieldRenderer, IStageShield } from "@/types";
import BaseRenderer from "./BaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementUtils from "@/modules/elements/ElementUtils";
import ElementTaskClear from "@/modules/render/base/task/ElementTaskClear";

export default class ShieldRenderer extends BaseRenderer<IStageShield> implements IShieldRenderer {
  async redraw(): Promise<void> {
    const cargo = new RenderTaskCargo([]);
    if (this.drawer.store.provisionalElements.length) {
      this.drawer.store.provisionalElements.forEach((element) => {
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
    if (this.drawer.shouldRedraw) {
      cargo.add(new ElementTaskClear(null, this.renderParams));
      this.drawer.store.Elements.forEach((element) => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      await this.renderCargo(cargo);
    }
  }
}