import { ITaskFunc } from "@/types";
import RenderTaskBase from "@/modules/render/RenderTaskBase";

export default class RenderTask extends RenderTaskBase {
  private func: ITaskFunc;

  constructor(func: ITaskFunc) {
    super();
    this.func = func;
  }

  /**
   * 执行任务
   * 
   * @returns 
   */
  async run(): Promise<void> {
    await this.func();
  }

  /**
   * 销毁任务
   */
  async destroy(): Promise<void> {
    // do nothing
  }

}