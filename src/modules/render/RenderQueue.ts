import { IRenderQueue } from "@/types/IRender";
import { IRenderTask } from "@/types/IRenderTask";

export default class RenderQueue implements IRenderQueue {
  running: boolean;
  queue: IRenderTask[];

  constructor() {
    this.running = false;
    this.queue = [];
  }

  /**
   * 添加任务
   *
   * @param task
   */
  async add(task: IRenderTask): Promise<void> {
    this.queue.push(task);
    if (!this.running) {
      this.running = true;
      await this.run();
    }
  }

  /**
   * 执行所有任务
   */
  async run(): Promise<void> {
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    let task = this.queue.shift()!;
    if (task) {
      await task.run();
      try {
        await this.run();
      } catch (error) {
        console.error("RenderQueue: error running task", task.id, error);
      } finally {
        if (task.destroy) {
          await task.destroy();
        }
        task = null;
      }
    }

    requestAnimationFrame(() => {
      this.run();
    });
  }

  /**
   * 销毁队列
   */
  async destroy(): Promise<void> {
    while (this.queue.length > 0) {
      let task = this.queue.shift();
      if (task) {
        if (task.destroy) {
          await task.destroy();
        }
        task = null;
        this.queue = null;
        this.running = false;
        return;
      }
    }
  }
}

export class TaskQueue extends RenderQueue {}
