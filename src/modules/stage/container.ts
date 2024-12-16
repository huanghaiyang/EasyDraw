import { IPoint, ISize, IStageContainer } from "@/types";

export default class StageContainer implements IStageContainer {
  size: ISize;
  position: IPoint;
  el: HTMLDivElement;

  async init(el: HTMLDivElement): Promise<void> {
    this.el = el;
  }

}