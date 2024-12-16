import { ElementCreateStatus, ElementObject, IStageElement } from "@/types";
import { nanoid } from "nanoid";

export default class StageElement implements IStageElement {
  obj: ElementObject;
  status: ElementCreateStatus;
  id: string;
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;

  constructor(obj: ElementObject) {
    this.obj = obj;
    this.status = ElementCreateStatus.starting;
    this.id = nanoid();
    this.isSelected = false;
    this.isVisible = true;
    this.isEditing = false;
    this.isLocked = false;
    this.isMoving = false;
    this.isResizing = false;
    this.isRotating = false;
    this.isDragging = false;
  }

  /**
   * 初始化
   * 
   * @param obj 
   */
  async init(): Promise<void> {
  }
}