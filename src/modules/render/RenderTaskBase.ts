import { IRenderTask } from "@/types/IRenderTask";
import CommonUtils from "@/utils/CommonUtils";

export default abstract class RenderTaskBase implements IRenderTask {
  id: string;

  constructor() {
    this.id = `${CommonUtils.getRandomId()}`;
  }

  run(): Promise<void> {
    return Promise.resolve();
  }
}
