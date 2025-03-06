import IStageShield from "@/types/IStageShield";
import ICommand from "@/types/ICommand";

export default interface IStageUndo {
  shield: IStageShield;
  undoStack: ICommand[];
  redoStack: ICommand[];

  undo(): void;
  redo(): void;
}
