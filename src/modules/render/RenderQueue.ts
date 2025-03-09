import { IRenderQueue } from "@/types/IRender";
import { IRenderTask } from "@/types/IRenderTask";

export default class RenderQueue implements IRenderQueue {
  running: boolean;
  queue: IRenderTask[];
  stopped: boolean;

  constructor() {
    this.running = false;
    this.queue = [];
    this.stopped = false;
  }

  /**
   * 添加任务
   *
   * @param task
   */
  async add(task: IRenderTask): Promise<void> {
    if (this.stopped) return;
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
    if (this.stopped) return;
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    let task = this.queue.shift()!;
    if (task) {
      try {
        await task.run();
      } catch (error) {
        console.error("RenderQueue: error running task", task.id, error);
      } finally {
        if (task.destroy) {
          await task.destroy();
        }
        task = null;
      }
    }
    if (this.queue.length > 0) {
      requestAnimationFrame(() => {
        this.run();
      });
    } else {
      this.running = false;
    }
  }

  /**
   * 销毁队列
   */
  async destroy(): Promise<void> {
    this.stopped = true;
    while (this.queue.length > 0) {
      let task = this.queue.shift();
      if (task) {
        if (task.destroy) {
          await task.destroy();
        }
        task = null;
      }
    }
    this.queue = null;
    this.running = false;
  }
}

export class TaskQueue extends RenderQueue {}
