import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IIconModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import { CursorSize } from "@/styles/MaskStyles";
import MaskTaskIconCursor from "@/modules/render/mask/task/MaskTaskIconCursor";
import { CursorTypes } from "@/types/Stage";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IBorderTransformer, IVerticesTransformer } from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import CornerController from "@/modules/handler/controller/CornerController";
import { IPointController } from "@/types/IController";
import RotateController from "@/modules/handler/controller/RotateController";
import GlobalConfig from "@/config";

export default class StageCursor implements IStageCursor {
  // 光标位置
  value: IPoint;
  // 舞台
  shield: IStageShield;

  /**
   * 获取世界坐标
   *
   * @returns
   */
  get worldValue(): IPoint {
    if (!this.value) return null;
    return ElementUtils.calcWorldCoord(this.value);
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.value = null;
  }

  /**
   * 清除光标
   */
  clear(): void {
    this.value = null;
  }

  /**
   * 计算鼠标相对于画板的位置
   *
   * @param e
   * @returns
   */
  transform(e: MouseEvent): IPoint {
    if (!GlobalConfig.stageParams.rect) return { x: 0, y: 0 };
    this.value = CommonUtils.getEventPosition(e, GlobalConfig.stageParams.rect, GlobalConfig.stageParams.scale);
    this.value.x = Math.round(this.value.x);
    this.value.y = Math.round(this.value.y);
    return this.value;
  }

  /**
   * 设置鼠标样式
   *
   * @param cursor
   */
  setStyle(cursor: string): void {
    this.shield.node.style.cursor = cursor;
  }

  /**
   * 更新鼠标样式
   */
  updateStyle(e: MouseEvent): void {
    if (this.shield.selection.getActiveController() || this.shield.isDrawerActive || this.shield.isTextCreating) {
      this.setStyle("none");
    } else if (this.shield.isHandActive) {
      this.setStyle("grab");
    } else if (this.shield.isTextEditing && this.shield.store.editingElements.some(element => element.isContainsCoord(this.worldValue))) {
      this.setStyle("text");
    } else {
      this.setStyle("default");
    }
  }

  /**
   * 创建一个光标任务
   *
   * @returns
   */
  getTask(): IMaskTask {
    if (this.shield.isDrawerActive || this.shield.isTextCreating) {
      return this.createMaskDrawingCursorTask();
    } else if (this.shield.isMoveableActive) {
      const controller = this.shield.selection.getActiveController();
      if (controller instanceof RotateController) {
        return this.createMaskRotationControllerCursorTask(controller);
      } else if (controller instanceof ElementRotation || controller instanceof CornerController) {
        return this.createMaskRotationCursorTask(controller);
      } else if (controller instanceof VerticesTransformer) {
        return this.createMaskTransformerCursorTask(controller);
      } else if (controller instanceof BorderTransformer) {
        return this.createMaskBorderTransformerCursorTask(controller);
      }
    }
  }

  /**
   * 创建一个绘制mask光标的任务
   *
   * @returns
   */
  private createMaskDrawingCursorTask(): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(this._createTransformerCursorModel(), this.shield.mask.node as HTMLCanvasElement, CursorTypes.cross);
  }

  /**
   * 创建一个旋转光标任务
   *
   * @returns
   */
  private createMaskRotationCursorTask(rotation: IPointController): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(this._createTransformerCursorModel({ angle: rotation.angle }), this.shield.mask.node as HTMLCanvasElement, CursorTypes.move);
  }

  /**
   * 创建一个旋转控制器光标任务
   *
   * @param rotationController
   * @returns
   */
  private createMaskRotationControllerCursorTask(rotationController: RotateController) {
    if (!this.value) return;
    return new MaskTaskIconCursor(this._createTransformerCursorModel({ angle: rotationController.angle }), this.shield.mask.node as HTMLCanvasElement, CursorTypes.rotation);
  }

  /**
   * 创建一个边框变换光标任务
   *
   * @param borderTransformer
   * @returns
   */
  private createMaskBorderTransformerCursorTask(borderTransformer: IBorderTransformer): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(this._createTransformerCursorModel(borderTransformer), this.shield.mask.node as HTMLCanvasElement, CursorTypes.border);
  }

  /**
   * 创建一个变换光标任务
   *
   * @param transformer
   * @returns
   */
  private createMaskTransformerCursorTask(transformer: IVerticesTransformer): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(this._createTransformerCursorModel(transformer), this.shield.mask.node as HTMLCanvasElement, CursorTypes.vertices);
  }

  /**
   * 创建一个变换光标的模型
   *
   * @param options
   * @returns
   */
  private _createTransformerCursorModel(options?: { angle: number }): IIconModel {
    return {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: CursorSize,
      height: CursorSize,
      angle: options?.angle || 0,
    };
  }
}
