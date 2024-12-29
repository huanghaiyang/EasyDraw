import IStageContainer from "@/types/IStageContainer";

export default class StageContainer implements IStageContainer {
  el: HTMLDivElement;

  async init(el: HTMLDivElement): Promise<void> {
    this.el = el;
  }

}