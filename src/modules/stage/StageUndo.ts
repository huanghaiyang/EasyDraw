import IStageShield from "@/types/IStageShield";
import IStageUndo from "@/types/IStageUndo";

export default class StageUndo implements IStageUndo {
  shield: IStageShield;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  redo(): void {}

  undo(): void {}
}
