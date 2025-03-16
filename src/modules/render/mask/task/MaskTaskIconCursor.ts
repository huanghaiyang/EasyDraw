import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ResizeV from "@/assets/svg/resize-v.svg";
import { IIconModel, IMaskModel } from "@/types/IModel";
import { CursorTypes } from "@/types/Stage";
import SplitV from "@/assets/svg/split-v.svg";
import Hand from "@/assets/svg/hand.svg";
import Cross from "@/assets/svg/cross_.svg";
import Move from "@/assets/svg/move.svg";
import RotateNE from "@/assets/svg/rotate-ne.svg";

export default class MaskTaskIconCursor extends MaskTaskBase {
  type: CursorTypes = CursorTypes.vertices;

  /**
   * 获取图标
   *
   * @returns
   */
  get img(): string {
    switch (this.type) {
      case CursorTypes.vertices: {
        return ResizeV;
      }
      case CursorTypes.border: {
        return SplitV;
      }
      case CursorTypes.hand: {
        return Hand;
      }
      case CursorTypes.cross: {
        return Cross;
      }
      case CursorTypes.move: {
        return Move;
      }
      case CursorTypes.rotation: {
        return RotateNE;
      }
    }
  }

  constructor(model: IMaskModel, type: CursorTypes, params?: any) {
    super(model, params);
    this.type = type;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    let {
      point: { x, y },
      width,
      height,
    } = this.model as IIconModel;
    await CanvasUtils.drawImgLike(
      this.canvas,
      this.img,
      {
        x: (x - width / CanvasUtils.scale / 2) * CanvasUtils.scale,
        y: (y - height / CanvasUtils.scale / 2) * CanvasUtils.scale,
        width,
        height,
      },
      {
        angle: this.model.angle,
      },
    );
  }
}
