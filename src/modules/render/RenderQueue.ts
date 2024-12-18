import { IRenderQueue, IRenderTask } from "@/types";

export default class RenderQueue implements IRenderQueue {
  running: boolean
  queue: IRenderTask[]

  constructor() {
    this.running = false
    this.queue = []
  }


  /**
   * 添加任务
   * 
   * @param task 
   */
  async add(task: IRenderTask): Promise<void> {
    this.queue.push(task)
    if (!this.running) {
      this.running = true
      await this.run()
    }
  }

  /**
   * 执行所有任务
   */
  async run(): Promise<void> {
    if (this.queue.length === 0) {
      this.running = false;
      console.log('RenderQueue: all tasks completed');
      return;
    }
    const task = this.queue.shift()!;
    if (task) {
      await task.run();
    }

    requestAnimationFrame(() => {
      this.run();
    });
  }
}