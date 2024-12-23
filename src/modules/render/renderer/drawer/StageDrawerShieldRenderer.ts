import { IStageDrawerShieldRenderer, IStageShield } from "@/types";
import StageDrawerBaseRenderer from "./StageDrawerBaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementUtils from "@/modules/elements/ElementUtils";
import StageElementTaskClear from "@/modules/render/base/task/StageElementTaskClear";

export default class StageDrawerShieldRenderer extends StageDrawerBaseRenderer<IStageShield> implements IStageDrawerShieldRenderer {
  async redraw(): Promise<void> {
    const cargo = new RenderTaskCargo([]);
    if (this.drawer.store.noneRenderedElements.length) {
      this.drawer.store.noneRenderedElements.forEach((element) => {
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
    if (this.drawer.isElementsDragging || this.drawer.isElementsResizing) {
      cargo.add(new StageElementTaskClear(null, this.renderParams));
      this.drawer.store.forEach((element) => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      await this.renderCargo(cargo);
    }
  }
}