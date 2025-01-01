import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { IPoint, ShieldDispatcherNames, StageInitParams } from "@/types";
import { Creator, CreatorCategories } from "@/types/Creator";
import IElement from "@/types/IElement";
import { DefaultElementStyle, StrokeTypes } from "@/types/ElementStyles";
import { throttle } from "lodash";
import { defineStore } from "pinia";
import { MoveableCreator, RectangleCreator } from "@/types/CreatorDicts";

const shield = new StageShield();
const container = new StageContainer();
shield.configure.config({ rotationIconEnable: true })

export const useStageStore = defineStore("stage", {
  state: () => {
    return {
      currentCreator: MoveableCreator,
      currentCursorCreator: MoveableCreator,
      currentShapeCreator: RectangleCreator,
      selectedElements: [],
      targetElements: [],
      position: {
        x: 0,
        y: 0
      },
      width: 0,
      height: 0,
      angle: 0,
      scale: 1,
      strokeType: DefaultElementStyle.strokeType,
      strokeWidth: DefaultElementStyle.strokeWidth,
      strokeColor: DefaultElementStyle.strokeColor,
      strokeColorOpacity: DefaultElementStyle.strokeColorOpacity,
      fillColor: DefaultElementStyle.fillColor,
      fillColorOpacity: DefaultElementStyle.fillColorOpacity,
      fontSize: DefaultElementStyle.fontSize,
      fontFamily: DefaultElementStyle.fontFamily,
      textAlign: DefaultElementStyle.textAlign,
      textBaseline: DefaultElementStyle.textBaseline,
    }
  },
  getters: {
    uniqSelectedElement(): IElement {
      return this.selectedElements.length === 1 ? this.selectedElements[0] : null;
    },
    inputDisabled(): boolean {
      return !this.uniqSelectedElement;
    },
  },
  actions: {
    /**
     * 初始化舞台
     * 
     * @param params 
     */
    async init(params: StageInitParams) {
      await container.init(params.containerEl);
      await shield.init(params.shieldEl);

      this.setCreator(MoveableCreator);

      shield.on(ShieldDispatcherNames.elementCreated, this.onElementCreated);
      shield.on(ShieldDispatcherNames.selectedChanged, this.onSelectedChanged);
      shield.on(ShieldDispatcherNames.targetChanged, this.onTargetChanged);
      shield.on(ShieldDispatcherNames.positionChanged, throttle(this.onPositionChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.widthChanged, throttle(this.onWidthChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.heightChanged, throttle(this.onHeightChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.angleChanged, throttle(this.onAngleChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.scaleChanged, throttle(this.onScaleChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.strokeTypeChanged, throttle(this.onStrokeTypeChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.strokeColorOpacityChanged, throttle(this.onStrokeColorOpacityChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.strokeWidthChanged, throttle(this.onStrokeWidthChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.strokeColorChanged, throttle(this.onStrokeColorChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.fillColorChanged, throttle(this.onFillColorChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.fillColorOpacityChanged, throttle(this.onFillColorOpacityChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.fontSizeChanged, throttle(this.onFontSizeChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.fontFamilyChanged, throttle(this.onFontFamilyChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.textAlignChanged, throttle(this.onTextAlignChanged.bind(this), 100));
      shield.on(ShieldDispatcherNames.textBaselineChanged, throttle(this.onTextBaselineChanged.bind(this), 100));
    },
    /**
     * 设置绘制工具
     * 
     * @param creator 
     */
    async setCreator(creator: Creator) {
      await shield.setCreator(creator);
      this.currentCreator = creator;
      if (creator.category === CreatorCategories.cursor) {
        this.currentCursorCreator = creator;
      }
      if (creator.category === CreatorCategories.shapes) {
        this.currentShapeCreator = creator;
      }
    },
    /**
     * 舞台组件创建完毕
     * 
     * @param elementIds 
     */
    onElementCreated(elementIds: string[]) {
      this.setCreator(MoveableCreator);
    },
    /**
     * 舞台组件选中状态改变
     * 
     * @param selectedElements 
     */
    onSelectedChanged(selectedElements: IElement[]) {
      this.selectedElements = selectedElements;
      if (!!this.selectedElements.length) {
        const element = this.selectedElements[0];
        const {
          position,
          width,
          height,
          angle,
          strokeType,
          strokeWidth,
          strokeColor,
          strokeColorOpacity,
          fillColor,
          fillColorOpacity,
          fontSize,
          fontFamily,
          textAlign,
          textBaseline
        } = element;
        this.onPositionChanged(element, position);
        this.onWidthChanged(element, width);
        this.onHeightChanged(element, height);
        this.onAngleChanged(element, angle);
        this.onStrokeTypeChanged(element, strokeType);
        this.onStrokeWidthChanged(element, strokeWidth);
        this.onStrokeColorChanged(element, strokeColor);
        this.onStrokeColorOpacityChanged(element, strokeColorOpacity);
        this.onFillColorChanged(element, fillColor);
        this.onFillColorOpacityChanged(element, fillColorOpacity);
        this.onFontSizeChanged(element, fontSize);
        this.onFontFamilyChanged(element, fontFamily);
        this.onTextAlignChanged(element, textAlign);
        this.onTextBaselineChanged(element, textBaseline);
      }
    },
    /**
     * 舞台组件命中状态改变
     * 
     * @param targetElements 
     */
    onTargetChanged(targetElements: IElement[]) {
      this.targetElements = targetElements;
    },
    /**
     * 组件坐标变化
     * 
     * @param position 
     */
    onPositionChanged(element: IElement, position: IPoint) {
      if (position) {
        this.position = {
          x: position.x,
          y: position.y
        };
      }
    },
    /**
     * 组件宽度变化
     * 
     * @param element 
     * @param width 
     */
    onWidthChanged(element: IElement, width: number) {
      this.width = width;
    },
    /**
     * 组件高度变化
     * 
     * @param element 
     * @param height 
     */
    onHeightChanged(element: IElement, height: number) {
      this.height = height;
    },
    /**
     * 组件角度变化
     * 
     * @param element 
     * @param angle 
     */
    onAngleChanged(element: IElement, angle: number) {
      this.angle = angle;
    },
    /**
     * 组件缩放变化
     * 
     * @param element 
     * @param scale 
     */
    onScaleChanged(scale: number) {
      this.scale = scale;
    },
    /**
     * 组件描边类型变化
     * 
     * @param element 
     * @param strokeType 
     */
    onStrokeTypeChanged(element: IElement, strokeType: StrokeTypes) {
      this.strokeType = strokeType;
    },
    /**
     * 组件描边宽度变化
     * 
     * @param element 
     * @param strokeWidth 
     */
    onStrokeWidthChanged(element: IElement, strokeWidth: number) {
      this.strokeWidth = strokeWidth;
    },
    /**
     * 组件描边颜色变化
     * 
     * @param element 
     * @param strokeColor 
     */
    onStrokeColorChanged(element: IElement, strokeColor: string) {
      this.strokeColor = strokeColor;
    },
    /**
     * 组件填充颜色变化
     * 
     * @param element 
     * @param fillColor 
     */
    onFillColorChanged(element: IElement, fillColor: string) {
      this.fillColor = fillColor;
    },
    /**
     * 组件描边透明度变化
     * 
     * @param element 
     * @param strokeColorOpacity 
     */
    onStrokeColorOpacityChanged(element: IElement, strokeColorOpacity: number) {
      this.strokeColorOpacity = strokeColorOpacity;
    },
    /**
     * 组件填充透明度变化
     * 
     * @param element 
     * @param fillColorOpacity 
     */
    onFillColorOpacityChanged(element: IElement, fillColorOpacity: number) {
      this.fillColorOpacity = fillColorOpacity;
    },
    /**
     * 组件字体大小变化
     * 
     * @param element 
     * @param fontSize 
     */
    onFontSizeChanged(element: IElement, fontSize: number) {
      this.fontSize = fontSize;
    },
    /**
     * 组件字体变化
     * 
     * @param element 
     * @param fontFamily 
     */
    onFontFamilyChanged(element: IElement, fontFamily: string) {
      this.fontFamily = fontFamily;
    },
    /**
     * 组件字体对齐方式变化
     * 
     * @param element 
     * @param textAlign 
     */
    onTextAlignChanged(element: IElement, textAlign: string) {
      this.textAlign = textAlign;
    },
    /**
     * 组件字体基线变化
     * 
     * @param element 
     * @param textBaseline 
     */
    onTextBaselineChanged(element: IElement, textBaseline: string) {
      this.textBaseline = textBaseline;
    },
    //-----------------------------------属性设置---------------------------------------//
    /**
     * 设置组件位置
     * 
     * @param elements 
     * @param value 
     */
    setElementsPosition(value: IPoint): void {
      shield.setElementsPosition(this.selectedElements, value);
    },

    /**
     * 设置组件宽度
     * 
     * @param elements 
     * @param value 
     */
    setElementsWidth(value: number): void {
      shield.setElementsWidth(this.selectedElements, value);
    },

    /**
     * 设置组件高度
     * 
     * @param elements 
     * @param value 
     */
    setElementsHeight(value: number): void {
      shield.setElementsHeight(this.selectedElements, value);
    },

    /**
     * 设置组件角度
     * 
     * @param elements 
     * @param value 
     */
    setElementsAngle(value: number): void {
      shield.setElementsAngle(this.selectedElements, value);
    },

    /**
     * 设置组件边框类型
     * 
     * @param elements 
     * @param value 
     */
    setElementsStrokeType(value: StrokeTypes): void {
      shield.setElementsStrokeType(this.selectedElements, value);
    },

    /**
     * 设置组件边框宽度
     * 
     * @param elements 
     * @param value 
     */
    setElementsStrokeWidth(value: number): void {
      shield.setElementsStrokeWidth(this.selectedElements, value);
    },

    /**
     * 设置组件边框颜色
     * 
     * @param elements 
     * @param value 
     */
    setElementsStrokeColor(value: string): void {
      shield.setElementsStrokeColor(this.selectedElements, value);
    },

    /**
     * 设置组件边框颜色透明度
     * 
     * @param elements 
     * @param value 
     */
    setElementsStrokeColorOpacity(value: number): void {
      shield.setElementsStrokeColorOpacity(this.selectedElements, value);
    },

    /**
     * 设置组件填充颜色
     * 
     * @param elements 
     * @param value 
     */
    setElementsFillColor(value: string): void {
      shield.setElementsFillColor(this.selectedElements, value);
    },

    /**
     * 设置组件填充颜色透明度
     * 
     * @param elements 
     * @param value 
     */
    setElementsFillColorOpacity(value: number): void {
      shield.setElementsFillColorOpacity(this.selectedElements, value);
    },

    /**
     * 设置组件文本对齐方式
     * 
     * @param elements 
     * @param value 
     */
    setElementsTextAlign(value: CanvasTextAlign): void {
      shield.setElementsTextAlign(this.selectedElements, value);
    },

    /**
     * 设置组件文本基线
     * 
     * @param elements 
     * @param value 
     */
    setElementsTextBaseline(value: CanvasTextBaseline): void {
      shield.setElementsTextBaseline(this.selectedElements, value);
    },

    /**
     * 设置组件字体大小
     * 
     * @param elements 
     * @param value 
     */
    setElementsFontSize(value: number): void {
      shield.setElementsFontSize(this.selectedElements, value);
    },

    /**
     * 设置组件字体
     * 
     * @param elements 
     * @param value 
     */
    setElementsFontFamily(value: string): void {
      shield.setElementsFontFamily(this.selectedElements, value);
    },
  },
});