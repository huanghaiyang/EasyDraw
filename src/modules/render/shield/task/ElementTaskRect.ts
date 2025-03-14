import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementRect } from "@/types/IElement";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";

export default class ElementTaskRect extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    ElementTaskHelper.draw(this.element as IElementRect, this.canvas);
  }
}
