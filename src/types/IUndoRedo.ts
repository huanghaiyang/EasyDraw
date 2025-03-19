import ICommand from "@/types/ICommand";

export default interface IUndoRedo<T> {
  undoStack: ICommand<T>[];
  redoStack: ICommand<T>[];

  get tailUndoCommand(): ICommand<T> | undefined;
  get tailRedoCommand(): ICommand<T> | undefined;

  undo(): void;
  redo(): void;

  add(command: ICommand<T>): void;
}
