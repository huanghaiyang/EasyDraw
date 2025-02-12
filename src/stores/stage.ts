import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { IPoint, ShieldDispatcherNames, StageInitParams } from "@/types";
import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";
import IElement from "@/types/IElement";
import { DefaultElementStyle, StrokeTypes } from "@/styles/ElementStyles";
import { cloneDeep, throttle } from "lodash";
import { defineStore } from "pinia";
import {
  MoveableCreator,
  PenCreator,
  RectangleCreator,
} from "@/types/CreatorDicts";

// 舞台实例
const shield = new StageShield();
// 舞台容器
const container = new StageContainer();
// 配置
shield.configure.config({ rotationIconEnable: true });
window.shield = shield;

// 舞台默认数据
const DefaultStage = {
  // 组件位置
  position: {
    x: 0,
    y: 0,
  },
  // 组件宽度
  width: 0,
  // 组件高度
  height: 0,
  // 组件角度
  angle: 0,
  // X轴翻转
  flipX: false,
  // Y偏移角度
  leanYAngle: 0,
  // 缩放比例
  scale: 1,
  // 描边类型
  strokeType: DefaultElementStyle.strokeType,
  // 描边宽度
  strokeWidth: DefaultElementStyle.strokeWidth,
  // 描边颜色
  strokeColor: DefaultElementStyle.strokeColor,
  // 描边透明度
  strokeColorOpacity: DefaultElementStyle.strokeColorOpacity,
  // 填充颜色
  fillColor: DefaultElementStyle.fillColor,
  // 填充透明度
  fillColorOpacity: DefaultElementStyle.fillColorOpacity,
  // 字体大小
  fontSize: DefaultElementStyle.fontSize,
  // 字体
  fontFamily: DefaultElementStyle.fontFamily,
  // 文字对齐方式
  textAlign: DefaultElementStyle.textAlign,
  // 文字基线
  textBaseline: DefaultElementStyle.textBaseline,
  // 是否锁定比例
  isRatioLocked: false,
};

