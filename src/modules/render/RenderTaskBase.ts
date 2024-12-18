import { IRenderTask } from "@/types";
import { nanoid } from "nanoid";

export default abstract class RenderTaskBase implements IRenderTask {
  id: string;

  constructor() {
    this.id = nanoid();
  }

  abstract run(): Promise<boolean>;

  destroy(): void {

  }

}