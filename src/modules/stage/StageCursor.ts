import { DrawerMaskModelTypes, IPoint } from "@/types";
import { IIconModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";
import IStageCursor from "@/types/IStageCursor";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { CursorSize } from "@/styles/MaskStyles";
import MaskTaskIconCursor from "@/modules/render/mask/task/MaskTaskIconCursor";
import { CursorTypes } from "@/types/Stage";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IBorderTransformer, IVerticesTransformer } from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import IElementRotation from "@/types/IElementRotation";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";

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
    return ElementUtils.calcWorldPoint(this.value, this.shield.stageCalcParams);
  }

  /**
   * 获取渲染参数
   *
   * @returns
   */
  get renderParams(): any {
    return { canvas: this.shield.mask.canvas };
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
    if (!this.shield.stageRect) return { x: 0, y: 0 };
    this.value = CommonUtils.getEventPosition(
      e,
      this.shield.stageRect,
      this.shield.stageScale,
    );
    this.value.x = MathUtils.preciseToFixed(this.value.x, 0);
    this.value.y = MathUtils.preciseToFixed(this.value.y, 0);
    return this.value;
  }

  /**
   * 设置鼠标样式
   *
   * @param cursor
   */
  setStyle(cursor: string): void {
    this.shield.canvas.style.cursor = cursor;
  }

  /**
   * 更新鼠标样式
   */
  updateStyle(e: MouseEvent): void {
    if (
      this.shield.selection.getActiveElementBorderTransformer() ||
      this.shield.selection.getActiveElementTransformer() ||
      this.shield.selection.getActiveElementRotation() ||
      this.shield.isDrawerActive
    ) {
      this.setStyle("none");
    } else if (this.shield.isHandActive) {
      this.setStyle("grab");
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
    if (this.shield.isDrawerActive) {
      return this.createMaskDrawingCursorTask();
    } else if (this.shield.isMoveableActive) {
      const controller = this.shield.selection.getActiveController();
      if (controller instanceof ElementRotation) {
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
    return new MaskTaskIconCursor(
      this._createTransformerCursorModel(),
      CursorTypes.cross,
      this.renderParams,
    );
  }

  /**
   * 创建一个旋转光标任务
   *
   * @returns
   */
  private createMaskRotationCursorTask(rotation: IElementRotation): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(
      this._createTransformerCursorModel({ angle: rotation.angle }),
      CursorTypes.move,
      this.renderParams,
    );
  }

  /**
   * 创建一个边框变换光标任务
   *
   * @param borderTransformer
   * @returns
   */
  private createMaskBorderTransformerCursorTask(
    borderTransformer: IBorderTransformer,
  ): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(
      this._createTransformerCursorModel(borderTransformer),
      CursorTypes.border,
      this.renderParams,
    );
  }

  /**
   * 创建一个变换光标任务
   *
   * @param transformer
   * @returns
   */
  private createMaskTransformerCursorTask(
    transformer: IVerticesTransformer,
  ): IMaskTask {
    if (!this.value) return;
    return new MaskTaskIconCursor(
      this._createTransformerCursorModel(transformer),
      CursorTypes.vertices,
      this.renderParams,
    );
  }

  /**
   * 创建一个变换光标的模型
   *
   * @param options
   * @returns
   */
  private _createTransformerCursorModel(options?: {
    angle: number;
  }): IIconModel {
    return {
      point: this.value,
      type: DrawerMaskModelTypes.cursor,
      width: CursorSize,
      height: CursorSize,
      angle: options?.angle || 0,
      scale: 1 / this.shield.stageScale,
    };
  }
}