export const useStageStore = defineStore("stage", {
  state: () => {
    return {
      // 当前绘制工具
      currentCreator: MoveableCreator,
      // 当前鼠标工具
      currentCursorCreator: MoveableCreator,
      // 当前形状工具
      currentShapeCreator: RectangleCreator,
      // 当前自由工具
      currentArbitraryCreator: PenCreator,
      // 选中组件
      selectedElements: [],
      // 目标组件
      targetElements: [],
      // 舞台默认数据
      ...cloneDeep(DefaultStage),
    };
  },
  getters: {
    // 选中的唯一组件
    primarySelectedElement(): IElement {
      // 选中的非组合组件
      const elements = shield.store.getNoParentElements(this.selectedElements);
      if (elements.length !== 1) return null;
      return elements[0];
    },
    // 输入框是否禁用
    inputDisabled(): boolean {
      return !this.primarySelectedElement;
    },
    // 对齐是否可用
    alignEnable(): boolean {
      return this.selectedElements?.length >= 2;
    },
    // 平均是否可用
    averageEnable(): boolean {
      return this.selectedElements?.length >= 3;
    },
    // 自由线条绘制是否可见
    arbitraryVisible(): boolean {
      return this.currentCreator?.type === CreatorTypes.arbitrary;
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

      // 监听组件创建
      shield.on(ShieldDispatcherNames.elementCreated, this.onElementCreated);
      // 监听选中
      shield.on(ShieldDispatcherNames.selectedChanged, this.onSelectedChanged);
      // 监听目标
      shield.on(ShieldDispatcherNames.targetChanged, this.onTargetChanged);
      // 监听位置
      shield.on(
        ShieldDispatcherNames.positionChanged,
        throttle(this.onPositionChanged.bind(this), 100),
      );
      // 监听宽度
      shield.on(
        ShieldDispatcherNames.widthChanged,
        throttle(this.onWidthChanged.bind(this), 100),
      );
      // 监听高度
      shield.on(
        ShieldDispatcherNames.heightChanged,
        throttle(this.onHeightChanged.bind(this), 100),
      );
      // 监听角度
      shield.on(
        ShieldDispatcherNames.angleChanged,
        throttle(this.onAngleChanged.bind(this), 100),
      );
      // 监听X轴翻转
      shield.on(
        ShieldDispatcherNames.flipXChanged,
        throttle(this.onFlipXChanged.bind(this), 100),
      );
      // 监听Y偏移角度
      shield.on(
        ShieldDispatcherNames.leanYAngleChanged,
        throttle(this.onLeanYAngleChanged.bind(this), 100),
      );
      // 监听缩放
      shield.on(
        ShieldDispatcherNames.scaleChanged,
        throttle(this.onScaleChanged.bind(this), 100),
      );
      // 监听描边类型
      shield.on(
        ShieldDispatcherNames.strokeTypeChanged,
        throttle(this.onStrokeTypeChanged.bind(this), 100),
      );
      // 监听描边颜色透明度
      shield.on(
        ShieldDispatcherNames.strokeColorOpacityChanged,
        throttle(this.onStrokeColorOpacityChanged.bind(this), 100),
      );
      // 监听描边宽度
      shield.on(
        ShieldDispatcherNames.strokeWidthChanged,
        throttle(this.onStrokeWidthChanged.bind(this), 100),
      );
      // 监听描边颜色
      shield.on(
        ShieldDispatcherNames.strokeColorChanged,
        throttle(this.onStrokeColorChanged.bind(this), 100),
      );
      // 监听填充颜色
      shield.on(
        ShieldDispatcherNames.fillColorChanged,
        throttle(this.onFillColorChanged.bind(this), 100),
      );
      // 监听填充颜色透明度
      shield.on(
        ShieldDispatcherNames.fillColorOpacityChanged,
        throttle(this.onFillColorOpacityChanged.bind(this), 100),
      );
      // 监听字体大小
      shield.on(
        ShieldDispatcherNames.fontSizeChanged,
        throttle(this.onFontSizeChanged.bind(this), 100),
      );
      // 监听字体
      shield.on(
        ShieldDispatcherNames.fontFamilyChanged,
        throttle(this.onFontFamilyChanged.bind(this), 100),
      );
      // 监听文本对齐方式
      shield.on(
        ShieldDispatcherNames.textAlignChanged,
        throttle(this.onTextAlignChanged.bind(this), 100),
      );
      // 监听文本基线
      shield.on(
        ShieldDispatcherNames.textBaselineChanged,
        throttle(this.onTextBaselineChanged.bind(this), 100),
      );
      // 监听宽高比锁定
      shield.on(
        ShieldDispatcherNames.ratioLockedChanged,
        throttle(this.onRatioLockedChanged.bind(this), 100),
      );
      // 监听绘制工具
      shield.on(
        ShieldDispatcherNames.creatorChanged,
        throttle(this.onCreatorChanged.bind(this), 100),
      );
    },
    /**
     * 设置绘制工具
     *
     * @param creator
     */
    async setCreator(creator: Creator) {
      await shield.setCreator(creator);
    },
    /**
     * 创作工具变更
     *
     * @param creator
     */
    onCreatorChanged(creator: Creator) {
      this.currentCreator = creator;
      if (creator.category === CreatorCategories.cursor) {
        this.currentCursorCreator = creator;
      }
      if (creator.category === CreatorCategories.shapes) {
        this.currentShapeCreator = creator;
      }
      if (creator.category === CreatorCategories.freedom) {
        this.currentArbitraryCreator = creator;
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
        // 获取组合或者组件
        const element: IElement = shield.store.getAncestorGroup(
          this.selectedElements,
        );
        if (!element) {
          Object.assign(this, cloneDeep(DefaultStage));
          return;
        }
        const {
          position,
          width,
          height,
          angle,
          flipX,
          leanYAngle,
          strokeType,
          strokeWidth,
          strokeColor,
          strokeColorOpacity,
          fillColor,
          fillColorOpacity,
          fontSize,
          fontFamily,
          textAlign,
          textBaseline,
          isRatioLocked,
        } = element;
        // 组件位置
        this.onPositionChanged(element, position);
        // 组件宽度
        this.onWidthChanged(element, width);
        // 组件高度
        this.onHeightChanged(element, height);
        // 组件旋转角度
        this.onAngleChanged(element, angle);
        // X轴翻转
        this.onFlipXChanged(element, flipX);
        // Y轴偏移角度
        this.onLeanYAngleChanged(element, leanYAngle);
        // 描边类型
        this.onStrokeTypeChanged(element, strokeType);
        // 描边宽度
        this.onStrokeWidthChanged(element, strokeWidth);
        // 描边颜色
        this.onStrokeColorChanged(element, strokeColor);
        // 描边颜色透明度
        this.onStrokeColorOpacityChanged(element, strokeColorOpacity);
        // 填充颜色
        this.onFillColorChanged(element, fillColor);
        // 填充颜色透明度
        this.onFillColorOpacityChanged(element, fillColorOpacity);
        // 字体大小
        this.onFontSizeChanged(element, fontSize);
        // 字体
        this.onFontFamilyChanged(element, fontFamily);
        // 文本对齐方式
        this.onTextAlignChanged(element, textAlign);
        // 文本基线
        this.onTextBaselineChanged(element, textBaseline);
        // 宽高比锁定
        this.onRatioLockedChanged(element, isRatioLocked);
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
          y: position.y,
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
     * X轴翻转变化
     *
     * @param element
     * @param flipX
     */
    onFlipXChanged(element: IElement, flipX: boolean) {
      this.flipX = flipX;
    },
    /**
     * 组件倾斜变化
     *
     * @param element
     * @param angle
     */
    onLeanYAngleChanged(element: IElement, angle: number) {
      this.leanYAngle = angle;
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
    /**
     * 组件锁定比例变更
     *
     * @param element
     * @param ratioLocked
     */
    onRatioLockedChanged(element: IElement, isRatioLocked: boolean) {
      this.isRatioLocked = isRatioLocked;
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
     * 设置横坐标
     *
     * @param value
     */
    setElementsLeft(value: number): void {
      shield.setElementsPosition(this.selectedElements, {
        x: value,
        y: this.position.y,
      });
    },

    /**
     * 设置纵坐标
     *
     * @param value
     */
    setElementsTop(value: number): void {
      shield.setElementsPosition(this.selectedElements, {
        x: this.position.x,
        y: value,
      });
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
     * 设置组件Y倾斜角度
     */
    setElementsLeanYAngle(value: number): void {
      shield.setElementsLeanYAngle(this.selectedElements, value);
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
    /**
     * 设置舞台缩放
     *
     * @param value
     */
    setScale(value: number): void {
      shield.setScale(value);
    },
    /**
     * 自适应缩放
     */
    setScaleAutoFit(): void {
      shield.setScaleAutoFit();
    },
    /**
     * 放大
     */
    setScaleIncrease(): void {
      shield.setScaleIncrease();
    },
    /**
     * 缩小
     */
    setScaleReduce(): void {
      shield.setScaleReduce();
    },
    /**
     * 锁定比例
     *
     * @param value
     */
    setRatioLocked(value: boolean): void {
      shield.setElementsRatioLocked(this.selectedElements, value);
    },
    /**
     * 左侧对齐
     */
    setElementsAlignLeft(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignLeft(this.selectedElements);
    },
    /**
     * 水平居中对齐
     */
    setElementsAlignCenter(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignCenter(this.selectedElements);
    },
    /**
     * 右侧对齐
     */
    setElementsAlignRight(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignRight(this.selectedElements);
    },
    /**
     * 顶部对齐
     */
    setElementsAlignTop(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignTop(this.selectedElements);
    },
    /**
     * 垂直居中对齐
     */
    setElementsAlignMiddle(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignMiddle(this.selectedElements);
    },
    /**
     * 底部对齐
     */
    setElementsAlignBottom(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignBottom(this.selectedElements);
    },
    /**
     * 水平均分对齐
     */
    setElementsAverageVertical(): void {
      if (!this.averageEnable) return;
      shield.setElementsAverageVertical(this.selectedElements);
    },
    /**
     * 垂直平均分对齐
     */
    setElementsAverageHorizontal(): void {
      if (!this.averageEnable) return;
      shield.setElementsAverageHorizontal(this.selectedElements);
    },
    /**
     * 上传图片
     *
     * @param files
     */
    uploadImages(files: File[]): void {
      if (files.length) {
        shield.uploadImages(files);
      }
    },
    /**
     * 提交自由绘制
     */
    commitArbitraryDrawing(): void {
      shield.commitArbitraryDrawing();
    },
  },
});
