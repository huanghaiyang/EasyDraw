import ICommand from "@/types/ICommand";

export default interface IUndoRedo<T> {
  undoStack: ICommand<T>[];
  redoStack: ICommand<T>[];

  get tailUndoCommand(): ICommand<T> | undefined;
  get tailRedoCommand(): ICommand<T> | undefined;

  undo(): Promise<boolean>;
  redo(): Promise<boolean>;

  add(command: ICommand<T>): void;
  clear(): void;
}
