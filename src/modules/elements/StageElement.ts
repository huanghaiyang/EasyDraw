import { CreatorTypes, IPoint, IStageElement } from "@/types";

export default class StageElement implements IStageElement {
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
}