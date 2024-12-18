import { IRenderTask } from "@/types";
import { nanoid } from "nanoid";

export default abstract class RenderTaskBase implements IRenderTask {
  id: string;

  constructor() {
    this.id = nanoid();
  }
  run(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  destroy(): Promise<void> {
    throw new Error("Method not implemented.");
  }

}