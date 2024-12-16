import { CreatorTypes, ElementCreateStatus, ElementObject, IPoint, IStageElement } from "@/types";

export default class StageElement implements IStageElement {
  obj: ElementObject;
  status: ElementCreateStatus;
  id: string;
  points: IPoint[];
  type: CreatorTypes;
  data: any;
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}