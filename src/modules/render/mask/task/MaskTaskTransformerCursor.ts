import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ResizeV from "@/assets/svg/resize-v.svg";
import { IIconModel, IMaskModel } from "@/types/IModel";
import { TransformTypes } from "@/types/Stage";
import SplitV from '@/assets/svg/split-v.svg';

export default class MaskTaskTransformerCursor extends MaskTaskBase {
  type: TransformTypes = TransformTypes.vertices;

  get data(): IIconModel {
    return this.model as IIconModel;
  }

  get img(): string {
    switch (this.type) {
      case TransformTypes.vertices: {
        return ResizeV;
      }
      case TransformTypes.border: {
        return SplitV;
      }
    }
  }

  constructor(model: IMaskModel, type: TransformTypes, params?: any) {
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