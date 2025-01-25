import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ResizeV from "@/assets/svg/resize-v.svg";
import { IIconModel, IMaskModel } from "@/types/IModel";
import { CursorTypes } from "@/types/Stage";
import SplitV from '@/assets/svg/split-v.svg';
import Hand from '@/assets/svg/hand.svg';
import Cross from '@/assets/svg/cross.svg';
import Move from '@/assets/svg/move.svg';

export default class MaskTaskIconCursor extends MaskTaskBase {
  type: CursorTypes = CursorTypes.vertices;

  /**
   * 获取模型
   * 
   * @returns 
   */
  get data(): IIconModel {
    return this.model as IIconModel;
  }

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
    if (this.canvas) {
      let { point: { x, y }, width, height, scale } = this.data;
      await CanvasUtils.drawImgLike(this.canvas, this.img, {
        x: (x - width * scale / 2) / scale,
        y: (y - height * scale / 2) / scale,
        width,
        height,
      }, {
        angle: this.data.angle
      })
    }
  }

}