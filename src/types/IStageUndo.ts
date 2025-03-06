import IStageShield from "./IStageShield";

export default interface IStageUndo {
  shield: IStageShield;
  undo(): void;
  redo(): void;
}
