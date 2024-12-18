import { ITaskFunc } from "@/types";
import { isBoolean } from "lodash";
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
  async run(): Promise<boolean> {
    const result = await this.func();
    if (isBoolean(result)) {
      return result;
    }
    return true;
  }

}