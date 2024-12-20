import { IStageDrawerShieldRenderer, IStageShield } from "@/types";
import StageDrawerBaseRenderer from "./StageDrawerBaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementUtils from "@/modules/elements/ElementUtils";

export default class StageDrawerShieldRenderer extends StageDrawerBaseRenderer<IStageShield> implements IStageDrawerShieldRenderer {
  async redraw(): Promise<void> {
    const elements = this.drawer.store.noneRenderedElements;
    if (elements.length) {
      const cargo = new RenderTaskCargo([]);
      elements.forEach((element) => {
        const task = ElementUtils.createElementTask(element, this.renderParams);
        if (task) {
          cargo.add(task);
        }
      });
      await this.renderCargo(cargo);
    }
  }
}