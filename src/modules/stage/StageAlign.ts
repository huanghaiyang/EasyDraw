import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import IStageAlign from "@/types/IStageAlign";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import { flatten, sortBy } from "lodash";

export default class StageAlign implements IStageAlign {

  shield: IStageShield;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 获取组件坐标盒模型
   * 
   * @param elements 
   * @returns 
   */
  private _getElementsCoordsRect(elements: IElement[]): Partial<DOMRect> {
    return CommonUtils.getRect(flatten(elements.map(element => this._getElementAlignCoords(element))));
  }

  /**
   * 计算所有组件的宽度总和
   * 
   * @param elements 
   * @returns 
   */
  private _calcElementsAllWidth(elements: IElement[]): number {
    let allWidth = 0;
    elements.forEach(element => {
      const elementRect = CommonUtils.getRect(this._getElementAlignCoords(element));
      allWidth += elementRect.width;
    })
    return allWidth;
  }

  /**
   * 计算所有组件的高度总和
   * 
   * @param elements 
   * @returns 
   */
  private _calcElementsAllHeight(elements: IElement[]): number {
    let allHeight = 0;
    elements.forEach(element => {
      const elementRect = CommonUtils.getRect(this._getElementAlignCoords(element));
      allHeight += elementRect.height;
    })
    return allHeight;
  }

  /**
   * 按照x坐标排序
   * 
   * @param elements 
   */
  private _sortElementsByX(elements: IElement[]): IElement[] {
    return sortBy(elements, (element) => {
      return CommonUtils.getRect(this._getElementAlignCoords(element)).x;
    });
  }

  /**
   * 按照x坐标排序(x+width)
   * 
   * @param elements 
   * @returns 
   */
  private _sortElementsByXW(elements: IElement[]): IElement[] {
    return sortBy(elements, (element) => {
      const { x, width } = CommonUtils.getRect(this._getElementAlignCoords(element));
      return x + width;
    });
  }

  /**
   * 按照y坐标排序
   * 
   * @param elements 
   */
  private _sortElementsByY(elements: IElement[]): IElement[] {
    return sortBy(elements, (element) => {
      return CommonUtils.getRect(this._getElementAlignCoords(element)).y;
    });
  }

  /**
   * 按照y坐标排序(y+height)
   * 
   * @param elements 
   * @returns 
   */
  private _sortElementsByYH(elements: IElement[]): IElement[] {
    return sortBy(elements, (element) => {
      const { y, height } = CommonUtils.getRect(this._getElementAlignCoords(element));
      return y + height;
    });
  }

  /**
   * 获取组件对齐操作的坐标
   * 
   * @param element 
   * @returns 
   */
  private _getElementAlignCoords(element: IElement): IPoint[] {
    // 如果按住shift键则对齐操作需要考虑图形外部轮廓
    if (this.shield.event.isShift) return element.alignOutlineCoords;
    // 否则返回组件坐标
    return element.alignCoords;
  }

  /**
   * 设置组件位置
   * 
   * @param element 
   * @param offsetX 
   * @param offsetY 
   */
  private _setElementPositionByOffset(element: IElement, offsetX: number, offsetY: number): void {
    element.setPosition(element.centerCoord.x + offsetX, element.centerCoord.y + offsetY, { x: offsetX, y: offsetY });
  }

  /**
   * 左对齐
   * 
   * @param elements 
   */
  setElementsAlignLeft(elements: IElement[]): void {
    const { x } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { x: eX } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetX = x - eX;
      if (offsetX !== 0) {
        this._setElementPositionByOffset(element, offsetX, 0);
      }
    })
  }

  /**
   * 右对齐
   * 
   * @param elements 
   */
  setElementsAlignRight(elements: IElement[]): void {
    const { x, width } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { x: eX, width: eWidth } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetX = x + width - eX - eWidth;
      if (offsetX !== 0) {
        this._setElementPositionByOffset(element, offsetX, 0);
      }
    })
  }

  /**
   * 顶部对齐
   * 
   * @param elements 
   */
  setElementsAlignTop(elements: IElement[]): void {
    const { y } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { y: eY } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetY = y - eY;
      if (offsetY !== 0) {
        this._setElementPositionByOffset(element, 0, offsetY);
      }
    })
  }

  /**
   * 底部对齐
   * 
   * @param elements 
   */
  setElementsAlignBottom(elements: IElement[]): void {
    const { y, height } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { y: eY, height: eHeight } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetY = y + height - eY - eHeight;
      if (offsetY !== 0) {
        this._setElementPositionByOffset(element, 0, offsetY);
      }
    })
  }

  /**
   * 水平居中
   * 
   * @param elements 
   */
  setElementsAlignCenter(elements: IElement[]): void {
    const { x, width } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { x: eX, width: eWidth } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetX = x + width / 2 - (eX + eWidth / 2);
      if (offsetX !== 0) {
        this._setElementPositionByOffset(element, offsetX, 0);
      }
    })
  }

  /**
   * 垂直居中
   * 
   * @param elements 
   */
  setElementsAlignMiddle(elements: IElement[]): void {
    const { y, height } = this._getElementsCoordsRect(elements);
    elements.forEach(element => {
      const { y: eY, height: eHeight } = CommonUtils.getRect(this._getElementAlignCoords(element));
      const offsetY = y + height / 2 - (eY + eHeight / 2);
      if (offsetY !== 0) {
        this._setElementPositionByOffset(element, 0, offsetY);
      }
    })
  }

  /**
   * 水平平均分布
   * 
   * @param elements 
   */
  setElementsAverageVertical(elements: IElement[]): void {
    elements = this._sortElementsByY(elements);
    const { y, height } = this._getElementsCoordsRect(elements);
    const firstElementRect = CommonUtils.getRect(this._getElementAlignCoords(elements[0]));
    let prevY = y + firstElementRect.height;
    const allHeight = this._calcElementsAllHeight(elements);
    const margin = (height - allHeight) / (elements.length - 1);
    elements = this._sortElementsByYH(elements.slice(1));
    elements.forEach((element, index) => {
      if (index !== elements.length - 1) {
        const { y: eY, height: eHeight } = CommonUtils.getRect(this._getElementAlignCoords(element));
        const offsetY = prevY + margin - eY;
        if (offsetY !== 0) {
          this._setElementPositionByOffset(element, 0, offsetY);
        }
        prevY = eY + offsetY + eHeight;
      }
    })
  }

  /**
   * 垂直平均分布
   * 
   * @param elements 
   */
  setElementsAverageHorizontal(elements: IElement[]): void {
    elements = this._sortElementsByX(elements);
    const { x, width } = this._getElementsCoordsRect(elements);
    const firstElementRect = CommonUtils.getRect(this._getElementAlignCoords(elements[0]));
    let prevX = x + firstElementRect.width;
    const allWidth = this._calcElementsAllWidth(elements);
    const margin = (width - allWidth) / (elements.length - 1);
    elements = this._sortElementsByXW(elements.slice(1));
    elements.forEach((element, index) => {
      if (index !== elements.length - 1) {
        const { x: eX, width: eWidth } = CommonUtils.getRect(this._getElementAlignCoords(element));
        const offsetX = prevX + margin - eX;
        if (offsetX !== 0) {
          this._setElementPositionByOffset(element, offsetX, 0);
        }
        prevX = eX + offsetX + eWidth;
      }
    })
  }
}