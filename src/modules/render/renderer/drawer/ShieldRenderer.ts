import BaseRenderer from "@/modules/render/renderer/drawer/BaseRenderer";
import RenderTaskCargo from "@/modules/render/RenderTaskCargo";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ElementTaskClear from "@/modules/render/shield/task/ElementTaskClear";
import IStageShield from "@/types/IStageShield";
import { IShieldRenderer } from "@/types/IStageRenderer";

export default class ShieldRenderer extends BaseRenderer<IStageShield> implements IShieldRenderer {
  /**
   * 最后一次绘制的舞台元素数量
   */
  private _lastestStageElementsSize: number = 0;

  /**
   * 绘制舞台内容
   *
   * @param force
   * @returns
   */
  async redraw(force?: boolean): Promise<void> {
    const { stageElements } = this.drawer.store;
    if (force || stageElements.length !== this._lastestStageElementsSize) {
      this._lastestStageElementsSize = stageElements.length;
      const cargo = new RenderTaskCargo([]);
      cargo.add(new ElementTaskClear(null, this.canvas));
      stageElements.forEach(element => {
        const task = ElementUtils.createElementTask(element, this.canvas);
        if (task) {
          cargo.add(task);
        }
      });
      await this.renderCargo(cargo);
    }
  }
}
