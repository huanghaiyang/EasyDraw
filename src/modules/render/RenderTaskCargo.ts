import { IRenderTaskCargo, IRenderTask } from "@/types";
import RenderTaskBase from "@/modules/render/RenderTaskBase";

export default class RenderTaskCargo extends RenderTaskBase implements IRenderTaskCargo {
  tasks: IRenderTask[];

  constructor(tasks: IRenderTask[]) {
    super();
    this.tasks = tasks;
  }

  /**
   * 判断是否为空
   * 
   * @returns 
   */
  isEmpty() {
    return this.tasks.length === 0;
  }

  /**
   * 添加一个任务
   * 
   * @param task 
   */
  add(task: IRenderTask) {
    this.tasks.push(task);
  }

  /**
   * 添加一个任务到头部
   * 
   * @param task 
   */
  prepend(task: IRenderTask): void {
    this.tasks.unshift(task);
  }

  async run(): Promise<boolean> {
    while (this.tasks.length > 0) {
      let task = this.tasks.shift();
      if (task) {
        await task.run();
        task = null;
      }
    }
    return true;
  }

}