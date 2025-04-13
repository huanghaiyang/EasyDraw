import StageContainer from "@/modules/stage/StageContainer";
import StageShield from "@/modules/stage/StageShield";
import { ElementStatus, IPoint, ShieldDispatcherNames, StageInitParams } from "@/types";
import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";
import IElement, { DefaultCornerModel } from "@/types/IElement";
import { DefaultElementStyle, DefaultFillStyle, DefaultStrokeStyle, StrokeStyle, StrokeTypes, TextDecoration, TextVerticalAlign } from "@/styles/ElementStyles";
import { throttle } from "lodash";
import { defineStore } from "pinia";
import { MoveableCreator, PenCreator, RectangleCreator, TextCreator } from "@/types/CreatorDicts";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { toRaw } from "vue";
import LodashUtils from "@/utils/LodashUtils";

// 舞台实例
const shield = new StageShield();
// 舞台容器
const container = new StageContainer();
// 配置
shield.configure.config({ rotationIconEnable: true });
// 节流时间
const ThrottleTime = 200;
// 节流配置
const tOptions = { leading: true, trailing: true };

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
  // 组件圆角
  corners: [...DefaultCornerModel.corners],
  // X轴翻转
  flipX: false,
  // Y偏移角度
  leanYAngle: 0,
  // 缩放比例
  scale: 1,
  // 描边
  strokes: [
    {
      ...DefaultStrokeStyle,
    },
  ],
  // 填充颜色
  fills: [
    {
      ...DefaultFillStyle,
    },
  ],
  // 字体大小
  fontSize: DefaultElementStyle.fontSize,
  // 字体
  fontFamily: DefaultElementStyle.fontFamily,
  // 字体行高
  fontLineHeight: DefaultElementStyle.fontLineHeight,
  // 字体行高是否混合
  fontLineHeightFactor: DefaultElementStyle.fontLineHeightFactor,
  // 字体行高自动适应
  fontLineHeightAutoFit: DefaultElementStyle.fontLineHeightAutoFit,
  // 字体间距
  fontLetterSpacing: DefaultElementStyle.fontLetterSpacing,
  // 字体颜色
  fontColor: DefaultElementStyle.fontColor,
  // 字体颜色透明度
  fontColorOpacity: DefaultElementStyle.fontColorOpacity,
  // 字体大小是否混合
  fontSizeMixin: false,
  // 字体是否混合
  fontFamilyMixin: false,
  // 字体颜色是否混合
  fontColorMixin: false,
  // 字体颜色透明度是否混合
  fontColorOpacityMixin: false,
  // 字体间距是否混合
  fontLetterSpacingMixin: false,
  // 文字对齐方式
  textAlign: DefaultElementStyle.textAlign,
  // 文字垂直对齐方式
  textVerticalAlign: DefaultElementStyle.textVerticalAlign,
  // 文字基线
  textBaseline: DefaultElementStyle.textBaseline,
  // 文字装饰
  textDecoration: DefaultElementStyle.textDecoration,
  // 文字装饰颜色
  textDecorationColor: DefaultElementStyle.textDecorationColor,
  // 文字装饰透明度
  textDecorationOpacity: DefaultElementStyle.textDecorationOpacity,
  // 文字装饰厚度
  textDecorationThickness: DefaultElementStyle.textDecorationThickness,
  // 文字装饰是否混合
  textDecorationMixin: false,
  // 文字装饰颜色是否混合
  textDecorationColorMixin: false,
  // 文字装饰透明度是否混合
  textDecorationOpacityMixin: false,
  // 文字装饰厚度是否混合
  textDecorationThicknessMixin: false,
  // 段落间距
  paragraphSpacing: DefaultElementStyle.paragraphSpacing,
  // 段落间距是否混合
  paragraphSpacingMixin: false,
  // 是否锁定比例
  isRatioLocked: false,
  // 填充是否可用
  fillEnable: false,
  // 描边是否可用
  strokeEnable: false,
  // 字体是否可用
  fontEnable: false,
  // 圆角是否可用
  cornersEnable: false,
  // 锁定比例是否可用
  ratioLockedEnable: false,
  // 填充输入是否可用
  fillInputEnable: false,
  // 描边输入是否可用
  strokeInputEnable: false,
  // 字体输入是否可用
  fontInputEnable: false,
  // 字体行高输入是否可用
  fontLineHeightInputEnable: false,
  // 字体行高倍数输入是否可用
  fontLineHeightFactorInputEnable: false,
  // 字体间距输入是否可用
  fontLetterSpacingInputEnable: false,
  // 圆角输入是否可用
  cornersInputEnable: false,
  // 宽度输入是否可用
  widthInputEnable: false,
  // 高度输入是否可用
  heightInputEnable: false,
  // 角度输入是否可用
  angleInputEnable: false,
  // Y倾斜角度输入是否可用
  leanYAngleInputEnable: false,
  // 位置输入是否可用
  positionInputEnable: false,
  // 段落间距输入是否可用
  paragraphSpacingInputEnable: false,
  // 组件状态
  status: ElementStatus.initialed,
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
      // 当前文本工具
      currentTextCreator: TextCreator,
      // 当前自由工具
      currentArbitraryCreator: PenCreator,
      // 选中组件
      selectedElements: [],
      // 目标组件
      targetElements: [],
      // 是否多选
      isMultiSelected: false,
      // 舞台主选中组件
      primarySelectedElement: null,
      // 层上移是否可用
      layerShiftMoveEnable: false,
      // 层下移动是否可用
      layerGoDownEnable: false,
      // 舞台默认数据
      ...LodashUtils.jsonClone(DefaultStage),
    };
  },
  getters: {
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

      [
        [ShieldDispatcherNames.elementCreated, this.onElementCreated],
        [ShieldDispatcherNames.selectedChanged, this.onSelectedChanged],
        [ShieldDispatcherNames.targetChanged, this.onTargetChanged],
        [ShieldDispatcherNames.multiSelectedChanged, this.onMultiSelectedChanged],
        [ShieldDispatcherNames.primarySelectedChanged, this.onPrimarySelectedChanged],
      ].forEach(([name, callback]) => {
        shield.on(name, callback.bind(this));
      });

      [
        [ShieldDispatcherNames.positionChanged, this.onPositionChanged],
        [ShieldDispatcherNames.widthChanged, this.onWidthChanged],
        [ShieldDispatcherNames.heightChanged, this.onHeightChanged],
        [ShieldDispatcherNames.angleChanged, this.onAngleChanged],
        [ShieldDispatcherNames.cornersChanged, this.onCornersChanged],
        [ShieldDispatcherNames.flipXChanged, this.onFlipXChanged],
        [ShieldDispatcherNames.leanYAngleChanged, this.onLeanYAngleChanged],
        [ShieldDispatcherNames.scaleChanged, this.onScaleChanged],
        [ShieldDispatcherNames.strokesChanged, this.onStrokesChanged],
        [ShieldDispatcherNames.fillsChanged, this.onFillsChanged],
        [ShieldDispatcherNames.statusChanged, this.onStatusChanged],
        [ShieldDispatcherNames.fontSizeChanged, this.onFontSizeChanged],
        [ShieldDispatcherNames.fontFamilyChanged, this.onFontFamilyChanged],
        [ShieldDispatcherNames.fontLineHeightChanged, this.onFontLineHeightChanged],
        [ShieldDispatcherNames.fontLineHeightFactorChanged, this.onFontLineHeightFactorChanged],
        [ShieldDispatcherNames.fontLineHeightAutoFitChanged, this.onFontLineHeightAutoFitChanged],
        [ShieldDispatcherNames.fontLetterSpacingChanged, this.onFontLetterSpacingChanged],
        [ShieldDispatcherNames.fontColorChanged, this.onFontColorChanged],
        [ShieldDispatcherNames.fontColorOpacityChanged, this.onFontColorOpacityChanged],
        [ShieldDispatcherNames.fontSizeMixinChanged, this.onFontSizeMixinChanged],
        [ShieldDispatcherNames.fontFamilyMixinChanged, this.onFontFamilyMixinChanged],
        [ShieldDispatcherNames.fontColorMixinChanged, this.onFontColorMixinChanged],
        [ShieldDispatcherNames.fontColorOpacityMixinChanged, this.onFontColorOpacityMixinChanged],
        [ShieldDispatcherNames.fontLetterSpacingMixinChanged, this.onFontLetterSpacingMixinChanged],
        [ShieldDispatcherNames.textDecorationChanged, this.onTextDecorationChanged],
        [ShieldDispatcherNames.textDecorationColorChanged, this.onTextDecorationColorChanged],
        [ShieldDispatcherNames.textDecorationOpacityChanged, this.onTextDecorationOpacityChanged],
        [ShieldDispatcherNames.textDecorationThicknessChanged, this.onTextDecorationThicknessChanged],
        [ShieldDispatcherNames.textDecorationMixinChanged, this.onTextDecorationMixinChanged],
        [ShieldDispatcherNames.textDecorationColorMixinChanged, this.onTextDecorationColorMixinChanged],
        [ShieldDispatcherNames.textDecorationOpacityMixinChanged, this.onTextDecorationOpacityMixinChanged],
        [ShieldDispatcherNames.textDecorationThicknessMixinChanged, this.onTextDecorationThicknessMixinChanged],
        [ShieldDispatcherNames.textAlignChanged, this.onTextAlignChanged],
        [ShieldDispatcherNames.textVerticalAlignChanged, this.onTextVerticalAlignChanged],
        [ShieldDispatcherNames.textBaselineChanged, this.onTextBaselineChanged],
        [ShieldDispatcherNames.ratioLockedChanged, this.onRatioLockedChanged],
        [ShieldDispatcherNames.creatorChanged, this.onCreatorChanged],
        [ShieldDispatcherNames.layerShiftMoveEnableChanged, this.onLayerShiftMoveEnableChanged],
        [ShieldDispatcherNames.layerGoDownEnableChanged, this.onLayerGoDownEnableChanged],
        [ShieldDispatcherNames.paragraphSpacingChanged, this.onParagraphSpacingChanged],
      ].forEach(([name, callback]) => {
        shield.on(name, throttle(callback.bind(this), ThrottleTime, tOptions));
      });
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
     * 舞台组件选中状态改变
     *
     * @param selectedElements
     */
    onMultiSelectedChanged(isMultiSelected: boolean) {
      this.isMultiSelected = isMultiSelected;
    },
    /**
     * 舞台主选中状态改变
     *
     * @param primarySelectedElement
     */
    onPrimarySelectedChanged(primarySelectedElement: IElement | null) {
      this.primarySelectedElement = primarySelectedElement;
    },
    /**
     * 舞台组件创建完毕
     *
     * @param elements
     */
    onElementCreated(elements: IElement[]) {
      if (elements.length) {
        this.onElementChanged(elements[0]);
      }
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
        const element: IElement = ElementUtils.getAncestorGroup(this.selectedElements);
        if (!element) {
          Object.assign(this, LodashUtils.jsonClone(DefaultStage));
          return;
        }
        this.onElementChanged(element);
      }
    },
    /**
     * 舞台组件变更
     *
     * @param element
     */
    onElementChanged(element: IElement) {
      if (!element) return;
      const {
        status,
        position,
        width,
        height,
        angle,
        corners,
        flipX,
        leanYAngle,
        strokes,
        fills,
        fontSize,
        fontFamily,
        fontColor,
        fontColorOpacity,
        fontSizeMixin,
        fontFamilyMixin,
        fontColorMixin,
        fontColorOpacityMixin,
        fontLetterSpacingMixin,
        fontLineHeight,
        fontLineHeightFactor,
        fontLineHeightAutoFit,
        fontLetterSpacing,
        textAlign,
        textVerticalAlign,
        textBaseline,
        isRatioLocked,
        textDecoration,
        textDecorationColor,
        textDecorationOpacity,
        textDecorationThickness,
        textDecorationMixin,
        textDecorationColorMixin,
        textDecorationOpacityMixin,
        textDecorationThicknessMixin,
        paragraphSpacing,
      } = element;
      // 组件状态
      this.onStatusChanged(element, status);
      // 组件位置
      this.onPositionChanged(element, position);
      // 组件宽度
      this.onWidthChanged(element, width);
      // 组件高度
      this.onHeightChanged(element, height);
      // 组件旋转角度
      this.onAngleChanged(element, angle);
      // 组件圆角
      this.onCornersChanged(element, corners);
      // X轴翻转
      this.onFlipXChanged(element, flipX);
      // Y轴偏移角度
      this.onLeanYAngleChanged(element, leanYAngle);
      // 描边
      this.onStrokesChanged(element, strokes);
      // 填充颜色
      this.onFillsChanged(element, fills);
      // 字体大小
      this.onFontSizeChanged(element, fontSize);
      // 字体
      this.onFontFamilyChanged(element, fontFamily);
      // 字体行高
      this.onFontLineHeightChanged(element, fontLineHeight);
      // 字体行高倍数
      this.onFontLineHeightFactorChanged(element, fontLineHeightFactor);
      // 字体行高自动适应
      this.onFontLineHeightAutoFitChanged(element, fontLineHeightAutoFit);
      // 字体间距
      this.onFontLetterSpacingChanged(element, fontLetterSpacing);
      // 字体颜色
      this.onFontColorChanged(element, fontColor);
      // 字体颜色透明度
      this.onFontColorOpacityChanged(element, fontColorOpacity);
      // 字体大小混合
      this.onFontSizeMixinChanged(element, fontSizeMixin);
      // 字体混合
      this.onFontFamilyMixinChanged(element, fontFamilyMixin);
      // 字体颜色混合
      this.onFontColorMixinChanged(element, fontColorMixin);
      // 字体颜色透明度混合
      this.onFontColorOpacityMixinChanged(element, fontColorOpacityMixin);
      // 字体间距混合
      this.onFontLetterSpacingMixinChanged(element, fontLetterSpacingMixin);
      // 文本对齐方式
      this.onTextAlignChanged(element, textAlign);
      // 文本垂直对齐方式
      this.onTextVerticalAlignChanged(element, textVerticalAlign);
      // 文本基线
      this.onTextBaselineChanged(element, textBaseline);
      // 宽高比锁定
      this.onRatioLockedChanged(element, isRatioLocked);
      // 文本装饰
      this.onTextDecorationChanged(element, textDecoration);
      // 文本装饰颜色
      this.onTextDecorationColorChanged(element, textDecorationColor);
      // 文本装饰透明度
      this.onTextDecorationOpacityChanged(element, textDecorationOpacity);
      // 文本装饰粗细
      this.onTextDecorationThicknessChanged(element, textDecorationThickness);
      // 文本装饰混合
      this.onTextDecorationMixinChanged(element, textDecorationMixin);
      // 文本装饰颜色混合
      this.onTextDecorationColorMixinChanged(element, textDecorationColorMixin);
      // 文本装饰透明度混合
      this.onTextDecorationOpacityMixinChanged(element, textDecorationOpacityMixin);
      // 文本装饰粗细混合
      this.onTextDecorationThicknessMixinChanged(element, textDecorationThicknessMixin);
      // 段落间距
      this.onParagraphSpacingChanged(element, paragraphSpacing);
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
     * 组件状态变化
     *
     * @param status
     */
    onStatusChanged(element: IElement, status: ElementStatus) {
      this.status = status;
      const {
        fillEnable,
        strokeEnable,
        fontEnable,
        cornersEnable,
        ratioLockedEnable,
        widthInputEnable,
        heightInputEnable,
        fillInputEnable,
        strokeInputEnable,
        fontInputEnable,
        fontLineHeightInputEnable,
        fontLineHeightFactorInputEnable,
        fontLetterSpacingInputEnable,
        cornersInputEnable,
        angleInputEnable,
        leanYAngleInputEnable,
        positionInputEnable,
        paragraphSpacingInputEnable,
      } = element;
      this.fillEnable = fillEnable;
      this.strokeEnable = strokeEnable;
      this.fontEnable = fontEnable;
      this.cornersEnable = cornersEnable;
      this.ratioLockedEnable = ratioLockedEnable;
      this.widthInputEnable = widthInputEnable;
      this.heightInputEnable = heightInputEnable;
      this.fillInputEnable = fillInputEnable;
      this.strokeInputEnable = strokeInputEnable;
      this.fontInputEnable = fontInputEnable;
      this.fontLineHeightInputEnable = fontLineHeightInputEnable;
      this.fontLineHeightFactorInputEnable = fontLineHeightFactorInputEnable;
      this.fontLetterSpacingInputEnable = fontLetterSpacingInputEnable;
      this.angleInputEnable = angleInputEnable;
      this.leanYAngleInputEnable = leanYAngleInputEnable;
      this.cornersInputEnable = cornersInputEnable;
      this.positionInputEnable = positionInputEnable;
      this.paragraphSpacingInputEnable = paragraphSpacingInputEnable;
    },
    /**
     * 组件坐标变化

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
     * 圆角变化
     *
     * @param element
     * @param corners
     */
    onCornersChanged(element: IElement, corners: number[]) {
      this.corners = [...corners];
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
     * @param stroke
     */
    onStrokesChanged(element: IElement, strokes: StrokeStyle[] = []) {
      this.strokes = LodashUtils.jsonClone(strokes);
    },
    /**
     * 组件填充变化
     *
     * @param element
     * @param fills
     */
    onFillsChanged(element: IElement, fills: StrokeStyle[] = []) {
      this.fills = LodashUtils.jsonClone(fills);
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
     * 组件字体行高变化
     *
     * @param element
     * @param fontLineHeight
     */
    onFontLineHeightChanged(element: IElement, fontLineHeight: number) {
      this.fontLineHeight = fontLineHeight;
    },
    /**
     * 组件字体行高倍数变化
     *
     * @param element
     * @param fontLineHeightFactor
     */
    onFontLineHeightFactorChanged(element: IElement, fontLineHeightFactor: number) {
      this.fontLineHeightFactor = fontLineHeightFactor;
    },
    /**
     * 组件字体行高自动适应变化
     *
     * @param element
     * @param fontLineHeightAutoFit
     */
    onFontLineHeightAutoFitChanged(element: IElement, fontLineHeightAutoFit: boolean) {
      this.fontLineHeightAutoFit = fontLineHeightAutoFit;
    },
    /**
     * 组件字体间距变化
     *
     * @param element
     * @param fontLetterSpacing
     */
    onFontLetterSpacingChanged(element: IElement, fontLetterSpacing: number) {
      this.fontLetterSpacing = fontLetterSpacing;
    },
    /**
     * 组件字体颜色变化
     *
     * @param element
     * @param fontColor
     */
    onFontColorChanged(element: IElement, fontColor: string) {
      this.fontColor = fontColor;
    },
    /**
     * 组件字体颜色透明度变化
     *
     * @param element
     * @param fontColorOpacity
     */
    onFontColorOpacityChanged(element: IElement, fontColorOpacity: number) {
      this.fontColorOpacity = fontColorOpacity;
    },
    /**
     * 组件字体大小混合变化
     *
     * @param element
     * @param fontSizeMixin
     */
    onFontSizeMixinChanged(element: IElement, fontSizeMixin: number) {
      this.fontSizeMixin = fontSizeMixin;
    },
    /**
     * 组件字体变化
     *
     * @param element
     * @param fontFamilyMixin
     */
    onFontFamilyMixinChanged(element: IElement, fontFamilyMixin: string) {
      this.fontFamilyMixin = fontFamilyMixin;
    },
    /**
     * 组件字体颜色变化
     *
     * @param element
     * @param fontColorMixin
     */
    onFontColorMixinChanged(element: IElement, fontColorMixin: string) {
      this.fontColorMixin = fontColorMixin;
    },
    /**
     * 组件字体颜色透明度变化

     * @param element
     * @param fontColorOpacityMixin
     */
    onFontColorOpacityMixinChanged(element: IElement, fontColorOpacityMixin: number) {
      this.fontColorOpacityMixin = fontColorOpacityMixin;
    },
    /**
     * 组件字体间距混合变化

     * @param element
     * @param fontLetterSpacingMixin
     */
    onFontLetterSpacingMixinChanged(element: IElement, fontLetterSpacingMixin: number) {
      this.fontLetterSpacingMixin = fontLetterSpacingMixin;
    },
    /**
     * 组件字体对齐方式变化

     * @param element
     * @param textAlign
     */
    onTextAlignChanged(element: IElement, textAlign: string) {
      this.textAlign = textAlign;
    },
    /**
     * 组件垂直对齐方式变化

     * @param element
     * @param textVerticalAlign
     */
    onTextVerticalAlignChanged(element: IElement, textVerticalAlign: TextVerticalAlign) {
      this.textVerticalAlign = textVerticalAlign;
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
     * 组件文本装饰变化
     *
     * @param element
     * @param textDecoration
     */
    onTextDecorationChanged(element: IElement, textDecoration: string) {
      this.textDecoration = textDecoration;
    },
    /**
     * 组件文本装饰颜色变化
     *
     * @param element
     * @param textDecorationColor
     */
    onTextDecorationColorChanged(element: IElement, textDecorationColor: string) {
      this.textDecorationColor = textDecorationColor;
    },
    /**
     * 组件文本装饰透明度变化
     *
     * @param element
     * @param textDecorationOpacity
     */
    onTextDecorationOpacityChanged(element: IElement, textDecorationOpacity: number) {
      this.textDecorationOpacity = textDecorationOpacity;
    },
    /**
     * 组件文本装饰粗细变化
     *
     * @param element
     * @param textDecorationThickness
     */
    onTextDecorationThicknessChanged(element: IElement, textDecorationThickness: number) {
      this.textDecorationThickness = textDecorationThickness;
    },
    /**
     * 组件文本装饰粗细混合变化
     *
     * @param element
     * @param textDecorationThicknessMixin
     */
    onTextDecorationMixinChanged(element: IElement, textDecorationMixin: string) {
      this.textDecorationMixin = textDecorationMixin;
    },
    /**
     * 组件文本装饰颜色混合变化
     *
     * @param element
     * @param textDecorationColorMixin
     */
    onTextDecorationColorMixinChanged(element: IElement, textDecorationColorMixin: string) {
      this.textDecorationColorMixin = textDecorationColorMixin;
    },
    /**
     * 组件文本装饰透明度混合变化
     *
     * @param element
     * @param textDecorationOpacityMixin
     */
    onTextDecorationOpacityMixinChanged(element: IElement, textDecorationOpacityMixin: number) {
      this.textDecorationOpacityMixin = textDecorationOpacityMixin;
    },
    /**
     * 组件文本装饰粗细混合变化
     *
     * @param element
     * @param textDecorationThicknessMixin
     */
    onTextDecorationThicknessMixinChanged(element: IElement, textDecorationThicknessMixin: number) {
      this.textDecorationThicknessMixin = textDecorationThicknessMixin;
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
    /**
     * 组件段落间距变化
     *
     * @param element
     * @param paragraphSpacing
     */
    onParagraphSpacingChanged(element: IElement, paragraphSpacing: number) {
      this.paragraphSpacing = paragraphSpacing;
    },
    /**
     * 层上移是否可用
     */
    onLayerShiftMoveEnableChanged(value: boolean) {
      this.layerShiftMoveEnable = value;
    },
    /**
     * 层下移是否可用
     */
    onLayerGoDownEnableChanged(value: boolean) {
      this.layerGoDownEnable = value;
    },
    //-----------------------------------属性设置---------------------------------------//
    /**
     * 设置组件位置
     *
     * @param value
     */
    setElementsPosition(value: IPoint): void {
      shield.setElementsPosition(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件宽度
     *
     * @param value
     */
    setElementsWidth(value: number): void {
      shield.setElementsWidth(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件高度
     *
     * @param value
     */
    setElementsHeight(value: number): void {
      shield.setElementsHeight(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件角度
     *
     * @param value
     */
    setElementsAngle(value: number): void {
      shield.setElementsAngle(toRaw(this.selectedElements), value);
    },

    /**
     * 设置圆角
     *
     * @param value
     * @param index
     */
    setElementsCorners(value: number, index?: number): void {
      shield.setElementsCorners(toRaw(this.selectedElements), value, index);
    },

    /**
     * 设置组件Y倾斜角度
     *
     * @param value
     */
    setElementsLeanYAngle(value: number): void {
      shield.setElementsLeanYAngle(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件边框类型
     *
     * @param value
     * @param index
     */
    setElementsStrokeType(value: StrokeTypes, index: number): void {
      shield.setElementsStrokeType(toRaw(this.selectedElements), value, index);
    },

    /**
     * 设置组件边框宽度
     *
     * @param value
     * @param index
     */
    setElementsStrokeWidth(value: number, index: number): void {
      shield.setElementsStrokeWidth(toRaw(this.selectedElements), value, index);
    },

    /**
     * 设置组件边框颜色
     *
     * @param value
     * @param index
     */
    setElementsStrokeColor(value: string, index: number): void {
      shield.setElementsStrokeColor(toRaw(this.selectedElements), value, index);
    },

    /**
     * 设置组件边框颜色透明度
     *
     * @param value
     * @param index
     */
    setElementsStrokeColorOpacity(value: number, index: number): void {
      shield.setElementsStrokeColorOpacity(toRaw(this.selectedElements), value, index);
    },

    /**
     *  添加组件描边
     *
     * @param prevIndex 添加描边的索引位置（从0开始）
     */
    addElementsStroke(prevIndex: number): void {
      shield.addElementsStroke(toRaw(this.selectedElements), prevIndex);
    },

    /**
     * 删除组件描边
     *
     * @param index 删除描边的索引位置（从0开始）
     */
    removeElementsStroke(index: number): void {
      shield.removeElementsStroke(toRaw(this.selectedElements), index);
    },

    /**
     * 设置组件填充颜色
     *
     * @param value
     * @param index
     */
    setElementsFillColor(value: string, index: number): void {
      shield.setElementsFillColor(toRaw(this.selectedElements), value, index);
    },

    /**
     * 设置组件填充颜色透明度
     *
     * @param value
     * @param index
     */
    setElementsFillColorOpacity(value: number, index: number): void {
      shield.setElementsFillColorOpacity(toRaw(this.selectedElements), value, index);
    },

    /**
     * 添加组件填充
     *
     * @param prevIndex
     */
    addElementsFill(prevIndex: number): void {
      shield.addElementsFill(toRaw(this.selectedElements), prevIndex);
    },

    /**
     * 删除组件填充
     *
     * @param index
     */
    removeElementsFill(index: number): void {
      shield.removeElementsFill(toRaw(this.selectedElements), index);
    },

    /**
     * 设置组件文本对齐方式
     *
     * @param value
     */
    setElementsTextAlign(value: CanvasTextAlign): void {
      shield.setElementsTextAlign(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件文本垂直对齐方式

     * @param value
     */
    setElementsTextVerticalAlign(value: TextVerticalAlign): void {
      shield.setElementsTextVerticalAlign(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件文本基线

     * @param value
     */
    setElementsTextBaseline(value: CanvasTextBaseline): void {
      shield.setElementsTextBaseline(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件字体大小
     *
     * @param value
     */
    setElementsFontSize(value: number): void {
      shield.setElementsFontSize(toRaw(this.selectedElements), value);
    },

    /**
     * 设置组件字体
     *
     * @param value
     */
    setElementsFontFamily(value: string): void {
      shield.setElementsFontFamily(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字体行高
     *
     * @param value
     */
    setElementsFontLineHeight(value: number): void {
      shield.setElementsFontLineHeight(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字体行高倍数
     *
     * @param value
     */
    setElementsFontLineHeightFactor(value: number): void {
      shield.setElementsFontLineHeightFactor(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字体行高自动适应
     *
     * @param value
     */
    setElementsFontLineHeightAutoFit(value: boolean): void {
      shield.setElementsFontLineHeightAutoFit(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字体颜色
     *
     * @param value
     */
    setElementsFontColor(value: string): void {
      shield.setElementsFontColor(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字体颜色透明度
     *
     * @param value
     */
    setElementsFontColorOpacity(value: number): void {
      shield.setElementsFontColorOpacity(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件字间距
     *
     * @param value
     */
    setElementsFontLetterSpacing(value: number): void {
      shield.setElementsFontLetterSpacing(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件文本装饰
     *
     * @param value
     */
    setElementsTextDecoration(value: TextDecoration): void {
      shield.setElementsTextDecoration(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件文本装饰颜色
     *
     * @param value
     */
    setElementsTextDecorationColor(value: string): void {
      shield.setElementsTextDecorationColor(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件文本装饰透明度
     *
     * @param value
     */
    setElementsTextDecorationOpacity(value: number): void {
      shield.setElementsTextDecorationOpacity(toRaw(this.selectedElements), value);
    },
    /**
     * 设置组件文本装饰粗细
     *
     * @param value
     */
    setElementsTextDecorationThickness(value: number): void {
      shield.setElementsTextDecorationThickness(toRaw(this.selectedElements), value);
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
      shield.setElementsRatioLocked(toRaw(this.selectedElements), value);
    },
    /**
     * 左侧对齐
     */
    setElementsAlignLeft(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignLeft(toRaw(this.selectedElements));
    },
    /**
     * 水平居中对齐
     */
    setElementsAlignCenter(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignCenter(toRaw(this.selectedElements));
    },
    /**
     * 右侧对齐
     */
    setElementsAlignRight(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignRight(toRaw(this.selectedElements));
    },
    /**
     * 顶部对齐
     */
    setElementsAlignTop(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignTop(toRaw(this.selectedElements));
    },
    /**
     * 垂直居中对齐
     */
    setElementsAlignMiddle(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignMiddle(toRaw(this.selectedElements));
    },
    /**
     * 底部对齐
     */
    setElementsAlignBottom(): void {
      if (!this.alignEnable) return;
      shield.setElementsAlignBottom(toRaw(this.selectedElements));
    },
    /**
     * 水平均分对齐
     */
    setElementsAverageVertical(): void {
      if (!this.averageEnable) return;
      shield.setElementsAverageVertical(toRaw(this.selectedElements));
    },
    /**
     * 垂直平均分对齐
     */
    setElementsAverageHorizontal(): void {
      if (!this.averageEnable) return;
      shield.setElementsAverageHorizontal(toRaw(this.selectedElements));
    },
    /**
     * 组件下移
     *
     * @returns
     */
    setElementsGoDown(): void {
      if (!this.layerGoDownEnable) return;
      shield.setElementsGoDown(toRaw(this.selectedElements));
    },
    /**
     * 组件上移
     *
     * @returns
     */
    setElementsShiftMove(): void {
      if (!this.layerShiftMoveEnable) return;
      shield.setElementsShiftMove(toRaw(this.selectedElements));
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
    /**
     * 设置组件段落间距
     *
     * @param value
     */
    setElementsParagraphSpacing(value: number): void {
      shield.setElementsParagraphSpacing(toRaw(this.selectedElements), value);
    },
  },
});
